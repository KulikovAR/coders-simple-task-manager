<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class ListSubscriptionsCommand extends Command
{
    /**
     * Название команды
     *
     * @var string
     */
    protected $signature = 'subscription:list';

    /**
     * Описание команды
     *
     * @var string
     */
    protected $description = 'Показать список всех доступных тарифов';

    /**
     * Выполнение консольной команды
     */
    public function handle()
    {
        $subscriptions = Subscription::all();

        if ($subscriptions->isEmpty()) {
            $this->info('Тарифы не найдены. Запустите php artisan db:seed --class=SubscriptionSeeder для создания тарифов.');
            return 0;
        }

        $tableData = $subscriptions->map(function ($subscription) {
            return [
                'id' => $subscription->id,
                'name' => $subscription->name,
                'slug' => $subscription->slug,
                'price' => $subscription->price,
                'max_projects' => $subscription->isUnlimitedProjects() ? 'Неограничено' : $subscription->max_projects,
                'max_members' => $subscription->isUnlimitedMembers() ? 'Неограничено' : $subscription->max_members_per_project,
                'storage_gb' => $subscription->isUnlimitedStorage() ? 'Неограничено' : $subscription->storage_limit_gb,
                'ai_requests' => $subscription->ai_requests_limit,
                'ai_period' => $subscription->ai_requests_period === 'daily' ? 'Ежедневно' : 'Ежемесячно',
                'active' => $subscription->is_active ? 'Да' : 'Нет',
                'custom' => $subscription->is_custom ? 'Да' : 'Нет',
            ];
        });

        $this->info('Список доступных тарифов:');
        $this->table(
            ['ID', 'Название', 'Slug', 'Цена', 'Макс. проектов', 'Макс. участников', 'Хранилище (ГБ)', 'Лимит ИИ', 'Период ИИ', 'Активен', 'Индивидуальный'],
            $tableData
        );

        return 0;
    }
}
