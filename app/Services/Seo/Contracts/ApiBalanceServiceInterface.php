<?php

namespace App\Services\Seo\Contracts;

interface ApiBalanceServiceInterface
{
    public function getBalance(): ?array;
    
    public function isConfigured(): bool;
}
