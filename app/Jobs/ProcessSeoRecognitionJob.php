<?php

namespace App\Jobs;

use App\Models\SeoRecognitionTask;
use App\Services\Seo\Services\SeoRecognitionService;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessSeoRecognitionJob implements ShouldQueue
{
    use BusQueueable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public SeoRecognitionTask $task
    )
    {
        $this->onQueue('seo-recognition');
    }

    public function handle(SeoRecognitionService $seoRecognitionService): void
    {
        $seoRecognitionService->processRecognitionTask($this->task);
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SEO recognition job permanently failed", [
            'task_id' => $this->task->id,
            'site_id' => $this->task->site_id,
            'error' => $exception->getMessage()
        ]);

        $this->task->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'completed_at' => now(),
        ]);
    }
}
