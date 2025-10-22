<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Services\Seo\DTOs\TrackPositionsDTO;
use Illuminate\Support\Facades\Log;

class SeoRecognitionService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService
    ) {}

    public function processRecognitionTask(SeoRecognitionTask $task): void
    {
        try {
            Log::info("Starting SEO recognition processing", [
                'task_id' => $task->id,
                'site_id' => $task->site_id,
                'user_id' => $task->user_id
            ]);

            $task->update([
                'status' => 'processing',
                'started_at' => now(),
            ]);

            $site = $this->siteService->getSite($task->site_id);
            if (!$site) {
                throw new \Exception("Site not found: {$task->site_id}");
            }

            $keywords = $this->microserviceClient->getKeywords($task->site_id);
            $totalKeywords = count($keywords);

            $task->update([
                'total_keywords' => $totalKeywords,
            ]);

            if ($totalKeywords === 0) {
                $task->update([
                    'status' => 'completed',
                    'completed_at' => now(),
                ]);
                return;
            }

            $searchEngines = $site->searchEngines;
            $successfulEngines = 0;


            Log::info("SearchEngines", compact('searchEngines'));

            foreach ($searchEngines as $searchEngine) {
                $trackData = $this->buildTrackDataForEngine($site, $searchEngine);

                $result = $this->callMicroserviceMethod($searchEngine, $trackData->toArray());

                if ($result) {
                    $successfulEngines++;
                } else {
                    throw new \Exception("Failed to track positions for search engine: {$searchEngine}");
                }

                $task->update([
                    'processed_keywords' => $totalKeywords * $successfulEngines,
                ]);
            }

            $this->processWordstatIfEnabled($site, $task, $totalKeywords, $successfulEngines);

            $task->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            Log::info("SEO recognition processing completed successfully", [
                'task_id' => $task->id,
                'site_id' => $task->site_id,
                'processed_keywords' => $totalKeywords * $successfulEngines
            ]);

        } catch (\Exception $e) {
            Log::error("SEO recognition processing failed", [
                'task_id' => $task->id,
                'site_id' => $task->site_id,
                'error' => $e->getMessage(),
            ]);

            $task->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            throw $e;
        }
    }

    private function getSearchEnginesForTask(SeoRecognitionTask $task, $site): array
    {
        $searchEngines = $task->search_engines;

        if (empty($searchEngines)) {
            $searchEngines = $site->searchEngines;
        }

        if (empty($searchEngines)) {
            $searchEngines = ['google'];
        }

        return $searchEngines;
    }

    private function buildTrackDataForEngine($site, string $searchEngine): TrackPositionsDTO
    {
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice($searchEngine),
            source: $searchEngine,
            country: $site->getCountry($searchEngine),
            os: $site->getOs($searchEngine),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains()
        );
    }

    private function buildWordstatTrackData($site): TrackPositionsDTO
    {
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: null,
            source: 'wordstat',
            country: null,
            lang: null,
            os: null,
            ads: false,
            pages: 1,
            subdomains: null
        );
    }

    private function callMicroserviceMethod(string $searchEngine, array $trackData): bool
    {
        return match ($searchEngine) {
            'google' => $this->microserviceClient->trackGooglePositions($trackData),
            'yandex' => $this->microserviceClient->trackYandexPositions($trackData),
            'wordstat' => $this->microserviceClient->trackWordstatPositions($trackData),
            default => $this->microserviceClient->trackSitePositionsWithFilters($trackData),
        };
    }

    private function processWordstatIfEnabled($site, SeoRecognitionTask $task, int $totalKeywords, int $successfulEngines): void
    {
        if ($site->wordstatEnabled) {
            $wordstatTrackData = $this->buildWordstatTrackData($site);
            $wordstatResult = $this->callMicroserviceMethod('wordstat', $wordstatTrackData->toArray());

            if ($wordstatResult) {
                $task->update([
                    'processed_keywords' => $totalKeywords * ($successfulEngines + 1),
                ]);
            }
        }
    }
}


