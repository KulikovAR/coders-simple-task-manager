<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;
use App\Models\Project;
use App\Models\Sprint;
use Illuminate\Support\Facades\Cache;

class SprintContextProvider implements ContextProviderInterface
{
    public function getName(): string
    {
        return 'sprints';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        // Кэшируем спринты на 5 минут
        $cacheKey = "sprint_context_user_{$user->id}";

        return Cache::remember($cacheKey, 300, function () use ($user) {
            $context = [
                'user_sprints' => [],
                'active_sprints' => [],
                'sprint_names' => [],
            ];

            // Получаем все проекты пользователя
            $projectIds = Project::where('owner_id', $user->id)
                ->orWhereHas('members', function($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->pluck('id');

            if ($projectIds->isEmpty()) {
                return $context;
            }

            // Получаем спринты проектов
            $sprints = Sprint::whereIn('project_id', $projectIds)
                ->with(['project:id,name'])
                ->orderBy('start_date', 'desc')
                ->get();

            $context['user_sprints'] = $sprints->map(function ($sprint) {
                return [
                    'id' => $sprint->id,
                    'name' => $sprint->name,
                    'project_id' => $sprint->project_id,
                    'project_name' => $sprint->project->name,
                    'start_date' => $sprint->start_date,
                    'end_date' => $sprint->end_date,
                    'status' => $sprint->status,
                    'description' => $sprint->description,
                ];
            })->toArray();

            // Активные спринты (текущие)
            $now = now();
            $context['active_sprints'] = $sprints->filter(function ($sprint) use ($now) {
                return $sprint->status === 'active' && 
                       $now->between($sprint->start_date, $sprint->end_date);
            })->map(function ($sprint) {
                return [
                    'id' => $sprint->id,
                    'name' => $sprint->name,
                    'project_name' => $sprint->project->name,
                    'days_remaining' => now()->diffInDays($sprint->end_date, false),
                ];
            })->values()->toArray();

            $context['sprint_names'] = $sprints->pluck('name')->toArray();

            return $context;
        });
    }
}
