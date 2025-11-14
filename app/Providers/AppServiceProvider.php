<?php

namespace App\Providers;

use App\Services\Seo\Services\ApiBalanceManager;
use App\Services\Seo\Services\UserXmlApiSettingsService;
use App\Services\Seo\Services\XmlStockBalanceService;
use App\Services\Seo\Services\XmlRiverBalanceService;
use App\Services\Seo\Services\XmlStockTariffService;
use App\Services\Seo\Services\RecognitionCostCalculator;
use App\Services\Seo\Services\XmlRiverTariffService;
use App\Services\Seo\Services\WordstatCostCalculator;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ApiBalanceManager::class, function ($app) {
            $manager = new ApiBalanceManager();
            
            $xmlApiSettingsService = $app->make(UserXmlApiSettingsService::class);
            
            $xmlStockService = new XmlStockBalanceService($xmlApiSettingsService);
            $xmlRiverTariffService = $app->make(XmlRiverTariffService::class);
            $xmlRiverService = new XmlRiverBalanceService($xmlRiverTariffService);
            
            $manager->registerService('xmlstock', $xmlStockService);
            $manager->registerService('xmlriver', $xmlRiverService);
            
            return $manager;
        });

        $this->app->singleton(XmlStockTariffService::class, function ($app) {
            return new XmlStockTariffService($app->make(UserXmlApiSettingsService::class));
        });

        $this->app->singleton(XmlRiverTariffService::class, function ($app) {
            return new XmlRiverTariffService($app->make(UserXmlApiSettingsService::class));
        });

        $this->app->singleton(RecognitionCostCalculator::class, function ($app) {
            return new RecognitionCostCalculator($app->make(XmlStockTariffService::class));
        });

        $this->app->singleton(WordstatCostCalculator::class, function ($app) {
            return new WordstatCostCalculator($app->make(XmlRiverTariffService::class));
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Vite::prefetch(concurrency: 3);
    }
}
