<?php

namespace App\Console\Commands;

use App\Models\SeoSite;
use App\Services\Seo\Services\MicroserviceClient;
use Illuminate\Console\Command;

class MigrateKeywordGroupsCommand extends Command
{
    protected $signature = 'seo:migrate-keyword-groups';

    protected $description = 'Создает группу "default" для каждого существующего сайта';

    public function __construct(
        private MicroserviceClient $microserviceClient
    ) {
        parent::__construct();
    }

    public function handle()
    {
        $this->info('Начинаем миграцию групп ключевых слов...');
        
        $sites = SeoSite::all();
        $total = $sites->count();
        
        if ($total === 0) {
            $this->warn('Не найдено сайтов для миграции');
            return 0;
        }
        
        $this->info("Найдено сайтов: {$total}");
        $this->newLine();
        
        $results = [];
        $bar = $this->output->createProgressBar($total);
        $bar->start();
        
        foreach ($sites as $site) {
            $siteId = $site->go_seo_site_id;
            
            try {
                $existingGroups = $this->microserviceClient->getGroups($siteId);
                $defaultGroup = collect($existingGroups)->firstWhere('name', 'default');
                
                if ($defaultGroup) {
                    $groupId = $defaultGroup['id'];
                    $results[] = [
                        'site_id' => $siteId,
                        'group_id' => $groupId,
                        'status' => 'exists'
                    ];
                } else {
                    $newGroup = $this->microserviceClient->createGroup($siteId, 'default');
                    
                    if ($newGroup && isset($newGroup['id'])) {
                        $groupId = $newGroup['id'];
                        $results[] = [
                            'site_id' => $siteId,
                            'group_id' => $groupId,
                            'status' => 'created'
                        ];
                    } else {
                        $results[] = [
                            'site_id' => $siteId,
                            'group_id' => null,
                            'status' => 'failed'
                        ];
                    }
                }
            } catch (\Exception $e) {
                $results[] = [
                    'site_id' => $siteId,
                    'group_id' => null,
                    'status' => 'error',
                    'error' => $e->getMessage()
                ];
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine(2);
        
        $this->info('Результаты миграции:');
        $this->newLine();
        
        $successful = 0;
        $failed = 0;
        $existing = 0;
        
        foreach ($results as $result) {
            if ($result['status'] === 'created') {
                $successful++;
                $this->line("site_id: {$result['site_id']}, group_id: {$result['group_id']} [создана]");
            } elseif ($result['status'] === 'exists') {
                $existing++;
                $this->line("site_id: {$result['site_id']}, group_id: {$result['group_id']} [уже существует]");
            } else {
                $failed++;
                $error = isset($result['error']) ? " - {$result['error']}" : '';
                $this->error("site_id: {$result['site_id']}, group_id: - [ошибка{$error}]");
            }
        }
        
        $this->newLine();
        $this->info("Успешно создано: {$successful}");
        $this->info("Уже существовало: {$existing}");
        $this->warn("Ошибок: {$failed}");
        
        return 0;
    }
}

