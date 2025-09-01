<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionUserLimit;
use App\Models\User;
use Illuminate\Support\Collection;

class SubscriptionService
{
    /**
     * Получить все активные тарифы
     */
    public function getActiveSubscriptions(): Collection
    {
        return Subscription::where('is_active', true)
            ->where('is_custom', false)
            ->orderBy('price')
            ->get();
    }

    /**
     * Получить тариф по slug
     */
    public function getSubscriptionBySlug(string $slug): ?Subscription
    {
        return Subscription::where('slug', $slug)->first();
    }

    /**
     * Назначить тариф пользователю
     */
    public function assignSubscriptionToUser(User $user, Subscription $subscription, int $months = 1): void
    {
        $user->subscription_id = $subscription->id;
        $user->subscription_expires_at = now()->addMonths($months);
        $user->ai_requests_used = 0;
        $user->updateAiRequestsResetDate();
        $user->save();

        // Создаем или обновляем запись лимитов пользователя
        SubscriptionUserLimit::updateOrCreate(
            ['user_id' => $user->id],
            ['storage_used_bytes' => 0]
        );
    }

    /**
     * Проверить, может ли пользователь создать еще один проект
     */
    public function canCreateProject(User $user): bool
    {
        if (!$user->subscription) {
            return false;
        }

        if ($user->subscription->isUnlimitedProjects()) {
            return true;
        }
        
        // Учитываем как проекты, где пользователь владелец, так и проекты, где он участник
        // Используем коллекцию для исключения дублирования проектов
        $ownedProjects = $user->ownedProjects()->get();
        $memberProjects = $user->projects()->get();
        
        // Объединяем коллекции и удаляем дубликаты по ID
        $allProjects = $ownedProjects->concat($memberProjects)->unique('id');
        $totalProjectsCount = $allProjects->count();
        
        return $totalProjectsCount < $user->subscription->max_projects;
    }

    /**
     * Проверить, может ли пользователь добавить еще одного участника в проект
     */
    public function canAddMemberToProject(User $user, int $currentMembersCount): bool
    {
        if (!$user->subscription) {
            return false;
        }

        if ($user->subscription->isUnlimitedMembers()) {
            return true;
        }

        return $currentMembersCount < $user->subscription->max_members_per_project;
    }

    /**
     * Проверить, может ли пользователь использовать ИИ
     */
    public function canUseAi(User $user): bool
    {
        if (!$user->subscription) {
            return false;
        }

        return $user->hasAvailableAiRequests();
    }

    /**
     * Проверить, может ли пользователь загрузить файл определенного размера
     */
    public function canUploadFile(User $user, int $fileSize): bool
    {
        if (!$user->subscription) {
            return false;
        }

        if (!$user->subscriptionLimit) {
            return false;
        }

        return $user->subscriptionLimit->hasAvailableStorage($fileSize);
    }

    /**
     * Получить информацию о тарифе пользователя
     */
    public function getUserSubscriptionInfo(User $user): array
    {
        if (!$user->subscription) {
            return [
                'name' => 'Нет активного тарифа',
                'expires_at' => null,
                'projects_limit' => 0,
                'projects_used' => 0,
                'members_limit' => 0,
                'storage_limit' => 0,
                'storage_used' => 0,
                'ai_requests_limit' => 0,
                'ai_requests_used' => 0,
                'ai_requests_reset_at' => null,
            ];
        }

        $projectsLimit = $user->subscription->isUnlimitedProjects() ? -1 : $user->subscription->max_projects;
        $membersLimit = $user->subscription->isUnlimitedMembers() ? -1 : $user->subscription->max_members_per_project;
        $storageLimit = $user->subscription->isUnlimitedStorage() ? -1 : $user->subscription->storage_limit_gb;

        $storageUsed = 0;
        if ($user->subscriptionLimit) {
            $storageUsed = $user->subscriptionLimit->getStorageUsedGb();
        }

        return [
            'name' => $user->subscription->name,
            'expires_at' => $user->subscription_expires_at,
            'projects_limit' => $projectsLimit,
            'projects_used' => $user->ownedProjects()->get()->concat($user->projects()->get())->unique('id')->count(),
            'members_limit' => $membersLimit,
            'storage_limit' => $storageLimit,
            'storage_used' => $storageUsed,
            'ai_requests_limit' => $user->subscription->ai_requests_limit,
            'ai_requests_used' => $user->ai_requests_used,
            'ai_requests_period' => $user->subscription->ai_requests_period,
            'ai_requests_reset_at' => $user->ai_requests_reset_at,
        ];
    }

    /**
     * Обработать использование ИИ пользователем
     */
    public function processAiUsage(User $user): bool
    {
        if (!$this->canUseAi($user)) {
            return false;
        }

        $user->incrementAiRequestsUsed();
        return true;
    }

    /**
     * Обработать загрузку файла пользователем
     */
    public function processFileUpload(User $user, int $fileSize): bool
    {
        if (!$this->canUploadFile($user, $fileSize)) {
            return false;
        }

        if ($user->subscriptionLimit) {
            $user->subscriptionLimit->addStorageUsed($fileSize);
        }

        return true;
    }

    /**
     * Обработать удаление файла пользователем
     */
    public function processFileDelete(User $user, int $fileSize): void
    {
        if ($user->subscriptionLimit) {
            $user->subscriptionLimit->subtractStorageUsed($fileSize);
        }
    }
}
