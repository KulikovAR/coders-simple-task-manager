<?php

namespace App\Services\Seo\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Color;

class ExcelReportService
{
    public function __construct(
        private SiteUserService $siteUserService
    ) {}

    public function createReportFile(
        array $site,
        array $filters,
        array $statistics,
        int $reportId
    ): array {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Отчет по позициям');

        $fileName = "report_{$reportId}_" . now()->format('Y_m_d_H_i_s') . '.xlsx';
        $filePath = "reports/excel/{$fileName}";
        $fullPath = storage_path("app/{$filePath}");

        $directory = dirname($fullPath);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $this->writeHeader($sheet, $site, $filters, $statistics);

        return [
            'spreadsheet' => $spreadsheet,
            'filePath' => $filePath,
            'fullPath' => $fullPath,
            'dates' => null,
            'nextRow' => 15
        ];
    }

    public function writeTableHeaders(array $context, array $dates): array
    {
        $sheet = $context['spreadsheet']->getActiveSheet();
        
        $col = 'A';
        $sheet->setCellValue("{$col}14", 'Ключевое слово');
        $col++;

        $sheet->setCellValue("{$col}14", 'Частота (Wordstat)');
        $col++;

        foreach ($dates as $date) {
            $sheet->setCellValue("{$col}14", $date);
            $col++;
        }

        $lastCol = $this->getColumnLetter(count($dates) + 2);
        $headerStyle = [
            'font' => [
                'bold' => true,
                'size' => 12,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '3B82F6']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => '1E40AF']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];

        $sheet->getStyle("A14:{$lastCol}14")->applyFromArray($headerStyle);
        
        $sheet->getColumnDimension('A')->setWidth(40);
        $sheet->getColumnDimension('B')->setWidth(20);
        foreach ($dates as $idx => $date) {
            $colLetter = $this->getColumnLetter($idx + 3);
            $sheet->getColumnDimension($colLetter)->setWidth(15);
        }

        $context['dates'] = $dates;
        
        return $context;
    }

    public function writeBatchRows(array $context, array $newKeywords): array
    {
        $sheet = $context['spreadsheet']->getActiveSheet();
        $dates = $context['dates'];
        $row = $context['nextRow'];

        foreach ($newKeywords as $keywordData) {
            $col = 'A';

            $sheet->setCellValue("{$col}{$row}", $keywordData['keyword']);
            $col++;

            $wordstatValue = $keywordData['wordstat'] ?: '-';
            $sheet->setCellValue("{$col}{$row}", $wordstatValue);
            $col++;

            foreach ($dates as $date) {
                $position = $keywordData['positions'][$date] ?? null;
                $positionText = $position !== null ? $position : '-';

                $sheet->setCellValue("{$col}{$row}", $positionText);

                if ($position !== null) {
                    $this->applyPositionColor($sheet, "{$col}{$row}", $position);
                }

                $col++;
            }

            $row++;
        }

        $context['nextRow'] = $row;

        return $context;
    }

    public function finalizeReport(array $context): string
    {
        $sheet = $context['spreadsheet']->getActiveSheet();
        $lastRow = $context['nextRow'] - 1;

        if ($lastRow >= 15) {
            $lastCol = $this->getColumnLetter(count($context['dates']) + 2);
            
            $dataStyle = [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => 'E5E7EB']
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ];

            $sheet->getStyle("A15:{$lastCol}{$lastRow}")->applyFromArray($dataStyle);
        }

        $writer = new Xlsx($context['spreadsheet']);
        $writer->save($context['fullPath']);

        if (!file_exists($context['fullPath'])) {
            throw new \Exception("Excel file was not created");
        }

        $fileSize = filesize($context['fullPath']);
        if ($fileSize === 0) {
            throw new \Exception("Excel file is empty");
        }

        return $context['filePath'];
    }

    private function writeHeader($sheet, array $site, array $filters, array $statistics): void
    {
        $sheet->setCellValue('A1', 'Отчет по позициям');
        $sheet->getStyle('A1')->getFont()
            ->setBold(true)
            ->setSize(18)
            ->setColor(new Color('0000FF'));

        $projectName = $site['name'] ?? 'Неизвестный проект';
        $sheet->setCellValue('A2', 'Проект: ' . $projectName);

        $dateFrom = $filters['date_from'] ?? 'Не указано';
        $dateTo = $filters['date_to'] ?? 'Не указано';
        $sheet->setCellValue('A3', 'Период: ' . $dateFrom . ' - ' . $dateTo);

        $source = $filters['source'] ?? 'Не указано';
        $sheet->setCellValue('A4', 'Источник: ' . $source);

        $sheet->getStyle('A2:A4')->getFont()->setSize(12);

        $this->writeStatistics($sheet, $statistics);
    }

    private function writeStatistics($sheet, array $statistics): void
    {
        $sheet->setCellValue('A6', 'Статистика:');
        $sheet->setCellValue('A7', 'Ключевых слов: ' . ($statistics['keywords_count'] ?? 0));
        $sheet->setCellValue('A8', 'Топ-3 позиции: ' . ($statistics['position_distribution']['top_3'] ?? 0));
        $sheet->setCellValue('A9', 'Позиции 4-10: ' . ($statistics['position_distribution']['top_10'] ?? 0));
        $sheet->setCellValue('A10', 'Позиции 11-20: ' . ($statistics['position_distribution']['top_20'] ?? 0));
        $sheet->setCellValue('A11', 'Не найдено: ' . ($statistics['position_distribution']['not_found'] ?? 0));
        $sheet->setCellValue('A12', 'Видимость: ' . ($statistics['visible'] ?? 0));

        $sheet->getStyle('A6')->getFont()->setBold(true);
        $sheet->getStyle('A7:A12')->getFont()->setSize(11);
    }

    private function getColumnLetter(int $columnNumber): string
    {
        $letter = '';
        while ($columnNumber > 0) {
            $columnNumber--;
            $letter = chr(65 + ($columnNumber % 26)) . $letter;
            $columnNumber = intval($columnNumber / 26);
        }
        return $letter;
    }

    private function applyPositionColor($sheet, string $cell, $position): void
    {
        $color = match(true) {
            $position === null || $position === '' || $position === 0 => '6B7280',
            $position <= 3 => '10B981',
            $position <= 10 => 'F59E0B',
            default => 'EF4444'
        };

        $sheet->getStyle($cell)->getFont()->setColor(new Color($color));
    }
}
