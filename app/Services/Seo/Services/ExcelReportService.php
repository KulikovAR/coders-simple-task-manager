<?php

namespace App\Services\Seo\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use Illuminate\Support\Facades\Log;

class ExcelReportService
{
    public function __construct(
        private SiteUserService $siteUserService,
        private MicroserviceClient $microserviceClient
    ) {}

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

    private function buildExcelHeader($sheet, array $reportData): void
    {
        try {
            // Заголовок отчета
            $sheet->setCellValue('A1', 'Отчет по позициям');
            $sheet->getStyle('A1')->getFont()
                ->setBold(true)
                ->setSize(18)
                ->setColor(new Color('0000FF'));
            
            $projectName = $reportData['project']['name'] ?? 'Неизвестный проект';
            $sheet->setCellValue('A2', 'Проект: ' . $projectName);
            
            $dateFrom = $reportData['filters']['date_from'] ?? 'Не указано';
            $dateTo = $reportData['filters']['date_to'] ?? 'Не указано';
            $sheet->setCellValue('A3', 'Период: ' . $dateFrom . ' - ' . $dateTo);
            
            $source = $reportData['filters']['source'] ?? 'Не указано';
            $sheet->setCellValue('A4', 'Источник: ' . $source);
            
            $sheet->getStyle('A2:A4')->getFont()->setSize(12);
            
            // Статистика из микросервиса
            $stats = $this->microserviceClient->getPositionStatistics($reportData['filters']);
            $sheet->setCellValue('A6', 'Статистика:');
            $sheet->setCellValue('A7', 'Ключевых слов: ' . ($stats['keywords_count'] ?? 0));
            $sheet->setCellValue('A8', 'Топ-3 позиции: ' . ($stats['position_distribution']['top_3'] ?? 0));
            $sheet->setCellValue('A9', 'Позиции 4-10: ' . ($stats['position_distribution']['top_10'] ?? 0));
            $sheet->setCellValue('A10', 'Позиции 11-20: ' . ($stats['position_distribution']['top_20'] ?? 0));
            $sheet->setCellValue('A11', 'Не найдено: ' . ($stats['position_distribution']['not_found'] ?? 0));
            $sheet->setCellValue('A12', 'Видимость: ' . ($stats['visible'] ?? 0));
            
            $sheet->getStyle('A6')->getFont()->setBold(true);
            $sheet->getStyle('A7:A12')->getFont()->setSize(11);
            
            // Заголовки таблицы
            $sheet->setCellValue('A14', 'Ключевое слово');
            $sheet->setCellValue('B14', 'Позиция');
            $sheet->setCellValue('C14', 'Дата');
            $sheet->setCellValue('D14', 'Источник');
            $sheet->setCellValue('E14', 'Категория');
            
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
            
            $sheet->getStyle('A14:E14')->applyFromArray($headerStyle);
            
            // Автоподбор ширины колонок
            $sheet->getColumnDimension('A')->setWidth(30);
            $sheet->getColumnDimension('B')->setWidth(12);
            $sheet->getColumnDimension('C')->setWidth(20);
            $sheet->getColumnDimension('D')->setWidth(15);
            $sheet->getColumnDimension('E')->setWidth(15);
            
        } catch (\Exception $e) {
            Log::error("Error building Excel header: " . $e->getMessage());
            throw $e;
        }
    }

