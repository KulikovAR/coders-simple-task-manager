<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ShowSubscriptionCommand extends Command
{
    /**
     * Название команды
     *
     * @var string
     */
    protected $signature = 'subscription:show {identifier? : ID пользователя или email}';

    /**
     * Описание команды
     *
     * @var string
     */
    protected $description = 'Показать информацию о тарифе пользователя';

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

        if ($identifier) {
            // Показать информацию о конкретном пользователе
            $user = is_numeric($identifier) 
                ? User::find($identifier) 
                : User::where('email', $identifier)->first();

            if (!$user) {
                $this->error("Пользователь с ID или email '{$identifier}' не найден");
                return 1;
            }

            $this->showUserSubscriptionInfo($user);
        } else {
            // Показать список всех пользователей с их тарифами
            $this->showAllUsersSubscriptions();
        }

        return 0;
    }

    /**
     * Показать информацию о тарифе пользователя
     */
    private function showUserSubscriptionInfo(User $user): void
    {
        $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);

        $this->info("Информация о тарифе пользователя {$user->name} ({$user->email}):");
        $this->table(
            ['Параметр', 'Значение'],
            [
                ['ID пользователя', $user->id],
                ['Имя', $user->name],
                ['Email', $user->email],
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
                ['Сброс счетчика запросов к ИИ', $subscriptionInfo['ai_requests_reset_at'] ? $subscriptionInfo['ai_requests_reset_at']->format('d.m.Y H:i') : 'Не задано'],
            ]
        );
    }

    /**
     * Показать список всех пользователей с их тарифами
     */
    private function showAllUsersSubscriptions(): void
    {
        $users = User::with('subscription')->get();

        $tableData = $users->map(function ($user) {
            $subscription = $user->subscription;
            $expiresAt = $user->subscription_expires_at ? $user->subscription_expires_at->format('d.m.Y') : '-';
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'subscription' => $subscription ? $subscription->name : 'Нет тарифа',
                'expires_at' => $expiresAt,
                'ai_requests_used' => $user->ai_requests_used,
                'ai_requests_limit' => $subscription ? $subscription->ai_requests_limit : 0,
                'ai_period' => $subscription ? ($subscription->ai_requests_period === 'daily' ? 'Ежедневно' : 'Ежемесячно') : '-',
            ];
        });

        $this->info("Список пользователей и их тарифов:");
        $this->table(
            ['ID', 'Имя', 'Email', 'Тариф', 'Действует до', 'Использовано запросов ИИ', 'Лимит запросов ИИ', 'Период'],
            $tableData
        );
    }
}
