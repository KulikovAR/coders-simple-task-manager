<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\DTOs\PositionFiltersDTO;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Illuminate\Support\Facades\Log;

class ReportsService
{
    public function __construct(
        private SiteUserService $siteUserService,
        private MicroserviceClient $microserviceClient
    ) {}

    public function getReportsData(int $siteId, array $filters = []): ?array
    {
        if (!$this->siteUserService->hasAccessToSite($siteId)) {
            return null;
        }

        $site = $this->siteUserService->getSite($siteId);

        if (!$site) {
            return null;
        }

        if (empty($filters['source']) && !empty($site->searchEngines)) {
            $filters['source'] = $site->searchEngines[0];
        }

        if (empty($filters['date_from'])) {
            $filters['date_from'] = now()->subDays(30)->format('Y-m-d');
        }
        if (empty($filters['date_to'])) {
            $filters['date_to'] = now()->addDay()->format('Y-m-d');
        }

        $positionFilters = PositionFiltersDTO::fromRequest(['site_id' => $siteId, ...$filters]);

        $statistics = $this->microserviceClient->getPositionStatistics($positionFilters->toQueryParams());

        $combinedFilters = $positionFilters->toQueryParams();
        
        if ($site->wordstatEnabled) {
            $combinedFilters['wordstat'] = true;
        }
        
        $combinedResponse = $this->microserviceClient->getCombinedPositions($combinedFilters, 1, 10);
        $combinedData = $combinedResponse['data'] ?? [];
        
        $keywords = [];
        $positions = [];
        
        foreach ($combinedData as $item) {
            $keywords[] = [
                'id' => $item['keyword_id'],
                'value' => $item['keyword'],
                'site_id' => $item['site_id']
            ];
            
            if (!empty($item['positions']) && is_array($item['positions'])) {
                foreach ($item['positions'] as $position) {
                    $positions[] = [
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
                $positions[] = [
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

        return [
            'project' => $site->toArray(),
            'keywords' => $keywords,
            'positions' => $positions,
            'statistics' => $statistics,
            'pagination' => $combinedResponse['pagination'] ?? [],
            'meta' => $combinedResponse['meta'] ?? [],
            'filters' => [
                'source' => $positionFilters->source,
                'date_from' => $positionFilters->dateFrom,
                'date_to' => $positionFilters->dateTo,
                'rank_from' => $positionFilters->rankFrom,
                'rank_to' => $positionFilters->rankTo,
                'date_sort' => $positionFilters->dateSort,
                'sort_type' => $positionFilters->sortType,
                'wordstat_sort' => $positionFilters->wordstatSort,
                'group_id' => $positionFilters->groupId,
                'wordstat_query_type' => $positionFilters->wordstatQueryType,
            ],
        ];
    }

    /**
     * Объединяет позиции с данными Wordstat
     */
    public function exportToExcel(array $reportData, int $reportId): string
    {
        try {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Отчет по позициям');

            $this->buildExcelHeader($sheet, $reportData);
            $this->buildExcelData($sheet, $reportData);
            $this->buildExcelCharts($sheet, $reportData);

            $fileName = "report_{$reportId}_" . now()->format('Y_m_d_H_i_s') . '.xlsx';
            $filePath = "reports/excel/{$fileName}";
            $fullPath = storage_path("app/{$filePath}");

            $directory = dirname($fullPath);
            if (!is_dir($directory)) {
                if (!mkdir($directory, 0755, true)) {
                    throw new \Exception("Cannot create directory: {$directory}");
                }
            }

            if (file_exists($fullPath)) {
                unlink($fullPath);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save($fullPath);

            if (!file_exists($fullPath)) {
                throw new \Exception("Excel file was not created");
            }

            $fileSize = filesize($fullPath);
            if ($fileSize === 0) {
                throw new \Exception("Excel file is empty");
            }

            return $filePath;
        } catch (\Exception $e) {
            Log::error("Error creating Excel file for report {$reportId}: " . $e->getMessage());
            throw $e;
        }
    }

    public function exportToHtml(array $reportData, int $reportId): string
    {
        $html = $this->generateHtmlReport($reportData);

        $fileName = "report_{$reportId}_" . now()->format('Y_m_d_H_i_s') . '.html';
        $filePath = "public/reports/{$fileName}";

        file_put_contents(base_path($filePath), $html);

        return "/reports/{$fileName}";
    }

    private function mergePositionsWithWordstat(array $positions, array $wordstatPositions): array
    {
        if (empty($wordstatPositions)) {
            return $positions;
        }

        return array_merge($positions, $wordstatPositions);
    }

    private function buildExcelHeader($sheet, array $reportData): void
    {
        try {
            $sheet->setCellValue('A1', 'Отчет по позициям');
            $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

            $projectName = $reportData['project']['name'] ?? 'Неизвестный проект';
            $sheet->setCellValue('A2', 'Проект: ' . $projectName);

            $dateFrom = $reportData['filters']['date_from'] ?? 'Не указано';
            $dateTo = $reportData['filters']['date_to'] ?? 'Не указано';
            $sheet->setCellValue('A3', 'Период: ' . $dateFrom . ' - ' . $dateTo);

            $source = $reportData['filters']['source'] ?? 'Не указано';
            $sheet->setCellValue('A4', 'Источник: ' . $source);

            $sheet->getStyle('A2:A4')->getFont()->setSize(12);

            $sheet->setCellValue('A6', 'Ключевое слово');
            $sheet->setCellValue('B6', 'Позиция');
            $sheet->setCellValue('C6', 'Дата');
            $sheet->setCellValue('D6', 'Источник');

            $headerStyle = [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E6E6FA']
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER
                ]
            ];

            $sheet->getStyle('A6:D6')->applyFromArray($headerStyle);

            $sheet->getColumnDimension('A')->setAutoSize(true);
            $sheet->getColumnDimension('B')->setAutoSize(true);
            $sheet->getColumnDimension('C')->setAutoSize(true);
            $sheet->getColumnDimension('D')->setAutoSize(true);

        } catch (\Exception $e) {
            Log::error("Error building Excel header: " . $e->getMessage());
            throw $e;
        }
    }

    private function buildExcelData($sheet, array $reportData): void
    {
        try {
            $row = 7;
            $positions = $reportData['positions'] ?? [];

            if (empty($positions)) {
                $sheet->setCellValue("A{$row}", 'Нет данных для отображения');
                $sheet->mergeCells("A{$row}:D{$row}");
                $sheet->getStyle("A{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A{$row}")->getFont()->setItalic(true);
                return;
            }

            $dataCount = 0;
            foreach ($positions as $index => $position) {
                try {
                    $keyword = $this->extractKeyword($position);
                    $positionValue = $this->extractPosition($position);
                    $date = $this->extractDate($position);
                    $source = $this->extractSource($position);

                    $sheet->setCellValue("A{$row}", $keyword);
                    $sheet->setCellValue("B{$row}", $positionValue);
                    $sheet->setCellValue("C{$row}", $date);
                    $sheet->setCellValue("D{$row}", $source);

                    $dataCount++;
                    $row++;
                } catch (\Exception $e) {
                    Log::warning("Error processing position data at index {$index}: " . $e->getMessage());
                    continue;
                }
            }

            $dataStyle = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT
                ]
            ];

            $lastRow = $row - 1;
            if ($lastRow >= 7 && $dataCount > 0) {
                $sheet->getStyle("A7:D{$lastRow}")->applyFromArray($dataStyle);
            }

        } catch (\Exception $e) {
            Log::error("Error building Excel data: " . $e->getMessage());
            throw $e;
        }
    }

    private function extractKeyword(array $position): string
    {
        return $position['keyword'] ??
               $position['keyword_value'] ??
               $position['query'] ??
               $position['text'] ??
               '';
    }

    private function extractPosition(array $position): string
    {
        $pos = $position['position'] ??
               $position['rank'] ??
               $position['pos'] ??
               $position['position_value'] ??
               '';

        return is_numeric($pos) ? (string)$pos : $pos;
    }

    private function extractDate(array $position): string
    {
        $date = $position['date'] ??
                $position['created_at'] ??
                $position['tracked_at'] ??
                $position['timestamp'] ??
                '';

        if (is_numeric($date)) {
            return date('Y-m-d H:i:s', $date);
        }

        return $date;
    }

    private function extractSource(array $position): string
    {
        $source = $position['source'] ??
                  $position['search_engine'] ??
                  $position['engine'] ??
                  '';

        return match($source) {
            'google' => 'Google',
            'yandex' => 'Яндекс',
            'wordstat' => 'Wordstat',
            default => $source
        };
    }

    private function buildExcelCharts($sheet, array $reportData): void
    {
        $chartRow = count($reportData['positions']) + 10;

        $sheet->setCellValue("A{$chartRow}", 'График движения позиций');
        $sheet->getStyle("A{$chartRow}")->getFont()->setBold(true)->setSize(14);
    }

    private function generateHtmlReport(array $reportData): string
    {
        $project = $reportData['project'];
        $positions = $reportData['positions'];
        $filters = $reportData['filters'];

        $html = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отчет по позициям - ' . htmlspecialchars($project['name']) . '</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .header h1 { color: #007bff; margin: 0; }
        .info { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .info-item { text-align: center; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { font-size: 18px; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #007bff; color: white; font-weight: bold; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        tr:hover { background-color: #e6f3ff; }
        .chart-container { margin-top: 30px; }
        .chart-title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .chart-wrapper { position: relative; height: 400px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Отчет по позициям</h1>
        </div>

        <div class="info">
            <div class="info-item">
                <div class="info-label">Проект</div>
                <div class="info-value">' . htmlspecialchars($project['name']) . '</div>
            </div>
            <div class="info-item">
                <div class="info-label">Период</div>
                <div class="info-value">' . htmlspecialchars($filters['date_from']) . ' - ' . htmlspecialchars($filters['date_to']) . '</div>
            </div>
            <div class="info-item">
                <div class="info-label">Источник</div>
                <div class="info-value">' . htmlspecialchars($filters['source']) . '</div>
            </div>
            <div class="info-item">
                <div class="info-label">Всего позиций</div>
                <div class="info-value">' . count($positions) . '</div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Ключевое слово</th>
                    <th>Позиция</th>
                    <th>Дата</th>
                    <th>Источник</th>
                </tr>
            </thead>
            <tbody>';

        foreach ($positions as $position) {
            $html .= '<tr>
                <td>' . htmlspecialchars($position['keyword'] ?? '') . '</td>
                <td>' . htmlspecialchars($position['position'] ?? '') . '</td>
                <td>' . htmlspecialchars($position['date'] ?? '') . '</td>
                <td>' . htmlspecialchars($position['source'] ?? '') . '</td>
            </tr>';
        }

        $html .= '</tbody>
        </table>

        <div class="chart-container">
            <div class="chart-title">График движения позиций</div>
            <div class="chart-wrapper">
                <canvas id="positionChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        const positions = ' . json_encode($positions) . ';

        const keywordGroups = {};
        positions.forEach(pos => {
            const keyword = pos.keyword;
            if (!keywordGroups[keyword]) {
                keywordGroups[keyword] = [];
            }
            keywordGroups[keyword].push({
                date: pos.date,
                position: parseInt(pos.position) || 0
            });
        });

        const datasets = Object.keys(keywordGroups).slice(0, 10).map((keyword, index) => {
            const data = keywordGroups[keyword].sort((a, b) => new Date(a.date) - new Date(b.date));
            return {
                label: keyword,
                data: data.map(d => d.position),
                borderColor: `hsl(${index * 36}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 36}, 70%, 50%, 0.1)`,
                tension: 0.1,
                fill: false
            };
        });

        const ctx = document.getElementById("positionChart").getContext("2d");
        new Chart(ctx, {
            type: "line",
            data: {
                labels: Object.values(keywordGroups)[0]?.map(d => d.date) || [],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        reverse: true,
                        title: {
                            display: true,
                            text: "Позиция"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Дата"
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top"
                    },
                    title: {
                        display: true,
                        text: "Динамика позиций по ключевым словам"
                    }
                }
            }
        });
    </script>
</body>
</html>';

        return $html;
    }
}
