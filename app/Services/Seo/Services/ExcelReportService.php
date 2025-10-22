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
            
            // Статистика
            $stats = $this->prepareStatsData($reportData['positions']);
            $sheet->setCellValue('A6', 'Статистика:');
            $sheet->setCellValue('A7', 'Топ-3 позиции: ' . $stats['top3']);
            $sheet->setCellValue('A8', 'Позиции 4-10: ' . $stats['top10']);
            $sheet->setCellValue('A9', 'Позиции 11+: ' . $stats['low']);
            $sheet->setCellValue('A10', 'Не найдено: ' . $stats['none']);
            
            $sheet->getStyle('A6')->getFont()->setBold(true);
            $sheet->getStyle('A7:A10')->getFont()->setSize(11);
            
            // Заголовки таблицы
            $sheet->setCellValue('A12', 'Ключевое слово');
            $sheet->setCellValue('B12', 'Позиция');
            $sheet->setCellValue('C12', 'Дата');
            $sheet->setCellValue('D12', 'Источник');
            $sheet->setCellValue('E12', 'Категория');
            
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
            
            $sheet->getStyle('A12:E12')->applyFromArray($headerStyle);
            
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
                $sheet->setCellValue("A13", 'Нет данных для отображения');
                $sheet->mergeCells("A13:E13");
                $sheet->getStyle("A13")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle("A13")->getFont()->setItalic(true);
                return;
            }
            
            // Подготавливаем данные для таблицы
            $tableData = $this->prepareTableData($positions);
            
            // Обновляем заголовки таблицы
            $this->updateExcelHeaders($sheet, $tableData['dates']);
            
            // Заполняем данные
            $row = 13;
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
            
            if ($lastRow >= 13) {
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
                
                $sheet->getStyle("A13:{$lastCol}{$lastRow}")->applyFromArray($dataStyle);
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
        
        // Рассчитываем позицию для статистики: начало данных (13) + количество ключевых слов + отступ
        $chartRow = 13 + $keywordCount + 3;
        
        $sheet->setCellValue("A{$chartRow}", 'Статистика по категориям позиций');
        $sheet->getStyle("A{$chartRow}")->getFont()->setBold(true)->setSize(14);
        
        // Добавляем данные для диаграммы
        $stats = $this->prepareStatsData($reportData['positions']);
        $chartRow += 2;
        
        $sheet->setCellValue("A{$chartRow}", 'Категория');
        $sheet->setCellValue("B{$chartRow}", 'Количество');
        $sheet->getStyle("A{$chartRow}:B{$chartRow}")->getFont()->setBold(true);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Топ-3');
        $sheet->setCellValue("B{$chartRow}", $stats['top3']);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", '4-10');
        $sheet->setCellValue("B{$chartRow}", $stats['top10']);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", '11+');
        $sheet->setCellValue("B{$chartRow}", $stats['low']);
        
        $chartRow++;
        $sheet->setCellValue("A{$chartRow}", 'Не найдено');
        $sheet->setCellValue("B{$chartRow}", $stats['none']);
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
        $sheet->setCellValue("{$col}12", 'Ключевое слово');
        $col++;
        
        // Частота Wordstat
        $sheet->setCellValue("{$col}12", 'Частота (Wordstat)');
        $col++;
        
        // Даты
        foreach ($dates as $date) {
            $sheet->setCellValue("{$col}12", $date);
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
        
        $sheet->getStyle("A12:{$lastCol}12")->applyFromArray($headerStyle);
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

    private function prepareStatsData(array $positions): array
    {
        $top3 = 0;
        $top10 = 0;
        $low = 0;
        $none = 0;

        foreach ($positions as $position) {
            $source = $this->extractSource($position);
            
            // Исключаем Wordstat из статистики позиций
            if ($source === 'Wordstat') {
                continue;
            }
            
            $rank = $this->extractPosition($position);
            
            if ($rank === null || $rank === '' || $rank === 0) {
                $none++;
            } elseif ($rank <= 3) {
                $top3++;
            } elseif ($rank <= 10) {
                $top10++;
            } else {
                $low++;
            }
        }

        return [
            'top3' => $top3,
            'top10' => $top10,
            'low' => $low,
            'none' => $none,
        ];
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
}
