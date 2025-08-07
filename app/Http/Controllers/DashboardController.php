<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $projects = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->withCount('tasks')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        $inProgressStatus = TaskStatus::where('name', 'In Progress')->first();

        $userProjects = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            });

        $stats = [
            'projects_count' => $userProjects->count(),
            'tasks_in_progress' => $inProgressStatus ?
                Task::where('status_id', $inProgressStatus->id)
                    ->whereHas('project', function($query) use ($user) {
                        $query->where('owner_id', $user->id)
                              ->orWhereHas('members', function($memberQuery) use ($user) {
                                  $memberQuery->where('user_id', $user->id);
                              });
                    })->count() : 0,
            'sprints_count' => Sprint::whereHas('project', function($query) use ($user) {
                $query->where('owner_id', $user->id)
                      ->orWhereHas('members', function($memberQuery) use ($user) {
                          $memberQuery->where('user_id', $user->id);
                      });
            })->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'projects' => $projects,
        ]);
    }
}
