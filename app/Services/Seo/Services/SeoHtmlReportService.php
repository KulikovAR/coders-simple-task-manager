<?php

namespace App\Services\Seo\Services;

class SeoHtmlReportService
{
    public function generateHtmlReport(array $reportData, int $reportId): string
    {
        $project = $reportData['project'];
        $positions = $reportData['positions'];
        $filters = $reportData['filters'];
        $stats = $reportData['statistics'];
        
        $tableData = $this->prepareTableData($positions);
        
        $html = '<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отчет по позициям - ' . htmlspecialchars($project['name']) . '</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
            background-color: #ffffff;
            color: #37352f;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 40px 24px;
        }
        
        .header { 
            margin-bottom: 48px;
            border-bottom: 1px solid #e9e9e7;
            padding-bottom: 32px;
        }
        
        .header h1 { 
            font-size: 32px;
            font-weight: 700;
            color: #37352f;
            margin-bottom: 8px;
            letter-spacing: -0.01em;
        }
        
        .header p {
            font-size: 16px;
            color: #787774;
            font-weight: 400;
        }
        
        .meta-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 48px;
            padding: 24px;
            background: #f7f6f3;
            border-radius: 8px;
            border: 1px solid #e9e9e7;
        }
        
        .meta-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        .meta-label { 
            font-size: 12px;
            font-weight: 500;
            color: #787774;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .meta-value { 
            font-size: 16px;
            font-weight: 600;
            color: #37352f;
        }
        
        .stats-section {
            margin-bottom: 48px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #37352f;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .section-title::before {
            content: "";
            width: 4px;
            height: 20px;
            background: #37352f;
            border-radius: 2px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 48px;
        }
        
        .chart-card {
            background: #ffffff;
            border: 1px solid #e9e9e7;
            border-radius: 8px;
            padding: 24px;
        }
        
        .chart-title {
            font-size: 16px;
            font-weight: 600;
            color: #37352f;
            margin-bottom: 20px;
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .data-table {
            background: #ffffff;
            border: 1px solid #e9e9e7;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 48px;
        }
        
        .table-header {
            background: #f7f6f3;
            border-bottom: 1px solid #e9e9e7;
            padding: 16px 24px;
        }
        
        .table-title {
            font-size: 16px;
            font-weight: 600;
            color: #37352f;
        }
        
        table { 
            width: 100%; 
            border-collapse: collapse;
        }
        
        th, td { 
            padding: 12px 24px;
            text-align: left;
            border-bottom: 1px solid #e9e9e7;
        }
        
        th { 
            background: #f7f6f3;
            font-weight: 600;
            font-size: 12px;
            color: #787774;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e9e9e7;
        }
        
        tbody tr:hover { 
            background: #f7f6f3;
        }
        
        .keyword-cell {
            font-weight: 600;
            color: #37352f;
        }
        
        .wordstat-cell {
            text-align: center;
            font-weight: 500;
            color: #787774;
        }
        
        .position-cell {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
            text-align: center;
            min-width: 32px;
        }
        
        .position-top3 { 
            background: #e8f5e8; 
            color: #2d5a2d; 
        }
        
        .position-top10 { 
            background: #fff4e6; 
            color: #8b5a00; 
        }
        
        .position-low { 
            background: #ffe6e6; 
            color: #8b0000; 
        }
        
        .position-not-found { 
            background: #f0f0f0; 
            color: #666666; 
        }
        
        .position-no-data { 
            background: #f8f9fa; 
            color: #999999; 
            font-style: italic;
        }
        
        .footer {
            border-top: 1px solid #e9e9e7;
            padding-top: 24px;
            text-align: center;
            color: #787774;
            font-size: 12px;
        }
        
        .date-cell {
            text-align: center;
            font-size: 12px;
            color: #787774;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 24px 16px;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
                gap: 24px;
            }
            
            .meta-info {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            th, td {
                padding: 8px 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Отчет по позициям</h1>
            <p>' . htmlspecialchars($project['name']) . '</p>
        </div>
        
        <div class="meta-info">
            <div class="meta-item">
                <div class="meta-label">Период</div>
                <div class="meta-value">' . htmlspecialchars($filters['date_from']) . ' — ' . htmlspecialchars($filters['date_to']) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Источник</div>
                <div class="meta-value">' . htmlspecialchars($filters['source']) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Ключевых слов</div>
                <div class="meta-value">' . ($stats['keywords_count'] ?? count($tableData['keywords'])) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Топ-3 позиции</div>
                <div class="meta-value">' . ($stats['position_distribution']['top_3'] ?? 0) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Позиции 4-10</div>
                <div class="meta-value">' . ($stats['position_distribution']['top_10'] ?? 0) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Позиции 11-20</div>
                <div class="meta-value">' . ($stats['position_distribution']['top_20'] ?? 0) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Не найдено</div>
                <div class="meta-value">' . ($stats['position_distribution']['not_found'] ?? 0) . '</div>
            </div>
            <div class="meta-item">
                <div class="meta-label">Видимость</div>
                <div class="meta-value">' . ($stats['visible'] ?? 0) . '</div>
            </div>
        </div>
        
        <div class="stats-section">
            <div class="section-title">Аналитика</div>
            
            <div class="charts-grid">
                <div class="chart-card">
                    <div class="chart-title">Распределение позиций</div>
                    <div class="chart-container">
                        <canvas id="positionChart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-title">Динамика позиций</div>
                    <div class="chart-container">
                        <canvas id="trendChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="data-table">
            <div class="table-header">
                <div class="table-title">Детальная статистика</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Ключевое слово</th>
                        <th class="date-cell">Частота</th>';
        
        // Добавляем заголовки дат
        foreach ($tableData['dates'] as $date) {
            $html .= '<th class="date-cell">' . htmlspecialchars($date) . '</th>';
        }
        
        $html .= '</tr>
            </thead>
            <tbody>';
        
        // Добавляем строки с ключевыми словами
        foreach ($tableData['keywords'] as $keywordData) {
            $html .= '<tr>
                <td class="keyword-cell">' . htmlspecialchars($keywordData['keyword']) . '</td>
                <td class="wordstat-cell">' . ($keywordData['wordstat'] ? number_format($keywordData['wordstat'], 0, ',', ' ') : '—') . '</td>';
            
            // Добавляем позиции по датам
            foreach ($tableData['dates'] as $date) {
                $position = $keywordData['positions'][$date] ?? null;
                $positionClass = $this->getPositionClass($position);
                
                // Определяем текст для отображения
                if ($position === null) {
                    $positionText = '—'; // Дефис - отсутствие данных
                } elseif ($position === 0) {
                    $positionText = '0'; // Сайт не найден
                } else {
                    $positionText = $position; // Реальная позиция
                }
                
                $html .= '<td class="date-cell"><span class="position-cell ' . $positionClass . '">' . htmlspecialchars($positionText) . '</span></td>';
            }
            
            $html .= '</tr>';
        }
        
        $html .= '</tbody>
        </table>
        
        <div class="footer">
            <p>Отчет сгенерирован ' . now()->format('d.m.Y в H:i') . '</p>
        </div>
    </div>
    
    <script>
        // Данные для графиков
        const statsData = ' . json_encode($stats) . ';
        const tableData = ' . json_encode($tableData) . ';
        
        // График распределения позиций
        const ctx1 = document.getElementById("positionChart").getContext("2d");
        new Chart(ctx1, {
            type: "doughnut",
            data: {
                labels: ["Топ-3", "4-10", "11-20", "Не найдено"],
                datasets: [{
                    data: [
                        statsData.position_distribution?.top_3 || 0,
                        statsData.position_distribution?.top_10 || 0,
                        statsData.position_distribution?.top_20 || 0,
                        statsData.position_distribution?.not_found || 0
                    ],
                    backgroundColor: ["#2d5a2d", "#8b5a00", "#8b0000", "#666666"],
                    borderWidth: 0,
                    cutout: "60%"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                family: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
                            },
                            color: "#37352f"
                        }
                    }
                }
            }
        });
        
        // График динамики позиций
        const ctx2 = document.getElementById("trendChart").getContext("2d");
        
        // Группируем позиции по датам (только позиции, без Wordstat)
        const dateGroups = {};
        tableData.keywords.forEach(keywordData => {
            Object.keys(keywordData.positions).forEach(date => {
                if (!dateGroups[date]) {
                    dateGroups[date] = { top3: 0, top10: 0, top20: 0, notFound: 0 };
                }
                const rank = keywordData.positions[date];
                if (rank === null) {
                    // Дефис - отсутствие данных, не учитываем в графике
                    return;
                } else if (rank === 0) {
                    // Сайт не найден в поисковых системах
                    dateGroups[date].notFound++;
                } else if (rank <= 3) {
                    dateGroups[date].top3++;
                } else if (rank <= 10) {
                    dateGroups[date].top10++;
                } else if (rank <= 20) {
                    dateGroups[date].top20++;
                }
                // Позиции выше 20 не отображаем в графике для упрощения
            });
        });
        
        const sortedDates = Object.keys(dateGroups).sort();
        
        new Chart(ctx2, {
            type: "line",
            data: {
                labels: sortedDates,
                datasets: [
                    {
                        label: "Топ-3",
                        data: sortedDates.map(date => dateGroups[date].top3),
                        borderColor: "#2d5a2d",
                        backgroundColor: "rgba(45, 90, 45, 0.1)",
                        tension: 0.1,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "4-10",
                        data: sortedDates.map(date => dateGroups[date].top10),
                        borderColor: "#8b5a00",
                        backgroundColor: "rgba(139, 90, 0, 0.1)",
                        tension: 0.1,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "11-20",
                        data: sortedDates.map(date => dateGroups[date].top20),
                        borderColor: "#8b0000",
                        backgroundColor: "rgba(139, 0, 0, 0.1)",
                        tension: 0.1,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: "Не найдено",
                        data: sortedDates.map(date => dateGroups[date].notFound),
                        borderColor: "#666666",
                        backgroundColor: "rgba(102, 102, 102, 0.1)",
                        tension: 0.1,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Количество позиций",
                            font: {
                                size: 12,
                                family: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
                            },
                            color: "#787774"
                        },
                        grid: {
                            color: "#e9e9e7"
                        },
                        ticks: {
                            color: "#787774",
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Дата",
                            font: {
                                size: 12,
                                family: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
                            },
                            color: "#787774"
                        },
                        grid: {
                            color: "#e9e9e7"
                        },
                        ticks: {
                            color: "#787774",
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                family: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
                            },
                            color: "#37352f"
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>';
        
        return $html;
    }

    public function exportToHtml(array $reportData, int $reportId): string
    {
        $html = $this->generateHtmlReport($reportData, $reportId);
        
        $fileName = \Illuminate\Support\Str::uuid() . '.html';
        $filePath = "public/reports/{$fileName}";
        
        // Создаем директорию если не существует
        $directory = base_path('public/reports');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
        
        file_put_contents(base_path($filePath), $html);
        
        return "/reports/{$fileName}";
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


    private function getPositionClass($position): string
    {
        if ($position === null) {
            return 'position-no-data';
        } elseif ($position === 0) {
            return 'position-not-found';
        } elseif ($position <= 3) {
            return 'position-top3';
        } elseif ($position <= 10) {
            return 'position-top10';
        } else {
            return 'position-low';
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
