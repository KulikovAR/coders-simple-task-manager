<?php

namespace App\Services\Seo\Services;

use App\Models\SeoRecognitionTask;
use App\Models\SeoSite;
use App\Enums\GoogleDomainType;
use App\Enums\LanguageType;
use App\Services\Seo\DTOs\TrackPositionsDTO;
use App\Services\Seo\Services\UserXmlApiSettingsService;
use App\Services\Seo\Services\SeoSiteTargetService;
use App\Services\Seo\Services\GeoService;
use Illuminate\Support\Facades\Log;

class SeoRecognitionService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService,
        private UserXmlApiSettingsService $xmlApiSettingsService,
        private SeoSiteTargetService $targetService,
        private GeoService $geoService
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

            $localSite = SeoSite::where('go_seo_site_id', $site->id)->first();
            if (!$localSite) {
                throw new \Exception("Local site not found: {$site->id}");
            }

            $targets = $this->targetService->listForSite($localSite->id);
            $targetsByEngine = $targets->groupBy('search_engine');

            foreach ($searchEngines as $searchEngine) {
                $engineTargets = $targetsByEngine->get($searchEngine, collect());

                if ($engineTargets->isEmpty()) {
                    Log::warning("No targets found for search engine", [
                        'search_engine' => $searchEngine,
                        'site_id' => $site->id
                    ]);
                    continue;
                }

                foreach ($engineTargets as $target) {
                    $trackData = $this->buildTrackDataForTarget($site, $target, $task->user_id);
                    Log::info("Track Data", [
                        'search_engine' => $searchEngine,
                        'target_id' => $target->id,
                        'trackData' => $trackData
                    ]);
                    $result = $this->callMicroserviceMethod($searchEngine, $trackData->toArray());

                    if ($result && isset($result['task_id'])) {
                        $successfulEngines++;
                        $externalTaskIds[] = $result['task_id'];

                        Log::info("Tracking started successfully", [
                            'search_engine' => $searchEngine,
                            'target_id' => $target->id,
                            'external_task_id' => $result['task_id'],
                            'task_id' => $task->id
                        ]);
                    } else {
                        Log::error("Failed to track positions", [
                            'search_engine' => $searchEngine,
                            'target_id' => $target->id
                        ]);
                    }
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

    private function buildTrackDataForTarget($site, $target, int $userId): TrackPositionsDTO
    {
        if ($target->search_engine === 'google') {
            return $this->buildGoogleTrackData($site, $target, $userId);
        } elseif ($target->search_engine === 'yandex') {
            return $this->buildYandexTrackData($site, $target, $userId);
        }

        return $this->buildDefaultTrackData($site, $target);
    }

    private function calculatePagesForPositionLimit(?int $positionLimit): int
    {
        if ($positionLimit === null || $positionLimit <= 0) {
            return 1;
        }

        return (int)ceil($positionLimit / 10);
    }

    private function buildGoogleTrackData($site, $target, int $userId): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiDataForUser($userId);

        $country = null;
        if ($target->region) {
            $region = $this->geoService->getAllRegions($target->region)
                ->firstWhere('name', $target->region)
                ?? $this->geoService->getAllRegions($target->region)
                    ->firstWhere('canonical_name', $target->region);

            if ($region) {
                $country = (string)$region->criteria_id;
            }
        }

        $lang = null;
        if ($target->language) {
            $language = LanguageType::tryFrom($target->language);
            if ($language) {
                $lang = $language->getId();
            }
        }

        $domain = null;
        if ($target->domain) {
            $googleDomain = GoogleDomainType::tryFrom($target->domain);
            if ($googleDomain) {
                $domain = $googleDomain->getId();
            }
        }

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $target->device,
            source: 'google',
            country: $country,
            lang: $lang,
            os: $target->os,
            ads: $site->getAds(),
            pages: $this->calculatePagesForPositionLimit($site->positionLimit),
            subdomains: $site->getSubdomains(),
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null,
            domain: $domain
        );
    }

    private function buildYandexTrackData($site, $target, int $userId): TrackPositionsDTO
    {
        $googleApiData = $this->xmlApiSettingsService->getGoogleApiDataForUser($userId);

        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $target->device,
            source: 'yandex',
            country: null,
            lang: null,
            os: $target->os,
            ads: $site->getAds(),
            pages: $this->calculatePagesForPositionLimit($site->positionLimit),
            subdomains: $site->getSubdomains(),
            lr: $target->lr,
            xmlApiKey: $googleApiData['apiKey'] ?: null,
            xmlBaseUrl: $googleApiData['baseUrl'] ?: null,
            xmlUserId: $googleApiData['userId'] ?: null
        );
    }

    private function buildDefaultTrackData($site, $target): TrackPositionsDTO
    {
        return new TrackPositionsDTO(
            siteId: $site->id,
            device: $target->device,
            source: $target->search_engine,
            country: null,
            os: $target->os,
            ads: $site->getAds(),
            pages: $this->calculatePagesForPositionLimit($site->positionLimit),
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
            pages: $this->calculatePagesForPositionLimit($site->positionLimit),
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


