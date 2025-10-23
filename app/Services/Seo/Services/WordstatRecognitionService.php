<?php

namespace App\Services\Seo\Services;

use App\Models\WordstatRecognitionTask;
use App\Services\Seo\DTOs\TrackPositionsDTO;
use App\Services\Seo\Services\UserXmlApiSettingsService;
use Illuminate\Support\Facades\Log;

class WordstatRecognitionService
{
    public function __construct(
        private MicroserviceClient $microserviceClient,
        private SiteService $siteService,
        private UserXmlApiSettingsService $xmlApiSettingsService
    ) {}

    public function processWordstatTask(WordstatRecognitionTask $task): void
    {
        try {
            Log::info("Starting Wordstat recognition processing", [
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

            if (!$site->wordstatEnabled) {
                throw new \Exception("Wordstat is not enabled for this site");
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

            $wordstatTrackData = $this->buildWordstatTrackData($site, $task->user_id);
            $result = $this->microserviceClient->trackWordstatPositions($wordstatTrackData->toArray());

            if ($result && isset($result['task_id'])) {
                $task->update([
                    'external_task_id' => $result['task_id'],
                    'processed_keywords' => $totalKeywords,
                ]);
                
                Log::info("Wordstat tracking started successfully", [
                    'external_task_id' => $result['task_id'],
                    'task_id' => $task->id,
                    'site_id' => $task->site_id
                ]);
            } else {
                throw new \Exception("Failed to track Wordstat positions");
            }

        } catch (\Exception $e) {
            Log::error("Wordstat recognition processing failed", [
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
}
