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
            $taskId = $message['task_id'] ?? null;
            $status = $message['status'] ?? null;
            
            if (!$taskId) {
                Log::warning('Received tracking completion message without task_id', [
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
        $updateData = [
            'completed_at' => now(),
        ];

        if ($status === 'completed') {
            $updateData['status'] = 'completed';
            $updateData['processed_keywords'] = $task->total_keywords;
        } elseif ($status === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
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
            'site_id' => $task->site_id
        ]);
    }

    private function updateWordstatTask(WordstatRecognitionTask $task, string $status, array $message): void
    {
        $updateData = [
            'completed_at' => now(),
        ];

        if ($status === 'completed') {
            $updateData['status'] = 'completed';
            $updateData['processed_keywords'] = $task->total_keywords;
        } elseif ($status === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
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
            'site_id' => $task->site_id
        ]);
    }
}
