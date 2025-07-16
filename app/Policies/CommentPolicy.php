<?php

namespace App\Policies;

use App\Models\TaskComment;
use App\Models\User;

class CommentPolicy
{
    public function update(User $user, TaskComment $comment): bool
    {
        return $user->id === $comment->user_id;
    }

    public function delete(User $user, TaskComment $comment): bool
    {
        return $user->id === $comment->user_id;
    }
} 