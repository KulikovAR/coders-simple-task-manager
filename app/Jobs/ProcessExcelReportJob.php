<?php

namespace App\Jobs;

use App\Models\Report;
use App\Services\Seo\Services\ExcelReportService;
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
        ReportDataCollectorService $dataCollector,
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

            $filters = $this->prepareFilters();
            $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $this->report->site_id, ...$filters]);
            
            $statistics = $dataCollector->collectStatistics($positionFilters);

            $combinedFilters = $positionFilters->toQueryParams();
            if ($site->wordstatEnabled) {
                $combinedFilters['wordstat'] = true;
            }

            $context = $excelReportService->createReportFile(
                $site->toArray(),
                $filters,
                $statistics,
                $this->report->id
            );

            $context = $this->processPositions($dataCollector, $excelReportService, $combinedFilters, $context);

            $filePath = $excelReportService->finalizeReport($context);
            $this->validateFile($filePath);

            $this->report->update([
                'file_path' => $filePath,
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

        return $filters;
    }

    private function processPositions(
        ReportDataCollectorService $dataCollector,
        ExcelReportService $excelService,
        array $filters,
        array $context
    ): array {
        $page = 1;
        $perPage = 100;
        $datesSet = [];
        $isFirstPage = true;
        
        do {
            $result = $dataCollector->collectPositionsBatch($filters, $page, $perPage);
            
            if (!empty($result['positions'])) {
                $batchKeywords = [];
                
                foreach ($result['positions'] as $position) {
                    $keyword = $position['keyword'] ?? '';
                    $date = $position['date'] ?? '';
                    $source = $position['source'] ?? '';

                    if (empty($keyword)) {
                        continue;
                    }

                    if (!isset($batchKeywords[$keyword])) {
                        $batchKeywords[$keyword] = [
                            'keyword' => $keyword,
                            'wordstat' => null,
                            'positions' => []
                        ];
                    }

                    if ($source === 'wordstat') {
                        $batchKeywords[$keyword]['wordstat'] = $position['position'] ?? null;
                    } else {
                        $dateOnly = date('Y-m-d', strtotime($date));
                        if (!in_array($dateOnly, $datesSet)) {
                            $datesSet[] = $dateOnly;
                        }
                        $batchKeywords[$keyword]['positions'][$dateOnly] = $position['position'] ?? null;
                    }
                }

                if (!empty($batchKeywords)) {
                    if ($isFirstPage) {
                        sort($datesSet);
                        $context = $excelService->writeTableHeaders($context, $datesSet);
                        $isFirstPage = false;
                    }

                    foreach ($batchKeywords as $keywordData) {
                        $context = $excelService->writeBatchRows($context, [$keywordData]);
                    }
                }
            }

            $page++;

        } while ($result['hasMore']);

        return $context;
    }

    private function validateFile(string $filePath): void
    {
        $fullPath = storage_path('app/' . $filePath);

        if (!file_exists($fullPath)) {
            throw new \Exception("Excel file was not created");
        }

        $fileSize = filesize($fullPath);
        if ($fileSize === 0) {
            throw new \Exception("Excel file is empty");
        }
    }

    private function handleFailure(\Exception $e): void
    {
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
