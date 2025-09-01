<?php

namespace Database\Seeders;

use App\Models\Subscription;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $subscriptions = [
            [
                'name' => 'Бесплатный',
                'slug' => 'free',
                'price' => 0,
                'description' => 'Базовый тариф для небольших команд',
                'max_projects' => 10,
                'max_members_per_project' => 5,
                'storage_limit_gb' => 5,
                'ai_requests_limit' => 5,
                'ai_requests_period' => 'monthly',
                'is_custom' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Команда',
                'slug' => 'team',
                'price' => 199,
                'description' => 'Тариф для растущих команд с неограниченными проектами и участниками',
                'max_projects' => -1, // неограничено
                'max_members_per_project' => -1, // неограничено
                'storage_limit_gb' => -1, // неограничено
                'ai_requests_limit' => 5,
                'ai_requests_period' => 'monthly',
                'is_custom' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Команда + ИИ',
                'slug' => 'team-ai',
                'price' => 999,
                'description' => 'Расширенный тариф с доступом к продвинутым возможностям ИИ',
                'max_projects' => -1, // неограничено
                'max_members_per_project' => -1, // неограничено
                'storage_limit_gb' => -1, // неограничено
                'ai_requests_limit' => 50,
                'ai_requests_period' => 'daily',
                'is_custom' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Эксклюзив',
                'slug' => 'exclusive',
                'price' => 0, // Индивидуальная цена
                'description' => 'Индивидуальные условия для вашей команды',
                'max_projects' => -1, // неограничено
                'max_members_per_project' => -1, // неограничено
                'storage_limit_gb' => -1, // неограничено
                'ai_requests_limit' => 100,
                'ai_requests_period' => 'daily',
                'is_custom' => true,
                'is_active' => true,
            ],
        ];

        foreach ($subscriptions as $subscription) {
            Subscription::updateOrCreate(
                ['slug' => $subscription['slug']],
                $subscription
            );
        }
    }
}
