<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Models\WordstatRecognitionTask;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TrackingCompletionService
{
    // TTL для кеша отложенных сообщений (в секундах)
    private const PENDING_MESSAGE_TTL = 3600; // 1 час

    public function handleTrackingCompletion(array $message): void
    {
        try {
            $taskId = $message['job_id'] ?? $message['task_id'] ?? null;
            $status = $message['status'] ?? null;

            if (!$taskId) {
                Log::warning('Received tracking completion message without job_id or task_id', [
                    'message' => $message
                ]);
                return;
            }

            Log::info('Processing tracking completion', [
                'external_task_id' => $taskId,
                'status' => $status,
            ]);

            // Ищем задачу прямо по полю external_task_id
            $seoTask = SeoRecognitionTask::where('external_task_id', $taskId)->first();
            $wordstatTask = WordstatRecognitionTask::where('external_task_id', $taskId)->first();

            // Если не нашли, пробуем FIND_IN_SET (в случае, когда external_task_id — csv)
            if (!$seoTask) {
                $seoTask = SeoRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
            }
            if (!$wordstatTask) {
                $wordstatTask = WordstatRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
            }

            if ($seoTask) {
                // Если есть отложенные сообщения для job-идентификаторов этой задачи — применяем их сначала
                $this->processPendingMessagesForTask($seoTask);

                // Теперь обработаем текущее сообщение
                $this->updateSeoTask($seoTask, $status, $message);
            } elseif ($wordstatTask) {
                $this->updateWordstatTask($wordstatTask, $status, $message);
            } else {
                // Если не нашли — кешируем сообщение чтобы применить его, когда задача появится
                $this->cachePendingMessage($taskId, $message);
                Log::warning('No task found for external_task_id (cached message)', [
                    'external_task_id' => $taskId,
                    'message' => $message
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to process tracking completion', [
                'message' => $message,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Обработка и применение отложенных сообщений для уже сохранённой задачи.
     * Берём все job_id из external_task_id и ищем в кеше соответствующие сообщения.
     */
    private function processPendingMessagesForTask(SeoRecognitionTask $task): void
    {
        if (empty($task->external_task_id)) {
            return;
        }

        $allJobIds = array_values(array_filter(array_map('trim', explode(',', $task->external_task_id))));
        if (empty($allJobIds)) {
            return;
        }

        foreach ($allJobIds as $jid) {
            $pending = $this->getPendingMessages($jid);
            if (empty($pending)) {
                continue;
            }

            // Применяем сообщения в порядке добавления
            foreach ($pending as $msg) {
                try {
                    // лог: какой job ид и сообщение применяем
                    Log::info('Applying cached pending message for job', ['job_id' => $jid, 'message' => $msg]);

                    // Обновляем задачу соответствующим сообщением
                    $this->updateSeoTask($task, $msg['status'] ?? null, $msg);
                } catch (\Exception $e) {
                    Log::error('Failed to apply cached pending message', [
                        'job_id' => $jid,
                        'error' => $e->getMessage(),
                        'message' => $msg
                    ]);
                }
            }

            // После применения — удаляем кеш для этого job
            $this->deletePendingMessages($jid);
        }
    }

    /**
     * Кешируем сообщение, если задача ещё не создана/не привязана.
     */
    private function cachePendingMessage(string $jobId, array $message): void
    {
        try {
            $key = $this->pendingKey($jobId);
            // Получаем существующие, добавляем текущее в конец
            $arr = Cache::get($key, []);
            $arr[] = $message;
            Cache::put($key, $arr, self::PENDING_MESSAGE_TTL);
            Log::info('Cached pending tracking message', ['job_id' => $jobId, 'key' => $key, 'count' => count($arr)]);
        } catch (\Exception $e) {
            Log::error('Failed to cache pending tracking message', [
                'job_id' => $jobId,
                'error' => $e->getMessage(),
                'message' => $message
            ]);
        }
    }

    private function getPendingMessages(string $jobId): array
    {
        try {
            $key = $this->pendingKey($jobId);
            $arr = Cache::get($key, []);
            return is_array($arr) ? $arr : [];
        } catch (\Exception $e) {
            Log::error('Failed to get pending messages from cache', ['job_id' => $jobId, 'error' => $e->getMessage()]);
            return [];
        }
    }

    private function deletePendingMessages(string $jobId): void
    {
        try {
            $key = $this->pendingKey($jobId);
            Cache::forget($key);
        } catch (\Exception $e) {
            Log::error('Failed to delete pending messages from cache', ['job_id' => $jobId, 'error' => $e->getMessage()]);
        }
    }

    private function pendingKey(string $jobId): string
    {
        return "seo:pending_messages:{$jobId}";
    }

    private function updateSeoTask(SeoRecognitionTask $task, ?string $status, array $message): void
    {
        $jobId = $message['job_id'] ?? $message['task_id'] ?? null;
        $percent = isset($message['percent']) ? (int)$message['percent'] : 0;
        $normalizedStatus = $this->normalizeStatus($status);

        // Получаем все job_id для текущей задачи
        $allJobIds = !empty($task->external_task_id)
            ? array_values(array_filter(array_map('trim', explode(',', $task->external_task_id))))
            : [];

        $engineCount = count($allJobIds) ?: 1;

        // Берём текущее состояние движков или инициализируем пустое
        $engineStates = is_array($task->engine_states) ? $task->engine_states : [];

        // Инициализируем движки, которых ещё нет
        foreach ($allJobIds as $jid) {
            if (!isset($engineStates[$jid])) {
                $engineStates[$jid] = ['percent' => 0, 'status' => 'processing'];
            }
        }

        // Обновляем состояние текущего движка
        if ($jobId) {
            // Никогда не уменьшаем прогресс старше сохранённого
            $engineStates[$jobId] = [
                'percent' => max($engineStates[$jobId]['percent'] ?? 0, $this->clampPercent($percent)),
                'status' => $normalizedStatus === 'completed' || $normalizedStatus === 'failed'
                            ? $normalizedStatus
                            : ($engineStates[$jobId]['status'] ?? 'processing'),
            ];
        }

        // Вычисляем агрегированный прогресс как среднее
        $totalPercent = 0;
        if (!empty($allJobIds)) {
            foreach ($allJobIds as $jid) {
                $totalPercent += $engineStates[$jid]['percent'] ?? 0;
            }
        } else {
            // fallback: если нет allJobIds, берём известные состояния (или текущий percent)
            if (!empty($engineStates)) {
                foreach ($engineStates as $st) {
                    $totalPercent += $st['percent'] ?? 0;
                }
                $engineCount = max(1, count($engineStates));
            } else {
                $totalPercent = $this->clampPercent($percent);
                $engineCount = 1;
            }
        }

        $aggregated = (int) floor($totalPercent / max(1, $engineCount));

        // Статус completed только если все движки завершены
        $allCompleted = true;
        if (!empty($allJobIds)) {
            foreach ($allJobIds as $jid) {
                if (($engineStates[$jid]['status'] ?? '') !== 'completed') {
                    $allCompleted = false;
                    break;
                }
            }
        } else {
            // если нет явных job list, проверяем по состояниям
            foreach ($engineStates as $st) {
                if (($st['status'] ?? '') !== 'completed') {
                    $allCompleted = false;
                    break;
                }
            }
        }

        $updateData = ['engine_states' => $engineStates];

        if ($normalizedStatus === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
            $updateData['completed_at'] = now();
            $updateData['progress_percent'] = $aggregated;
        } elseif ($allCompleted) {
            $updateData['status'] = 'completed';
            $updateData['progress_percent'] = 100;
            $updateData['processed_keywords'] = $task->total_keywords;
            $updateData['completed_at'] = now();
        } else {
            $updateData['status'] = 'processing';
            $updateData['progress_percent'] = $aggregated;
        }

        $task->update($updateData);

        Log::info('SEO task updated', [
            'task_id' => $task->id,
            'site_id' => $task->site_id,
            'external_task_id' => $task->external_task_id,
            'status' => $updateData['status'],
            'progress_percent' => $updateData['progress_percent'] ?? $task->progress_percent,
            'engine_states' => $engineStates,
        ]);
    }

    private function clampPercent(?int $percent): int
    {
        if ($percent === null) return 0;
        return max(0, min(100, $percent));
    }

    private function normalizeStatus(?string $status): ?string
    {
        if (!$status) return null;
        $map = [
            'running' => 'processing',
            'in_progress' => 'processing',
            'processing' => 'processing',
            'completed' => 'completed',
            'done' => 'completed',
            'failed' => 'failed',
            'error' => 'failed',
        ];
        $key = strtolower($status);
        return $map[$key] ?? $key;
    }

    private function updateWordstatTask(WordstatRecognitionTask $task, string $status, array $message): void
    {
        $updateData = [];

        if ($status === 'completed') {
            $updateData['status'] = 'completed';
            $updateData['processed_keywords'] = $task->total_keywords;
            $updateData['progress_percent'] = 100;
            $updateData['completed_at'] = now();
        } elseif ($status === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
            $updateData['completed_at'] = now();
        } elseif ($status === 'running' || isset($message['percent'])) {
            // Обновляем статус на processing, если задача еще не завершена
            if ($task->status !== 'completed' && $task->status !== 'failed') {
                $updateData['status'] = 'processing';
            }
            // Обновляем проценты, если они есть в сообщении
            if (isset($message['percent'])) {
                $updateData['progress_percent'] = $message['percent'];
            }
        } else {
            Log::info('Received unknown status for Wordstat task', [
                'task_id' => $task->id,
                'external_task_id' => $task->external_task_id,
                'status' => $status
            ]);
            return;
        }

        $task->update($updateData);

        Log::info('Wordstat task updated', [
            'task_id' => $task->id,
            'external_task_id' => $task->external_task_id,
            'status' => $status,
            'progress_percent' => $updateData['progress_percent'] ?? $task->progress_percent,
            'site_id' => $task->site_id
        ]);
    }
}