<?php

namespace App\Http\Controllers;

use App\Services\Seo\Services\ApiBalanceManager;
use Illuminate\Http\JsonResponse;

class ApiBalanceController extends Controller
{
    private ApiBalanceManager $balanceManager;

    public function __construct(ApiBalanceManager $balanceManager)
    {
        $this->balanceManager = $balanceManager;
    }

    public function index(): JsonResponse
    {
        $balances = $this->balanceManager->getBalances();

        return response()->json([
            'success' => true,
            'data' => $balances->toArray()
        ]);
    }
}
