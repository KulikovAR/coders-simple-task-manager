<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LazyContextProvider implements ContextProviderInterface
{
    private array $providers;
    private int $cacheTtl;

    public function __construct(array $providers = [], int $cacheTtl = 300)
    {
        $this->providers = $providers;
        $this->cacheTtl = $cacheTtl;
    }

    public function getName(): string
    {
        return 'lazy_context';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        $cacheKey = "lazy_context_user_{$user->id}";
        
        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($user) {
            $context = [];
            
            foreach ($this->providers as $provider) {
                if ($provider instanceof ContextProviderInterface) {
                    try {
                        $providerContext = $provider->getContext($user);
                        $context[$provider->getName()] = $providerContext;
                    } catch (\Exception $e) {
                        // Логируем ошибку, но продолжаем работу
                        \Log::warning("Context provider {$provider->getName()} failed", [
                            'error' => $e->getMessage(),
                            'user_id' => $user->id
                        ]);
                    }
                }
            }
            
            return $context;
        });
    }

    /**
     * Очистить кэш контекста для пользователя
     */
    public function clearUserCache(User $user): void
    {
        $cacheKey = "lazy_context_user_{$user->id}";
        Cache::forget($cacheKey);
    }

    /**
     * Очистить весь кэш контекста
     */
    public function clearAllCache(): void
    {
        Cache::flush();
    }
}
