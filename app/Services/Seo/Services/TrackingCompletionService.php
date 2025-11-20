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

            $seoTask = $this->findSearchTask($taskId);
            $wordstatTask = $this->findWordstatTask($taskId);

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
        $jobId = $message['job_id'] ?? $message['task_id'] ?? null;
        $percent = (int)($message['percent'] ?? null);
        $normalizedStatus = $this->normalizeStatus($status);
        $jobs = $task->getExternalJobIds();

        $task->initEngineStates($jobs);
        $engineStates = $task->getEngineStates();

        if ($jobId) {
            $engineStates[$jobId] = [
                'percent' => max($engineStates[$jobId]['percent'] ?? 0, $this->clampPercent($percent)),
                'status' => $normalizedStatus
            ];
        }

        $aggregatedPercent = $this->getAggregatedPercent($jobs, $engineStates);
        $allCompleted = $this->isJobsCompleted($jobs, $engineStates);

        $updateData = ['engine_states' => $engineStates];

        if ($normalizedStatus === 'failed') {
            $updateData['status'] = 'failed';
            $updateData['error_message'] = $message['error'] ?? 'Tracking failed';
            $updateData['completed_at'] = now();
            $updateData['progress_percent'] = $aggregatedPercent;
        } elseif ($allCompleted) {
            $updateData['status'] = 'completed';
            $updateData['progress_percent'] = 100;
            $updateData['processed_keywords'] = $task->total_keywords;
            $updateData['completed_at'] = now();
        } else {
            $updateData['status'] = 'processing';
            $updateData['progress_percent'] = $aggregatedPercent;
        }

        $task->update($updateData);

        Log::info('SEO task updated!', [
            'task_id' => $task->id,
            'site_id' => $task->site_id,
            'external_task_id' => $task->external_task_id,
            'status' => $updateData['status'],
            'progress_percent' => $updateData['progress_percent'],
            'engine_states' => $engineStates,
        ]);
    }

    private function clampPercent(int $percent): int
    {
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
            if ($task->status !== 'completed' && $task->status !== 'failed') {
                $updateData['status'] = 'processing';
            }
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

    /**
     * @param mixed $taskId
     * @return SeoRecognitionTask
     */
    private function findSearchTask(mixed $taskId): SeoRecognitionTask
    {
        $seoTask = SeoRecognitionTask::where('external_task_id', $taskId)->first();

        if (!$seoTask) {
            $seoTask = SeoRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
        }

        return $seoTask;
    }

    /**
     * @param mixed $taskId
     * @return WordstatRecognitionTask
     */
    private function findWordstatTask(mixed $taskId): WordstatRecognitionTask
    {
        $wordstatTask = WordstatRecognitionTask::where('external_task_id', $taskId)->first();

        if (!$wordstatTask) {
            $wordstatTask = WordstatRecognitionTask::whereRaw("FIND_IN_SET(?, external_task_id)", [$taskId])->first();
        }

        return $wordstatTask;
    }

    /**
     * @param array $jobs
     * @param array $engineStates
     * @return int
     */
    private function getAggregatedPercent(array $jobs, array $engineStates): int
    {
        $totalPercent = 0;
        foreach ($jobs as $jid) {
            $totalPercent += $engineStates[$jid]['percent'] ?? 0;
        }

        return (int)floor($totalPercent / max(1, count($jobs)));
    }

    /**
     * @param array $jobs
     * @param array $engineStates
     * @return bool
     */
    private function isJobsCompleted(array $jobs, array $engineStates): bool
    {
        $allCompleted = true;
        foreach ($jobs as $jid) {
            if (($engineStates[$jid]['status'] ?? '') !== 'completed') {
                $allCompleted = false;
                break;
            }
        }
        return $allCompleted;
    }
}
