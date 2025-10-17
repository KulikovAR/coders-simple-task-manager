<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Jobs\ProcessSeoRecognitionJob;
use Illuminate\Support\Facades\Auth;

class RecognitionTaskService
{
    public function createTask(int $siteId, array $searchEngines = null): SeoRecognitionTask
    {
        $task = SeoRecognitionTask::create([
            'user_id' => Auth::id(),
            'site_id' => $siteId,
            'status' => 'pending',
            'search_engines' => $searchEngines ?: ['google'],
        ]);

        ProcessSeoRecognitionJob::dispatch($task);

        return $task;
    }

    public function getActiveTaskForSite(int $siteId): ?SeoRecognitionTask
    {
        return SeoRecognitionTask::where('user_id', Auth::id())
            ->where('site_id', $siteId)
            ->whereIn('status', ['pending', 'processing'])
            ->latest()
            ->first();
    }

    public function getTaskStatus(int $taskId): ?SeoRecognitionTask
    {
        return SeoRecognitionTask::where('user_id', Auth::id())
            ->where('id', $taskId)
            ->first();
    }

    public function getUserActiveTasks(): array
    {
        return SeoRecognitionTask::where('user_id', Auth::id())
            ->whereIn('status', ['pending', 'processing'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    public function cleanupOldTasks(): void
    {
        SeoRecognitionTask::where('created_at', '<', now()->subDays(7))
            ->where('status', 'completed')
            ->delete();
    }
}
