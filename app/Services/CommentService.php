<?php

namespace App\Services;

use App\Enums\CommentType;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CommentService
{
    public function getTaskComments(Task $task): Collection
    {
        return $task->comments()
            ->with(['user'])
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
            'content' => $data['content'] ?? $comment->content,
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
        // Только автор комментария может управлять своим комментарием
        return $comment->user_id === $user->id;
    }

    public function canUserViewComment(User $user, TaskComment $comment): bool
    {
        // Пользователь может видеть комментарий, если имеет доступ к задаче
        $projectService = new ProjectService();
        return $projectService->canUserAccessProject($user, $comment->task->project);
    }

    public function getSpecialComments(Task $task): Collection
    {
        return $task->comments()
            ->where('type', CommentType::TESTING_FEEDBACK)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getCommentsByType(Task $task, CommentType $type): Collection
    {
        return $task->comments()
            ->where('type', $type)
            ->with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
} 