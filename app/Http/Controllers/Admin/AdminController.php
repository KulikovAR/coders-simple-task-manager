<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    public function __construct(
        private AdminService $adminService
    ) {}

    /**
     * Главная страница админки
     */
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'auth' => ['user' => Auth::user()]
        ]);
    }

    /**
     * Список джобов с пагинацией
     */
    public function jobs(Request $request)
    {
        $filters = $request->only(['site_id', 'status', 'page', 'per_page']);
        
        $jobsData = $this->adminService->getTrackingJobs($filters);

        return Inertia::render('Admin/Jobs/Index', [
            'auth' => ['user' => Auth::user()],
            'jobs' => $jobsData['data'] ?? [],
            'pagination' => $jobsData['pagination'] ?? [],
            'meta' => $jobsData['meta'] ?? [],
            'filters' => $filters
        ]);
    }

    /**
     * Детали конкретного джоба
     */
    public function job(string $id)
    {
        $job = $this->adminService->getTrackingJob($id);

        if (!$job) {
            abort(404, 'Job not found');
        }

        return Inertia::render('Admin/Jobs/Show', [
            'auth' => ['user' => Auth::user()],
            'job' => $job
        ]);
    }
}
