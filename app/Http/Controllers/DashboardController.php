<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskStatus;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    )
    {
    }

    public function index()
    {
        $user = Auth::user();

        $projects = Project::where(function ($q) use ($user) {
            $q->where('owner_id', $user->id)
                ->orWhereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
        })
            ->where('status', 'active')
            ->withCount('tasks')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get();

        $inProgressStatuses = TaskStatus::where('name', 'В работе')->get()->pluck('id');

        $userProjects = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            });

        $stats = [
            'projects_count' => $userProjects->count(),
            'tasks_in_progress' => $inProgressStatuses ?
                Task::whereIn('status_id', $inProgressStatuses)
                    ->whereHas('project', function ($query) use ($user) {
                        $query->where('owner_id', $user->id)
                            ->orWhereHas('members', function ($memberQuery) use ($user) {
                                $memberQuery->where('user_id', $user->id);
                            });
                    })->count() : 0,
            'sprints_count' => Sprint::whereHas('project', function ($query) use ($user) {
                $query->where('owner_id', $user->id)
                    ->orWhereHas('members', function ($memberQuery) use ($user) {
                        $memberQuery->where('user_id', $user->id);
                    });
            })->count(),
        ];

        $botUsername = config('telegram.bot_username');

        $telegram = [
            'bot_username' => $botUsername,
            'bot_link' => $botUsername ? ('https://t.me/' . ltrim($botUsername, '@')) : null,
            'user_connected' => !empty($user->telegram_chat_id),
        ];

        $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
        $canCreateProject = $this->subscriptionService->canCreateProject($user);

        return Inertia::render('Dashboard', compact('stats', 'projects', 'telegram', 'subscriptionInfo', 'canCreateProject'));
    }
}
