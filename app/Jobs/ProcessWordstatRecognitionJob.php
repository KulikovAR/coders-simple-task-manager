<?php

namespace App\Jobs;

use App\Models\WordstatRecognitionTask;
use App\Services\Seo\Services\WordstatRecognitionService;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessWordstatRecognitionJob implements ShouldQueue
{
    use BusQueueable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public WordstatRecognitionTask $task
    )
    {
        $this->onQueue('wordstat-recognition');
    }

    public function handle(WordstatRecognitionService $wordstatRecognitionService): void
    {
        $wordstatRecognitionService->processWordstatTask($this->task);

        if(env('APP_ENV') !== 'production') {
            $this->task->update([
                'status' => 'done',
            ]);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Wordstat recognition job permanently failed", [
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
