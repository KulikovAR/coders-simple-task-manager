<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminStatsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminStatsController extends Controller
{
    public function __construct(
        private AdminStatsService $statsService
    )
    {
    }

    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');

        $stats = $this->statsService->getAllStats($dateFrom, $dateTo);

        return Inertia::render('Admin/Stats/Index', [
            'auth' => ['user' => Auth::user()],
            'stats' => $stats,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}

