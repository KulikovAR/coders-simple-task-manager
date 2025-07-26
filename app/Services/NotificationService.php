<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Task;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    /**
     * Создать уведомление о назначении задачи
     */
    public function taskAssigned(Task $task, User $assignee, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $task->load(['project']);

        $this->createNotification(
            type: Notification::TYPE_TASK_ASSIGNED,
            userId: $assignee->id,
            fromUserId: $fromUser?->id ?? Auth::id(),
            notifiable: $task,
            data: [
                'task_title' => $task->title ?? 'Неизвестная задача',
                'project_name' => $task->project?->name ?? 'Неизвестный проект',
            ]
        );
    }

    /**
     * Создать уведомление о перемещении задачи
     */
    public function taskMoved(Task $task, string $oldStatus, string $newStatus, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $task->load(['assignee', 'reporter', 'project']);

        // Уведомляем исполнителя задачи
        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_MOVED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'status' => $newStatus,
                    'old_status' => $oldStatus,
                ]
            );
        }

        // Уведомляем создателя задачи, если он не исполнитель
        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_MOVED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'status' => $newStatus,
                    'old_status' => $oldStatus,
                ]
            );
        }
    }

    /**
     * Создать уведомление о создании задачи
     */
    public function taskCreated(Task $task, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $task->load(['project.users']);

        // Уведомляем всех участников проекта
        $projectMembers = $task->project->users ?? collect();
        
        foreach ($projectMembers as $member) {
            if ($member->id !== Auth::id()) {
                $this->createNotification(
                    type: Notification::TYPE_TASK_CREATED,
                    userId: $member->id,
                    fromUserId: $fromUser?->id ?? Auth::id(),
                    notifiable: $task,
                    data: [
                        'task_title' => $task->title ?? 'Неизвестная задача',
                        'project_name' => $task->project?->name ?? 'Неизвестный проект',
                    ]
                );
            }
        }
    }

    /**
     * Создать уведомление о добавлении комментария
     */
    public function commentAdded(TaskComment $comment, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $comment->load(['task.assignee', 'task.reporter']);
        
        $task = $comment->task;
        
        // Уведомляем исполнителя задачи
        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_COMMENT_ADDED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $comment,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'comment_preview' => substr($comment->content, 0, 50) . '...',
                ]
            );
        }

        // Уведомляем создателя задачи, если он не исполнитель
        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_COMMENT_ADDED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $comment,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'comment_preview' => substr($comment->content, 0, 50) . '...',
                ]
            );
        }
    }

    /**
     * Создать уведомление о начале спринта
     */
    public function sprintStarted(Sprint $sprint, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $sprint->load(['project.users']);
        
        $projectMembers = $sprint->project->users ?? collect();
        
        foreach ($projectMembers as $member) {
            if ($member->id !== Auth::id()) {
                $this->createNotification(
                    type: Notification::TYPE_SPRINT_STARTED,
                    userId: $member->id,
                    fromUserId: $fromUser?->id ?? Auth::id(),
                    notifiable: $sprint,
                    data: [
                        'sprint_name' => $sprint->name ?? 'Неизвестный спринт',
                        'project_name' => $sprint->project?->name ?? 'Неизвестный проект',
                    ]
                );
            }
        }
    }

    /**
     * Создать уведомление о завершении спринта
     */
    public function sprintEnded(Sprint $sprint, ?User $fromUser = null): void
    {
        // Загружаем связанные данные
        $sprint->load(['project.users']);
        
        $projectMembers = $sprint->project->users ?? collect();
        
        foreach ($projectMembers as $member) {
            if ($member->id !== Auth::id()) {
                $this->createNotification(
                    type: Notification::TYPE_SPRINT_ENDED,
                    userId: $member->id,
                    fromUserId: $fromUser?->id ?? Auth::id(),
                    notifiable: $sprint,
                    data: [
                        'sprint_name' => $sprint->name ?? 'Неизвестный спринт',
                        'project_name' => $sprint->project?->name ?? 'Неизвестный проект',
                    ]
                );
            }
        }
    }

    /**
     * Создать уведомление о приглашении в проект
     */
    public function projectInvited(Project $project, User $invitedUser, ?User $fromUser = null): void
    {
        $this->createNotification(
            type: Notification::TYPE_PROJECT_INVITED,
            userId: $invitedUser->id,
            fromUserId: $fromUser?->id ?? Auth::id(),
            notifiable: $project,
            data: [
                'project_name' => $project->name,
            ]
        );
    }

    /**
     * Создать уведомление о приближающемся дедлайне
     */
    public function deadlineApproaching(Task $task): void
    {
        if ($task->assignee_id) {
            $this->createNotification(
                type: Notification::TYPE_DEADLINE_APPROACHING,
                userId: $task->assignee_id,
                fromUserId: null,
                notifiable: $task,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'deadline' => $task->deadline,
                ]
            );
        }
    }

    /**
     * Создать уведомление о просроченном дедлайне
     */
    public function deadlineOverdue(Task $task): void
    {
        if ($task->assignee_id) {
            $this->createNotification(
                type: Notification::TYPE_DEADLINE_OVERDUE,
                userId: $task->assignee_id,
                fromUserId: null,
                notifiable: $task,
                data: [
                    'task_title' => $task->title ?? 'Неизвестная задача',
                    'deadline' => $task->deadline,
                ]
            );
        }
    }

    /**
     * Базовый метод создания уведомления
     */
    private function createNotification(
        string $type,
        int $userId,
        ?int $fromUserId,
        $notifiable,
        array $data = []
    ): void {
        // Проверяем, не создали ли мы уже такое уведомление недавно
        $recentNotification = Notification::where([
            'type' => $type,
            'user_id' => $userId,
            'notifiable_type' => get_class($notifiable),
            'notifiable_id' => $notifiable->id,
        ])
        ->where('created_at', '>', now()->subMinutes(5))
        ->first();

        if (!$recentNotification) {
            Notification::create([
                'type' => $type,
                'user_id' => $userId,
                'from_user_id' => $fromUserId,
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id,
                'data' => $data,
            ]);
        }
    }

    /**
     * Получить непрочитанные уведомления пользователя
     */
    public function getUnreadNotifications(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->with(['fromUser', 'notifiable'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Получить все уведомления пользователя
     */
    public function getAllNotifications(User $user, int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return Notification::where('user_id', $user->id)
            ->with(['fromUser', 'notifiable'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Пометить уведомление как прочитанное
     */
    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    /**
     * Пометить все уведомления пользователя как прочитанные
     */
    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Получить количество непрочитанных уведомлений
     */
    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->where('read', false)
            ->count();
    }
}
