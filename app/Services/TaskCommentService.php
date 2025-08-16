<?php

namespace App\Services;

use App\Enums\CommentType;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use App\Services\HtmlContentService;
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
        // Обрабатываем HTML контент с изображениями
        $htmlContentService = app(HtmlContentService::class);
        $processedContent = $htmlContentService->processContent($data['content'], [
            'storage_path' => 'comments/' . $task->id,
            'disk' => 'public'
        ]);

        return TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => $processedContent['html'],
            'type' => $data['type'] ?? CommentType::GENERAL,
        ]);
    }

    public function updateComment(TaskComment $comment, array $data): TaskComment
    {
        // Безопасно обновляем HTML контент с изображениями
        $htmlContentService = app(HtmlContentService::class);
        $processedContent = $htmlContentService->updateContent(
            $data['content'],
            $comment->content,
            [
                'storage_path' => 'comments/' . $comment->task_id,
                'disk' => 'public'
            ]
        );

        // Удаляем неиспользуемые изображения
        $htmlContentService->cleanupUnusedImages(
            $comment->content,
            $processedContent['html'],
            ['disk' => 'public']
        );

        $comment->update([
            'content' => $processedContent['html'],
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