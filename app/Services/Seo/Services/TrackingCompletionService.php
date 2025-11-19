<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Models\WordstatRecognitionTask;
use Illuminate\Support\Facades\Log;

class TrackingCompletionService
{
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
                'status' => $status
            ]);

            $seoTask = SeoRecognitionTask::where('external_task_id', $taskId)->first();
            $wordstatTask = WordstatRecognitionTask::where('external_task_id', $taskId)->first();

            if (!$seoTask) {
                $seoTask = SeoRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
            }
            if (!$wordstatTask) {
                $wordstatTask = WordstatRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
            }

            if ($seoTask) {
                $this->updateSeoTask($seoTask, $status, $message);
            } elseif ($wordstatTask) {
                $this->updateWordstatTask($wordstatTask, $status, $message);
            } else {
                Log::warning('No task found for external_task_id', [
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

    private function updateSeoTask(SeoRecognitionTask $task, string $status, array $message): void
    {
        $updateData = [];

        $jobId = $message['job_id'] ?? $message['task_id'] ?? null;
        $percent = isset($message['percent']) ? (int) $message['percent'] : null;
        $normalizedStatus = $this->normalizeStatus($status);

        $allJobIds = [];
        if (!empty($task->external_task_id)) {
            $allJobIds = array_values(array_filter(array_map('trim', explode(',', $task->external_task_id))));
        }
        // Если внешний список не установлен, попробуем оценить по количеством engines
        $engineCount = count($allJobIds) ?: (is_array($task->search_engines) ? count($task->search_engines) : 1);

        // Инициализация состояний движков
        $engineStates = is_array($task->engine_states) ? $task->engine_states : [];

        if ($jobId) {
            $engineStates[$jobId] = [
                'percent' => $this->clampPercent($percent ?? ($engineStates[$jobId]['percent'] ?? 0)),
                'status' => $normalizedStatus ?? ($engineStates[$jobId]['status'] ?? 'running'),
            ];
        }

        // Считаем агрегированный процент
        $sum = 0;
        if (!empty($allJobIds)) {
            foreach ($allJobIds as $jid) {
                $p = $engineStates[$jid]['percent'] ?? 0;
                $sum += $this->clampPercent($p);
            }
        } else {
            // Нет фиксированного списка job_id — усредняем по известным состояниям или по количеству engines
            if (!empty($engineStates)) {
                foreach ($engineStates as $st) {
                    $sum += $this->clampPercent($st['percent'] ?? 0);
                }
                // Если их меньше, чем ожидается по engines, недостающие считаем как 0
                $missing = max(0, $engineCount - count($engineStates));
                $sum += 0 * $missing;
            } else {
                $sum = $this->clampPercent($percent ?? 0); // fallback
            }
        }

        $aggregated = (int) floor($sum / max(1, $engineCount));
        // Не даём прогрессу падать
        $aggregated = max((int) ($task->progress_percent ?? 0), $aggregated);

        // Логика статуса: завершаем только если все engines завершены
        $allCompleted = false;
        if ($engineCount > 1) {
            $completedCount = 0;
            $targets = !empty($allJobIds) ? $allJobIds : array_keys($engineStates);
            foreach ($targets as $jid) {
                $st = $engineStates[$jid]['status'] ?? null;
                if ($st === 'completed') {
                    $completedCount++;
                }
            }
            $allCompleted = ($completedCount >= $engineCount);
        } else {
            // Один движок — полагаемся на пришедший статус
            $allCompleted = ($normalizedStatus === 'completed');
        }

        if ($normalizedStatus === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
            $updateData['completed_at'] = now();
        } elseif ($allCompleted) {
            $updateData['status'] = 'completed';
            $updateData['processed_keywords'] = $task->total_keywords;
            $aggregated = 100;
            $updateData['completed_at'] = now();
        } else {
            if ($task->status !== 'completed' && $task->status !== 'failed') {
                $updateData['status'] = 'processing';
            }
        }

        $updateData['engine_states'] = $engineStates;
        $updateData['progress_percent'] = $aggregated;

        $task->update($updateData);

        Log::info('SEO task updated', [
            'task_id' => $task->id,
            'site_id' => $task->site_id,
            'external_task_id' => $task->external_task_id,
            'status' => $updateData['status'] ?? $task->status,
            'progress_percent' => $updateData['progress_percent'] ?? $task->progress_percent,
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
