<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        // Получаем проекты пользователя
        $projects = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->withCount('tasks')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        // Получаем статус "In Progress" для подсчета задач в работе
        $inProgressStatus = TaskStatus::where('name', 'In Progress')->first();
        
        $stats = [
            'projects_count' => Project::where('owner_id', $user->id)
                ->orWhereHas('members', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })->count(),
            'tasks_in_progress' => $inProgressStatus ? 
                Task::where('status_id', $inProgressStatus->id)
                    ->whereHas('project', function($query) use ($user) {
                        $query->where('owner_id', $user->id)
                              ->orWhereHas('members', function($memberQuery) use ($user) {
                                  $memberQuery->where('user_id', $user->id);
                              });
                    })->count() : 0,
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'projects' => $projects,
        ]);
    }
} 