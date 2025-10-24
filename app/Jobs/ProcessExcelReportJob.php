<?php

namespace App\Jobs;

use App\Models\Report;
use App\Services\Seo\Services\ExcelReportService;
use App\Services\Seo\Services\MicroserviceClient;
use App\Services\Seo\Services\SiteUserService;
use App\Services\Seo\DTOs\PositionFiltersDTO;
use Illuminate\Bus\Queueable as BusQueueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ProcessExcelReportJob implements ShouldQueue
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
        ExcelReportService $excelReportService,
        MicroserviceClient $microserviceClient,
        SiteUserService $siteUserService
    ): void
    {
        try {
            Auth::loginUsingId($this->report->user_id);

            Log::info("Processing Excel report", [
                'report_id' => $this->report->id,
                'site_id' => $this->report->site_id,
                'user_id' => $this->report->user_id
            ]);

            $site = $siteUserService->getSite($this->report->site_id);
            if (!$site) {
                throw new \Exception("Site not found or no access");
            }

            $filters = $this->report->filters ?? [];

            if (empty($filters['date_from'])) {
                $filters['date_from'] = now()->subDays(30)->format('Y-m-d');
            }
            if (empty($filters['date_to'])) {
                $filters['date_to'] = now()->addDay()->format('Y-m-d');
            }

            $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $this->report->site_id, ...$filters]);
            $statistics = $microserviceClient->getPositionStatistics($positionFilters->toQueryParams());

            $combinedFilters = $positionFilters->toQueryParams();

            if ($site->wordstatEnabled) {
                $combinedFilters['wordstat'] = true;
            }

            $allPositions = [];
            $allKeywords = [];
            $page = 1;
            $perPage = 100;

            do {
                $response = $microserviceClient->getCombinedPositions($combinedFilters, $page, $perPage);
                $data = $response['data'] ?? [];

                if (empty($data)) {
                    break;
                }

                foreach ($data as $item) {
                    $allKeywords[] = [
                        'id' => $item['keyword_id'],
                        'value' => $item['keyword'],
                        'site_id' => $item['site_id']
                    ];

                    if (!empty($item['positions']) && is_array($item['positions'])) {
                        foreach ($item['positions'] as $position) {
                            $allPositions[] = [
                                'id' => $item['id'],
                                'keyword_id' => $item['keyword_id'],
                                'keyword' => $item['keyword'],
                                'date' => $position['date'] ?? $item['date'],
                                'source' => $position['source'],
                                'rank' => $position['rank'],
                                'position' => $position['rank'],
                                'url' => $position['url'] ?? null,
                                'title' => $position['title'] ?? null,
                                'device' => $position['device'] ?? null,
                                'country' => $position['country'] ?? null,
                                'lang' => $position['lang'] ?? null,
                                'os' => $position['os'] ?? null,
                                'ads' => $position['ads'] ?? false,
                                'pages' => $position['pages'] ?? null
                            ];
                        }
                    }

                    if (!empty($item['wordstat']) && $item['wordstat'] !== null) {
                        $allPositions[] = [
                            'id' => $item['id'],
                            'keyword_id' => $item['keyword_id'],
                            'keyword' => $item['keyword'],
                            'date' => $item['date'],
                            'source' => 'wordstat',
                            'rank' => $item['wordstat']['rank'],
                            'position' => $item['wordstat']['rank'],
                            'url' => $item['wordstat']['url'] ?? null,
                            'title' => $item['wordstat']['title'] ?? null,
                            'device' => $item['wordstat']['device'] ?? null,
                            'country' => $item['wordstat']['country'] ?? null,
                            'lang' => $item['wordstat']['lang'] ?? null,
                            'os' => $item['wordstat']['os'] ?? null,
                            'ads' => $item['wordstat']['ads'] ?? false,
                            'pages' => $item['wordstat']['pages'] ?? null
                        ];
                    }
                }

                $page++;

                $pagination = $response['pagination'] ?? [];
                if (isset($pagination['current_page']) && isset($pagination['last_page'])) {
                    if ($pagination['current_page'] >= $pagination['last_page']) {
                        break;
                    }
                }

            } while (!empty($data));

            $reportData = [
                'project' => $site->toArray(),
                'keywords' => $allKeywords,
                'positions' => $allPositions,
                'statistics' => $statistics,
                'filters' => [
                    'source' => $positionFilters->source,
                    'date_from' => $positionFilters->dateFrom,
                    'date_to' => $positionFilters->dateTo,
                ]
            ];

            $filePath = $excelReportService->exportToExcel($reportData, $this->report->id);
            $fullPath = storage_path('app/' . $filePath);

            if (!file_exists($fullPath)) {
                throw new \Exception("Excel file was not created");
            }

            $fileSize = filesize($fullPath);
            if ($fileSize === 0) {
                throw new \Exception("Excel file is empty");
            }

            $this->report->update([
                'file_path' => $filePath,
                'status' => 'completed',
                'completed_at' => now(),
            ]);

        } catch (\Exception $e) {
            Log::error("Excel report generation failed", [
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
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Excel report job permanently failed", [
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
