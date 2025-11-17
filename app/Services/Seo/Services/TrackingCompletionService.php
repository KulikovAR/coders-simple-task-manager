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
            Log::info('Received unknown status for SEO task', [
                'task_id' => $task->id,
                'external_task_id' => $task->external_task_id,
                'status' => $status
            ]);
            return;
        }

        $task->update($updateData);

        Log::info('SEO task updated', [
            'task_id' => $task->id,
            'external_task_id' => $task->external_task_id,
            'status' => $status,
            'progress_percent' => $updateData['progress_percent'] ?? $task->progress_percent,
            'site_id' => $task->site_id
        ]);
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
