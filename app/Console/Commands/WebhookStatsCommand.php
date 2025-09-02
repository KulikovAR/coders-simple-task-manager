<?php

namespace App\Console\Commands;

use App\Models\Webhook;
use App\Models\WebhookLog;
use Illuminate\Console\Command;

class WebhookStatsCommand extends Command
{
    protected $signature = 'webhook:stats {--project=} {--days=7}';
    protected $description = 'Показать статистику webhook\'ов';

    public function handle()
    {
        $projectId = $this->option('project');
        $days = $this->option('days');
        
        $this->info("📊 Статистика webhook'ов за последние {$days} дней");
        $this->line('');

        // Общая статистика
        $totalWebhooks = Webhook::when($projectId, function($query) use ($projectId) {
            return $query->where('project_id', $projectId);
        })->count();

        $activeWebhooks = Webhook::when($projectId, function($query) use ($projectId) {
            return $query->where('project_id', $projectId);
        })->where('is_active', true)->count();

        $this->info("🔗 Всего webhook'ов: {$totalWebhooks}");
        $this->info("✅ Активных: {$activeWebhooks}");
        $this->info("❌ Неактивных: " . ($totalWebhooks - $activeWebhooks));
        $this->line('');

        // Статистика по событиям
        $this->info('📈 Статистика по событиям:');
        $eventStats = WebhookLog::when($projectId, function($query) use ($projectId) {
            return $query->whereHas('webhook', function($q) use ($projectId) {
                $q->where('project_id', $projectId);
            });
        })
        ->where('created_at', '>=', now()->subDays($days))
        ->selectRaw('event, COUNT(*) as count, AVG(execution_time) as avg_time')
        ->groupBy('event')
        ->get();

        foreach ($eventStats as $stat) {
            $this->line("  • {$stat->event}: {$stat->count} вызовов (ср. время: {$stat->avg_time}мс)");
        }
        $this->line('');

        // Топ webhook'ов по активности
        $this->info('🔥 Самые активные webhook\'ы:');
        $topWebhooks = Webhook::when($projectId, function($query) use ($projectId) {
            return $query->where('project_id', $projectId);
        })
        ->withCount(['logs' => function($query) use ($days) {
            $query->where('created_at', '>=', now()->subDays($days));
        }])
        ->orderBy('logs_count', 'desc')
        ->limit(5)
        ->get();

        foreach ($topWebhooks as $webhook) {
            $status = $webhook->is_active ? '✅' : '❌';
            $this->line("  {$status} {$webhook->name}: {$webhook->logs_count} вызовов");
        }
        $this->line('');

        // Статистика успешности
        $totalCalls = WebhookLog::when($projectId, function($query) use ($projectId) {
            return $query->whereHas('webhook', function($q) use ($projectId) {
                $q->where('project_id', $projectId);
            });
        })
        ->where('created_at', '>=', now()->subDays($days))
        ->count();

        $successfulCalls = WebhookLog::when($projectId, function($query) use ($projectId) {
            return $query->whereHas('webhook', function($q) use ($projectId) {
                $q->where('project_id', $projectId);
            });
        })
        ->where('created_at', '>=', now()->subDays($days))
        ->where('response_status', '>=', 200)
        ->where('response_status', '<', 300)
        ->count();

        $successRate = $totalCalls > 0 ? round(($successfulCalls / $totalCalls) * 100, 2) : 0;

        $this->info("📊 Общая статистика:");
        $this->line("  • Всего вызовов: {$totalCalls}");
        $this->line("  • Успешных: {$successfulCalls}");
        $this->line("  • Процент успеха: {$successRate}%");
        $this->line('');

        // Проблемные webhook'ы
        $problematicWebhooks = Webhook::when($projectId, function($query) use ($projectId) {
            return $query->where('project_id', $projectId);
        })
        ->whereHas('logs', function($query) use ($days) {
            $query->where('created_at', '>=', now()->subDays($days))
                  ->where(function($q) {
                      $q->where('response_status', '>=', 400)
                        ->orWhereNotNull('error_message');
                  });
        })
        ->withCount(['logs' => function($query) use ($days) {
            $query->where('created_at', '>=', now()->subDays($days))
                  ->where(function($q) {
                      $q->where('response_status', '>=', 400)
                        ->orWhereNotNull('error_message');
                  });
        }])
        ->get();

        if ($problematicWebhooks->count() > 0) {
            $this->warn('⚠️  Проблемные webhook\'ы:');
            foreach ($problematicWebhooks as $webhook) {
                $this->line("  • {$webhook->name}: {$webhook->logs_count} ошибок");
            }
        } else {
            $this->info('✅ Проблемных webhook\'ов не найдено!');
        }
    }
}