    private function buildExcelData($sheet, array $reportData): void
    {
        try {
            $positions = $reportData['positions'] ?? [];
            
            if (empty($positions)) {
                $sheet->setCellValue("A15", 'Нет данных для отображения');
                $sheet->mergeCells("A15:E15");
                $sheet->getStyle("A15")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A15")->getFont()->setItalic(true);
                return;
            }
            
            // Подготавливаем данные для таблицы
            $tableData = $this->prepareTableData($positions);
            
            // Обновляем заголовки таблицы
            $this->updateExcelHeaders($sheet, $tableData['dates']);
            
            // Заполняем данные
            $row = 15;
            foreach ($tableData['keywords'] as $keywordData) {
                $col = 'A';
                
                // Ключевое слово
                $sheet->setCellValue("{$col}{$row}", $keywordData['keyword']);
                $col++;
                
                // Частота Wordstat
                $wordstatValue = $keywordData['wordstat'] ?: '-';
                $sheet->setCellValue("{$col}{$row}", $wordstatValue);
                $col++;
                
                // Позиции по датам
                foreach ($tableData['dates'] as $date) {
                    $position = $keywordData['positions'][$date] ?? null;
                    $positionText = $position !== null ? $position : '-';
                    
                    $sheet->setCellValue("{$col}{$row}", $positionText);
                    
                    // Применяем цветовое кодирование для позиций
                    if ($position !== null) {
                        $this->applyPositionColor($sheet, "{$col}{$row}", $position);
                    }
                    
                    $col++;
                }
                
                $row++;
            }
            
            // Применяем стили к данным
            $lastCol = $this->getColumnLetter(count($tableData['dates']) + 2); // +2 для keyword и wordstat
            $lastRow = $row - 1;
            
            if ($lastRow >= 15) {
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
            
        } catch (\Exception $e) {
            Log::error("Error building Excel data: " . $e->getMessage());
            throw $e;
        }
    }

    private function buildExcelCharts($sheet, array $reportData): void
    {
        // Подготавливаем данные для таблицы, чтобы узнать количество строк
        $tableData = $this->prepareTableData($reportData['positions']);
        $keywordCount = count($tableData['keywords']);
        
        // Рассчитываем позицию для статистики: начало данных (15) + количество ключевых слов + отступ
        $chartRow = 15 + $keywordCount + 3;
        
        // Получаем статистику из микросервиса
        $stats = $this->microserviceClient->getPositionStatistics($reportData['filters']);
        
        // Заголовок для диаграммы распределения позиций
        $sheet->setCellValue("A{$chartRow}", 'Распределение позиций');
        $sheet->getStyle("A{$chartRow}")->getFont()->setBold(true)->setSize(14);
        
        $chartRow += 2;
        
        // Данные для диаграммы распределения позиций
        $sheet->setCellValue("A{$chartRow}", 'Категория');
        $sheet->setCellValue("B{$chartRow}", 'Количество');
        $sheet->getStyle("A{$chartRow}:B{$chartRow}")->getFont()->setBold(true);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Топ-3');
        $sheet->setCellValue("B{$chartRow}", $stats['position_distribution']['top_3'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", '4-10');
        $sheet->setCellValue("B{$chartRow}", $stats['position_distribution']['top_10'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", '11-20');
        $sheet->setCellValue("B{$chartRow}", $stats['position_distribution']['top_20'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Не найдено');
        $sheet->setCellValue("B{$chartRow}", $stats['position_distribution']['not_found'] ?? 0);
        
        // Создаем диаграмму распределения позиций
        $this->createPositionDistributionChart($sheet, $chartRow - 4, $chartRow - 1);
        
        // Добавляем статистику видимости
        $chartRow += 3;
        $sheet->setCellValue("A{$chartRow}", 'Статистика видимости');
        $sheet->getStyle("A{$chartRow}")->getFont()->setBold(true)->setSize(14);
        
        $chartRow += 2;
        $sheet->setCellValue("A{$chartRow}", 'Показатель');
        $sheet->setCellValue("B{$chartRow}", 'Значение');
        $sheet->getStyle("A{$chartRow}:B{$chartRow}")->getFont()->setBold(true);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Видимость');
        $sheet->setCellValue("B{$chartRow}", $stats['visible'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Не видимо');
        $sheet->setCellValue("B{$chartRow}", $stats['not_visible'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Средняя позиция');
        $sheet->setCellValue("B{$chartRow}", $stats['visibility_stats']['avg_position'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Лучшая позиция');
        $sheet->setCellValue("B{$chartRow}", $stats['visibility_stats']['best_position'] ?? 0);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Худшая позиция');
        $sheet->setCellValue("B{$chartRow}", $stats['visibility_stats']['worst_position'] ?? 0);
        
        // Создаем диаграмму видимости
        $this->createVisibilityChart($sheet, $chartRow - 5, $chartRow - 1);
    }

    private function prepareTableData(array $positions): array
    {
        $keywords = [];
        $dates = [];
        
        // Собираем все уникальные даты и ключевые слова
        foreach ($positions as $position) {
            $keyword = $this->extractKeyword($position);
            $date = $this->extractDate($position);
            $source = $this->extractSource($position);
            
            if (!empty($keyword)) {
                if (!isset($keywords[$keyword])) {
                    $keywords[$keyword] = [
                        'keyword' => $keyword,
                        'wordstat' => null,
                        'positions' => []
                    ];
                }
                
                // Если это Wordstat, сохраняем частоту
                if ($source === 'Wordstat') {
                    $keywords[$keyword]['wordstat'] = $this->extractPosition($position);
                } else {
                    // Иначе сохраняем позицию по дате
                    $dateOnly = date('Y-m-d', strtotime($date));
                    $dates[] = $dateOnly;
                    $keywords[$keyword]['positions'][$dateOnly] = $this->extractPosition($position);
                }
            }
        }
        
        // Убираем дубликаты дат и сортируем
        $dates = array_unique($dates);
        sort($dates);
        
        return [
            'keywords' => array_values($keywords),
            'dates' => $dates
        ];
    }

    private function updateExcelHeaders($sheet, array $dates): void
    {
        $col = 'A';
        
        // Ключевое слово
        $sheet->setCellValue("{$col}14", 'Ключевое слово');
        $col++;
        
        // Частота Wordstat
        $sheet->setCellValue("{$col}14", 'Частота (Wordstat)');
        $col++;
        
        // Даты
        foreach ($dates as $date) {
            $sheet->setCellValue("{$col}14", $date);
            $col++;
        }
        
        // Применяем стили к заголовкам
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


    private function getPositionCategory($position): string
    {
        if ($position === null || $position === '' || $position === 0) {
            return 'Не найдено';
        } elseif ($position <= 3) {
            return 'Топ-3';
        } elseif ($position <= 10) {
            return '4-10';
        } else {
            return '11+';
        }
    }

    private function applyPositionColor($sheet, string $cell, $position): void
    {
        $color = match(true) {
            $position === null || $position === '' || $position === 0 => '6B7280', // Серый
            $position <= 3 => '10B981', // Зеленый
            $position <= 10 => 'F59E0B', // Желтый
            default => 'EF4444' // Красный
        };
        
        $sheet->getStyle($cell)->getFont()->setColor(new Color($color));
    }

    private function applyCategoryColor($sheet, string $cell, string $category): void
    {
        $color = match($category) {
            'Топ-3' => '10B981',
            '4-10' => 'F59E0B',
            '11+' => 'EF4444',
            'Не найдено' => '6B7280',
            default => '000000'
        };
        
        $sheet->getStyle($cell)->getFont()->setColor(new Color($color));
    }
    
    private function extractKeyword(array $position): string
    {
        return $position['keyword'] ?? 
               $position['keyword_value'] ?? 
               $position['query'] ?? 
               $position['text'] ?? 
               '';
    }
    
    private function extractPosition(array $position): ?int
    {
        $pos = $position['position'] ?? 
               $position['rank'] ?? 
               $position['pos'] ?? 
               $position['position_value'] ?? 
               null;
        
        return is_numeric($pos) ? (int)$pos : null;
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

    private function createPositionDistributionChart($sheet, int $startRow, int $endRow): void
    {
        try {
            // Создаем круговую диаграмму распределения позиций
            $dataSeriesLabels = [
                new DataSeriesValues('String', 'Worksheet!$A$' . ($startRow + 1) . ':$A$' . ($endRow + 1), null, 4),
            ];
            
            $xAxisTickValues = [
                new DataSeriesValues('String', 'Worksheet!$A$' . ($startRow + 1) . ':$A$' . ($endRow + 1), null, 4),
            ];
            
            $dataSeriesValues = [
                new DataSeriesValues('Number', 'Worksheet!$B$' . ($startRow + 1) . ':$B$' . ($endRow + 1), null, 4),
            ];
            
            $series = new DataSeries(
                DataSeries::TYPE_PIECHART,
                null,
                range(0, count($dataSeriesValues) - 1),
                $dataSeriesLabels,
                $xAxisTickValues,
                $dataSeriesValues
            );
            
            $plotArea = new PlotArea(null, [$series]);
            $legend = new Legend();
            $chart = new Chart(
                'Распределение позиций',
                new Title('Распределение позиций'),
                $legend,
                $plotArea,
                true,
                0,
                null,
                null
            );
            
            // Размещаем диаграмму справа от данных
            $chart->setTopLeftPosition('D' . ($startRow + 1));
            $chart->setBottomRightPosition('K' . ($startRow + 15));
            
            $sheet->addChart($chart);
        } catch (\Exception $e) {
            Log::error("Error creating position distribution chart: " . $e->getMessage());
        }
    }

    private function createVisibilityChart($sheet, int $startRow, int $endRow): void
    {
        try {
            // Создаем столбчатую диаграмму видимости
            $dataSeriesLabels = [
                new DataSeriesValues('String', 'Worksheet!$A$' . ($startRow + 1) . ':$A$' . ($endRow + 1), null, 5),
            ];
            
            $xAxisTickValues = [
                new DataSeriesValues('String', 'Worksheet!$A$' . ($startRow + 1) . ':$A$' . ($endRow + 1), null, 5),
            ];
            
            $dataSeriesValues = [
                new DataSeriesValues('Number', 'Worksheet!$B$' . ($startRow + 1) . ':$B$' . ($endRow + 1), null, 5),
            ];
            
            $series = new DataSeries(
                DataSeries::TYPE_BARCHART,
                DataSeries::GROUPING_STANDARD,
                range(0, count($dataSeriesValues) - 1),
                $dataSeriesLabels,
                $xAxisTickValues,
                $dataSeriesValues
            );
            
            $plotArea = new PlotArea(null, [$series]);
            $legend = new Legend();
            $chart = new Chart(
                'Статистика видимости',
                new Title('Статистика видимости'),
                $legend,
                $plotArea,
                true,
                0,
                null,
                null
            );
            
            // Размещаем диаграмму справа от данных
            $chart->setTopLeftPosition('D' . ($startRow + 1));
            $chart->setBottomRightPosition('K' . ($startRow + 10));
            
            $sheet->addChart($chart);
        } catch (\Exception $e) {
            Log::error("Error creating visibility chart: " . $e->getMessage());
        }
    }
}
