<?php

namespace Tests\Feature\Traits;

use Illuminate\Testing\TestResponse;

trait OptimizedTestResponse
{
    /**
     * Оптимизирует ответ теста для уменьшения использования памяти
     */
    protected function optimizeResponse(TestResponse $response): void
    {
        // Очищаем сессию после каждого запроса
        $response->assertSessionHasNoErrors();
        session()->flush();
        
        // Очищаем кэш
        cache()->flush();
        
        // Очищаем shared data в Inertia
        if (method_exists($this, 'cleanInertia')) {
            $this->cleanInertia();
        }
        
        // Освобождаем память
        gc_collect_cycles();
    }
    
    /**
     * Очищает shared data в Inertia после каждого теста
     */
    protected function cleanInertia(): void
    {
        $this->app['inertia.testing.data-provider'] = null;
    }
}
