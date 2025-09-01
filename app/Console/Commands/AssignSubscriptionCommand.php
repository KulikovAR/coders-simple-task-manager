<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class AssignSubscriptionCommand extends Command
{
    /**
     * Название команды
     *
     * @var string
     */
    protected $signature = 'subscription:assign
                            {identifier : ID пользователя или email}
                            {subscription : Slug тарифа (free, team, team-ai, exclusive)}
                            {--months=1 : Количество месяцев подписки}';

    /**
     * Описание команды
     *
     * @var string
     */
    protected $description = 'Назначить тариф пользователю по ID или email';

    /**
     * Сервис подписок
     */
    protected SubscriptionService $subscriptionService;

    /**
     * Создание нового экземпляра команды
     */
    public function __construct(SubscriptionService $subscriptionService)
    {
        parent::__construct();
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Выполнение консольной команды
     */
    public function handle()
    {
        $identifier = $this->argument('identifier');
        $subscriptionSlug = $this->argument('subscription');
        $months = (int) $this->option('months');

        // Поиск пользователя
        $user = is_numeric($identifier) 
            ? User::find($identifier) 
            : User::where('email', $identifier)->first();

        if (!$user) {
            $this->error("Пользователь с ID или email '{$identifier}' не найден");
            return 1;
        }

        // Поиск тарифа
        $subscription = $this->subscriptionService->getSubscriptionBySlug($subscriptionSlug);

        if (!$subscription) {
            $this->error("Тариф с slug '{$subscriptionSlug}' не найден");
            $this->info("Доступные тарифы:");
            
            $subscriptions = Subscription::all();
            $this->table(
                ['ID', 'Название', 'Slug', 'Цена'],
                $subscriptions->map(fn($sub) => [
                    'id' => $sub->id,
                    'name' => $sub->name,
                    'slug' => $sub->slug,
                    'price' => $sub->price
                ])
            );
            
            return 1;
        }

        // Подтверждение действия
        if (!$this->confirm("Вы уверены, что хотите назначить тариф '{$subscription->name}' пользователю {$user->name} ({$user->email}) на {$months} месяц(ев)?")) {
            $this->info('Операция отменена');
            return 0;
        }

        // Назначение тарифа
        try {
            $this->subscriptionService->assignSubscriptionToUser($user, $subscription, $months);
            $this->info("Тариф '{$subscription->name}' успешно назначен пользователю {$user->name} ({$user->email}) на {$months} месяц(ев)");
            
            // Показать информацию о тарифе пользователя
            $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
            
            $this->info("\nИнформация о тарифе пользователя:");
            $this->table(
                ['Параметр', 'Значение'],
                [
                    ['Тариф', $subscriptionInfo['name']],
                    ['Действует до', $subscriptionInfo['expires_at'] ? $subscriptionInfo['expires_at']->format('d.m.Y H:i') : 'Бессрочно'],
                    ['Лимит проектов', $subscriptionInfo['projects_limit'] === -1 ? 'Неограничено' : $subscriptionInfo['projects_limit']],
                    ['Использовано проектов', $subscriptionInfo['projects_used']],
                    ['Лимит участников на проект', $subscriptionInfo['members_limit'] === -1 ? 'Неограничено' : $subscriptionInfo['members_limit']],
                    ['Лимит хранилища (ГБ)', $subscriptionInfo['storage_limit'] === -1 ? 'Неограничено' : $subscriptionInfo['storage_limit']],
                    ['Использовано хранилища (ГБ)', $subscriptionInfo['storage_used']],
                    ['Лимит запросов к ИИ', $subscriptionInfo['ai_requests_limit']],
                    ['Период сброса запросов к ИИ', $subscriptionInfo['ai_requests_period'] === 'daily' ? 'Ежедневно' : 'Ежемесячно'],
                    ['Использовано запросов к ИИ', $subscriptionInfo['ai_requests_used']],
                ]
            );
            
            return 0;
        } catch (\Exception $e) {
            $this->error("Ошибка при назначении тарифа: {$e->getMessage()}");
            return 1;
        }
    }
}
