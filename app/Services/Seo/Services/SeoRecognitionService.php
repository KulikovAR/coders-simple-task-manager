<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Services\Seo\DTOs\TrackPositionsDTO;
use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Support\Facades\Log;

class SeoRecognitionService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService,
        private UserXmlApiSettingsService $xmlApiSettingsService
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
            $externalTaskIds = [];

            Log::info("SearchEngines", compact('searchEngines'));

            foreach ($searchEngines as $searchEngine) {
                $trackData = $this->buildTrackDataForEngine($site, $searchEngine, $task->user_id);
                Log::info("Track Data", compact('searchEngine', 'trackData'));
                $result = $this->callMicroserviceMethod($searchEngine, $trackData->toArray());

                if ($result && isset($result['task_id'])) {
                    $successfulEngines++;
                    $externalTaskIds[] = $result['task_id'];
                    
                    Log::info("Tracking started successfully", [
                        'search_engine' => $searchEngine,
                        'external_task_id' => $result['task_id'],
                        'task_id' => $task->id
                    ]);
                } else {
                    throw new \Exception("Failed to track positions for search engine: {$searchEngine}");
                }
            }

            $task->update([
                'external_task_id' => implode(',', $externalTaskIds),
                'processed_keywords' => $totalKeywords * $successfulEngines,
            ]);

            Log::info("All tracking requests sent successfully", [
                'task_id' => $task->id,
                'site_id' => $task->site_id,
                'successful_engines' => $successfulEngines,
                'external_task_ids' => $externalTaskIds
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

    private function buildTrackDataForEngine($site, string $searchEngine, int $userId): TrackPositionsDTO
    {
        return match ($searchEngine) {
            'google' => $this->buildGoogleTrackData($site, $userId),
            'yandex' => $this->buildYandexTrackData($site, $userId),
            default => $this->buildDefaultTrackData($site, $searchEngine)
        };
    }

    private function buildGoogleTrackData($site, int $userId): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiDataForUser($userId);
        
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice('google'),
            source: 'google',
            country: $site->getCountry('google'),
            os: $site->getOs('google'),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains(),
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null
        );
    }

    private function buildYandexTrackData($site, int $userId): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiDataForUser($userId);
        
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $site->getDevice('yandex'),
            source: 'yandex',
            country: $site->getCountry('yandex'),
            os: $site->getOs('yandex'),
            ads: $site->getAds(),
            pages: 1,
            subdomains: $site->getSubdomains(),
            lr: $site->getYandexRegion(),
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null
        );
    }

    private function buildDefaultTrackData($site, string $searchEngine): TrackPositionsDTO
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

    private function buildWordstatTrackData($site, int $userId): TrackPositionsDTO
    {
        $wordstatApiData = $this->xmlApiSettingsService->getWordstatApiDataForUser($userId);
        
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: null,
            source: 'wordstat',
            country: null,
            lang: null,
            os: null,
            ads: false,
            pages: 1,
            subdomains: null,
            regions: $site->getWordstatRegion(),
            xmlApiKey: $wordstatApiData['apiKey'] ?: null,
            xmlBaseUrl: $wordstatApiData['baseUrl'] ?: null,
            xmlUserId: $wordstatApiData['userId'] ?: null
        );
    }

    private function callMicroserviceMethod(string $searchEngine, array $trackData): ?array
    {
        return match ($searchEngine) {
            'google' => $this->microserviceClient->trackGooglePositions($trackData),
            'yandex' => $this->microserviceClient->trackYandexPositions($trackData),
            'wordstat' => $this->microserviceClient->trackWordstatPositions($trackData),
            default => $this->microserviceClient->trackSitePositionsWithFilters($trackData),
        };
    }

}


