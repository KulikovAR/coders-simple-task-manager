<?php

namespace App\Services;

use App\Enums\CommentType;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class TaskCommentService
{
    public function getTaskComments(Task $task): Collection
    {
        return $task->comments()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createComment(array $data, Task $task, User $user): TaskComment
    {
        return TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => $data['content'],
            'type' => $data['type'] ?? CommentType::GENERAL,
        ]);
    }

    public function updateComment(TaskComment $comment, array $data): TaskComment
    {
        $comment->update([
            'content' => $data['content'],
            'type' => $data['type'] ?? $comment->type,
        ]);

        return $comment->load('user');
    }

    public function deleteComment(TaskComment $comment): bool
    {
        return $comment->delete();
    }

    public function canUserManageComment(User $user, TaskComment $comment): bool
    {
        // Автор комментария может управлять им
        if ($comment->user_id === $user->id) {
            return true;
        }

        // Владелец проекта может управлять любыми комментариями в своем проекте
        $projectService = app(ProjectService::class);
        return $projectService->canUserManageProject($user, $comment->task->project);
    }
} 