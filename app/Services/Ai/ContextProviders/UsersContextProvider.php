<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;
use App\Models\Project;

class UsersContextProvider implements ContextProviderInterface
{
    public function getName(): string
    {
        return 'users';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        $userProjectIds = Project::where('owner_id', $user->id)
            ->orWhereHas('members', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->pluck('id');

        $accessibleUsers = User::whereHas('projectMemberships', function($query) use ($userProjectIds) {
            $query->whereIn('project_id', $userProjectIds);
        })
        ->orWhereHas('ownedProjects', function($query) use ($userProjectIds) {
            $query->whereIn('id', $userProjectIds);
        })
        ->orWhere('id', $user->id)
        ->distinct()
        ->get();

        return [
            'available_users' => $accessibleUsers->map(function ($accessibleUser) use ($user) {
                return [
                    'id' => $accessibleUser->id,
                    'name' => $accessibleUser->name,
                    'email' => $accessibleUser->email,
                    'is_current_user' => $accessibleUser->id === $user->id,
                    'is_me' => $accessibleUser->id === $user->id,
                ];
            })->toArray(),
            'current_user_id' => $user->id,
            'current_user_name' => $user->name,
        ];
    }
}
