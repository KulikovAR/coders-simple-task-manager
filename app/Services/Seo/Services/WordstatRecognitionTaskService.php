<?php

namespace App\Services\Seo\Services;

use App\Models\WordstatRecognitionTask;
use App\Jobs\ProcessWordstatRecognitionJob;
use Illuminate\Support\Facades\Auth;

class WordstatRecognitionTaskService
{
    public function createTask(int $siteId): WordstatRecognitionTask
    {
        $task = WordstatRecognitionTask::create([
            'user_id' => Auth::id(),
            'site_id' => $siteId,
            'status' => 'pending',
        ]);

        ProcessWordstatRecognitionJob::dispatch($task);

        return $task;
    }

    public function getActiveTaskForSite(int $siteId): ?WordstatRecognitionTask
    {
        return WordstatRecognitionTask::where('user_id', Auth::id())
            ->where('site_id', $siteId)
            ->whereIn('status', ['pending', 'processing'])
            ->latest()
            ->first();
    }

    public function getTaskStatus(int $taskId): ?WordstatRecognitionTask
    {
        return WordstatRecognitionTask::where('user_id', Auth::id())
            ->where('id', $taskId)
            ->first();
    }

    public function getUserActiveTasks(): array
    {
        return WordstatRecognitionTask::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function cleanupOldTasks(): void
    {
        WordstatRecognitionTask::where('created_at', '<', now()->subDays(7))
            ->where('status', 'completed')
            ->delete();
    }
}
