<?php

namespace App\Services\Seo\Services;

use App\Services\Seo\Contracts\ApiBalanceServiceInterface;
use Illuminate\Support\Collection;

class ApiBalanceManager
{
    private array $services = [];

    public function registerService(string $provider, ApiBalanceServiceInterface $service): void
    {
        $this->services[$provider] = $service;
    }

    public function getBalances(): Collection
    {
        $balances = collect();
        
        foreach ($this->services as $provider => $service) {
            if ($service->isConfigured()) {
                $balance = $service->getBalance();
                if ($balance) {
                    $balances->push($balance);
                }
            }
        }
        
        return $balances;
    }

    public function getConfiguredProviders(): Collection
    {
        return collect($this->services)
            ->filter(fn($service) => $service->isConfigured())
            ->keys();
    }
}
