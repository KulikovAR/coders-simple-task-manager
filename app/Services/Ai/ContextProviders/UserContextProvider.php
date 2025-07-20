<?php

namespace App\Services\Ai\ContextProviders;

use App\Services\Ai\Contracts\ContextProviderInterface;
use App\Models\User;

class UserContextProvider implements ContextProviderInterface
{
    public function getName(): string
    {
        return 'user';
    }

    public function getContext($user): array
    {
        if (!$user instanceof User) {
            return [];
        }

        return [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_email' => $user->email,
            'current_time' => now()->toISOString(),
            'timezone' => config('app.timezone'),
            'is_current_user' => true,
            'can_assign_tasks' => true,
            'can_manage_projects' => true,
        ];
    }
} 