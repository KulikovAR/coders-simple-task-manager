<?php

namespace App\Jobs;

use App\Models\Report;
use App\Services\Seo\Services\SeoHtmlReportService;
use App\Services\Seo\Services\ReportDataCollectorService;
use App\Services\Seo\Services\SiteUserService;
use App\Services\Seo\DTOs\PositionFiltersDTO;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ProcessHtmlReportJob implements ShouldQueue
{
    use BusQueueable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 600;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(
        public Report $report
    )
    {
        $this->onQueue('default');
    }

    public function handle(
        SeoHtmlReportService $htmlReportService,
        ReportDataCollectorService $dataCollector,
        SiteUserService $siteUserService
    ): void
    {
        try {
            Auth::loginUsingId($this->report->user_id);

            Log::info("Processing HTML report", [
                'report_id' => $this->report->id,
                'site_id' => $this->report->site_id,
                'user_id' => $this->report->user_id
            ]);

            $site = $siteUserService->getSite($this->report->site_id);
            if (!$site) {
                throw new \Exception("Site not found or no access");
            }

            $filters = $this->prepareFilters();
            $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $this->report->site_id, ...$filters]);
            
            $statistics = $dataCollector->collectStatistics($positionFilters);

            $combinedFilters = $positionFilters->toQueryParams();
            if ($site->wordstatEnabled) {
                $combinedFilters['wordstat'] = true;
            }

            $allPositions = $this->collectAllPositions($dataCollector, $combinedFilters);

            $reportData = [
                'project' => $site->toArray(),
                'positions' => $allPositions,
                'statistics' => $statistics,
                'filters' => [
                    'source' => $positionFilters->source,
                    'date_from' => $positionFilters->dateFrom,
                    'date_to' => $positionFilters->dateTo,
                ]
            ];

            $publicUrl = $htmlReportService->exportToHtml($reportData, $this->report->id);

            $this->report->update([
                'public_url' => $publicUrl,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        } catch (\Exception $e) {
            $this->handleFailure($e);
        }
    }

    private function prepareFilters(): array
    {
        $filters = $this->report->filters ?? [];

        if (empty($filters['date_from'])) {
            $filters['date_from'] = now()->subDays(30)->format('Y-m-d');
        }
        if (empty($filters['date_to'])) {
            $filters['date_to'] = now()->addDay()->format('Y-m-d');
        }

        return array_filter($filters, function($value, $key) {
            if ($value === null || $value === '') {
                return false;
            }
            if (in_array($key, ['rank_from', 'rank_to']) && $value === 0) {
                return true;
            }
            return true;
        }, ARRAY_FILTER_USE_BOTH);
    }

    private function collectAllPositions(
        ReportDataCollectorService $dataCollector,
        array $filters
    ): array {
        $allPositions = [];
        $page = 1;
        $perPage = 100;

        do {
            $result = $dataCollector->collectPositionsBatch($filters, $page, $perPage);
            
            if (!empty($result['positions'])) {
                $allPositions = array_merge($allPositions, $result['positions']);
            }

            $page++;

        } while ($result['hasMore']);

        return $allPositions;
    }

    private function handleFailure(\Exception $e): void
    {
        Log::error("HTML report generation failed", [
            'report_id' => $this->report->id,
            'site_id' => $this->report->site_id,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        $this->report->update([
            'status' => 'failed',
            'error_message' => $e->getMessage(),
            'completed_at' => now(),
        ]);

        throw $e;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("HTML report job permanently failed", [
            'report_id' => $this->report->id,
            'site_id' => $this->report->site_id,
            'error' => $exception->getMessage()
        ]);

        $this->report->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
            'completed_at' => now(),
        ]);
    }
}
