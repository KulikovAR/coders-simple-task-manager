<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'projects_count' => Project::count(),
            'tasks_count' => Task::count(),
            'comments_count' => TaskComment::count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
        ]);
    }
} 