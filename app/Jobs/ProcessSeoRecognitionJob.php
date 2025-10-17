<?php

namespace App\Jobs;

use App\Models\SeoRecognitionTask;
use App\Services\Seo\Services\MicroserviceClient;
use App\Services\Seo\Services\PositionTrackingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Support\Facades\Log;

class ProcessSeoRecognitionJob implements ShouldQueue
{
    use BusQueueable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public SeoRecognitionTask $task
    ) {
        $this->onQueue('seo-recognition');
    }

    public function handle(
        MicroserviceClient $microserviceClient,
        PositionTrackingService $positionTrackingService
    ): void {
        try {
            Log::info("Starting SEO recognition job", [
                'task_id' => $this->task->id,
                'site_id' => $this->task->site_id,
                'user_id' => $this->task->user_id
            ]);

            $this->task->update([
                'status' => 'processing',
                'started_at' => now(),
            ]);

            $keywords = $microserviceClient->getKeywords($this->task->site_id);
            $totalKeywords = count($keywords);

            $this->task->update([
                'total_keywords' => $totalKeywords,
            ]);

            if ($totalKeywords === 0) {
                $this->task->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
                return;
            }

            $searchEngines = $this->task->search_engines ?: ['google'];
            $successfulEngines = 0;

            foreach ($searchEngines as $searchEngine) {
                $trackData = $this->buildTrackData($searchEngine);
                $result = $microserviceClient->trackSitePositionsWithFilters($trackData);

                if ($result) {
                    $successfulEngines++;
                } else {
                    throw new \Exception("Failed to track positions for search engine: {$searchEngine}");
                }

                $this->task->update([
                    'processed_keywords' => $totalKeywords * $successfulEngines,
                ]);
            }

            $this->task->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            Log::info("SEO recognition job completed successfully", [
                'task_id' => $this->task->id,
                'site_id' => $this->task->site_id,
                'processed_keywords' => $totalKeywords * $successfulEngines
            ]);

        } catch (\Exception $e) {
            Log::error("SEO recognition job failed", [
                'task_id' => $this->task->id,
                'site_id' => $this->task->site_id,
                'error' => $e->getMessage(),
                'attempt' => $this->attempts()
            ]);

            $this->task->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            throw $e;
        }
    }

    private function buildTrackData(string $searchEngine): array
    {
        return [
            'site_id' => $this->task->site_id,
            'device' => 'desktop',
            'source' => $searchEngine,
            'country' => 'ru',
            'os' => null,
            'ads' => false,
            'pages' => 1,
            'subdomains' => false,
        ];
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