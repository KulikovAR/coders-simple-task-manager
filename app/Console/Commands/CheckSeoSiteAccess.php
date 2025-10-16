<?php

namespace App\Console\Commands;

use App\Models\SeoSite;
use App\Models\User;
use Illuminate\Console\Command;

class CheckSeoSiteAccess extends Command
{
    protected $signature = 'seo:check-access {user_id?}';
    protected $description = 'Проверить доступ пользователей к SEO сайтам';

    public function handle()
    {
        $userId = $this->argument('user_id');
        
        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("Пользователь с ID {$userId} не найден");
                return;
            }
            $this->checkUserAccess($user);
        } else {
            $users = User::all();
            foreach ($users as $user) {
                $this->checkUserAccess($user);
            }
        }
    }

    private function checkUserAccess(User $user)
    {
        $this->info("Проверка доступа для пользователя: {$user->name} (ID: {$user->id})");
        
        $sites = SeoSite::where('user_id', $user->id)->get();
        
        if ($sites->isEmpty()) {
            $this->warn("  У пользователя нет SEO сайтов");
            return;
        }
        
        foreach ($sites as $site) {
            $this->line("  - Сайт: {$site->name} (go_seo_site_id: {$site->go_seo_site_id})");
        }
        
        $this->line("");
    }
}