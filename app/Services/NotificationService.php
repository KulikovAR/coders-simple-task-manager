<?php

namespace App\Services;

use App\Mail\NotificationMail;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Создать уведомление о назначении задачи
     */
    public function taskAssigned(Task $task, User $assignee, ?User $fromUser = null): void
    {
        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            return;
        }

        $task->load(['project']);

        $this->createNotification(
            type: Notification::TYPE_TASK_ASSIGNED,
            userId: $assignee->id,
            fromUserId: $fromUser?->id ?? Auth::id(),
            notifiable: $task,
            data: [
                'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                'project_name' => $this->sanitizeUtf8($task->project?->name ?? 'Неизвестный проект'),
            ]
        );
    }

    /**
     * Создать уведомление об изменении задачи
     */
    public function taskUpdated(Task $task, ?User $fromUser = null): void
    {
        $task->load(['assignee', 'reporter', 'project']);

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_UPDATED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'project_name' => $this->sanitizeUtf8($task->project?->name ?? 'Неизвестный проект'),
                ]
            );
        }

        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_UPDATED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'project_name' => $this->sanitizeUtf8($task->project?->name ?? 'Неизвестный проект'),
                ]
            );
        }
    }

    /**
     * Создать уведомление о перемещении задачи
     */
    public function taskMoved(Task $task, string $oldStatus, string $newStatus, ?User $fromUser = null): void
    {
        $task->load(['assignee', 'reporter', 'project']);

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_MOVED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'status' => $this->sanitizeUtf8($newStatus),
                    'old_status' => $this->sanitizeUtf8($oldStatus),
                ]
            );
        }

        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_MOVED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'status' => $this->sanitizeUtf8($newStatus),
                    'old_status' => $this->sanitizeUtf8($oldStatus),
                ]
            );
        }
    }

    /**
     * Создать уведомление о создании задачи
     */
    public function taskCreated(Task $task, ?User $fromUser = null): void
    {
        $task->load(['project.users']);

        $projectMembers = $task->project->users ?? collect();

        foreach ($projectMembers as $member) {
            if ($member->id !== Auth::id() && $member->id === $task->assignee_id) {
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
     * Создать уведомление об изменении приоритета задачи
     */
    public function taskPriorityChanged(Task $task, string $oldPriority, string $newPriority, ?User $fromUser = null): void
    {
        $task->load(['assignee', 'reporter', 'project']);

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_PRIORITY_CHANGED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'priority' => $this->sanitizeUtf8($newPriority),
                    'old_priority' => $this->sanitizeUtf8($oldPriority),
                ]
            );
        }

        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_TASK_PRIORITY_CHANGED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $task,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'priority' => $this->sanitizeUtf8($newPriority),
                    'old_priority' => $this->sanitizeUtf8($oldPriority),
                ]
            );
        }
    }

    /**
     * Создать уведомление о добавлении комментария
     */
    public function commentAdded(TaskComment $comment, ?User $fromUser = null): void
    {
        $comment->load(['task.assignee', 'task.reporter']);

        $task = $comment->task;

        if ($task->assignee_id && $task->assignee_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_COMMENT_ADDED,
                userId: $task->assignee_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $comment,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'task_id' => $task->id,
                    'comment_preview' => $this->createCommentPreview($comment->content),
                ]
            );
        }

        if ($task->reporter_id && $task->reporter_id !== $task->assignee_id && $task->reporter_id !== Auth::id()) {
            $this->createNotification(
                type: Notification::TYPE_COMMENT_ADDED,
                userId: $task->reporter_id,
                fromUserId: $fromUser?->id ?? Auth::id(),
                notifiable: $comment,
                data: [
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
                    'task_id' => $task->id,
                    'comment_preview' => $this->createCommentPreview($comment->content),
                ]
            );
        }
    }

    /**
     * Создать уведомление об упоминании пользователя в комментарии
     */
    public function userMentioned(TaskComment $comment, User $mentionedUser, ?User $fromUser = null): void
    {
        $comment->load(['task.project']);

        $this->createNotification(
            type: Notification::TYPE_USER_MENTIONED,
            userId: $mentionedUser->id,
            fromUserId: $fromUser?->id ?? Auth::id(),
            notifiable: $comment,
            data: [
                'task_title' => $this->sanitizeUtf8($comment->task?->title ?? 'Неизвестная задача'),
                'task_id' => $comment->task->id,
                'project_name' => $this->sanitizeUtf8($comment->task?->project?->name ?? 'Неизвестный проект'),
                'comment_preview' => $this->createCommentPreview($comment->content),
                'mentioned_user_name' => $this->sanitizeUtf8($mentionedUser->name),
            ]
        );
    }

    /**
     * Создать уведомление о начале спринта
     */
    public function sprintStarted(Sprint $sprint, ?User $fromUser = null): void
    {
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
                        'sprint_name' => $this->sanitizeUtf8($sprint->name ?? 'Неизвестный спринт'),
                        'project_name' => $this->sanitizeUtf8($sprint->project?->name ?? 'Неизвестный проект'),
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
                        'sprint_name' => $this->sanitizeUtf8($sprint->name ?? 'Неизвестный спринт'),
                        'project_name' => $this->sanitizeUtf8($sprint->project?->name ?? 'Неизвестный проект'),
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
                'project_name' => $this->sanitizeUtf8($project->name),
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
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
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
                    'task_title' => $this->sanitizeUtf8($task->title ?? 'Неизвестная задача'),
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
        int    $userId,
        ?int   $fromUserId,
               $notifiable,
        array  $data = []
    ): void
    {
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
            $notification = Notification::create([
                'type' => $type,
                'user_id' => $userId,
                'from_user_id' => $fromUserId,
                'notifiable_type' => get_class($notifiable),
                'notifiable_id' => $notifiable->id,
                'data' => $this->sanitizeNotificationData($data),
            ]);

            $this->sendEmailNotification($notification);
            $this->sendTelegramNotification($notification);
        }
    }

    /**
     * Отправить email уведомление
     */
    private function sendEmailNotification(Notification $notification): void
    {
        try {
            $user = $notification->user;

            if (!$user->email_notifications) {
                return;
            }

            $notificationText = $notification->getMessage();

            $actionUrl = $this->getNotificationActionUrl($notification);

            Mail::to($user->email)->send(new NotificationMail($notification, $notificationText, $actionUrl));

        } catch (\Exception $e) {
            Log::error('Ошибка отправки email уведомления', [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Получить URL действия для уведомления
     */
    private function getNotificationActionUrl(Notification $notification): ?string
    {
        try {
            $notifiable = $notification->notifiable;

            if (!$notifiable) {
                return null;
            }

            switch ($notification->notifiable_type) {
                case 'App\\Models\\Task':
                    return route('tasks.show', $notifiable->id);

                case 'App\\Models\\Project':
                    return route('projects.show', $notifiable->id);

                case 'App\\Models\\Sprint':
                    return route('sprints.show', $notifiable->id);

                case 'App\\Models\\TaskComment':
                    return route('tasks.show', $notifiable->task_id);

                default:
                    return null;
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Отправить Telegram уведомление
     */
    private function sendTelegramNotification(Notification $notification): void
    {
        try {
            /** @var TelegramService $tg */
            $tg = app(TelegramService::class);
            if (!$tg->isEnabled()) {
                return;
            }

            $user = $notification->user;
            if (!$user || empty($user->telegram_chat_id)) {
                return;
            }

            $message = $notification->getIcon() . ' ' . $notification->getMessage();
            $actionUrl = $this->getNotificationActionUrl($notification);
            if ($actionUrl) {
                $message .= "\n\n" . '<a href="' . e($actionUrl) . '">Открыть</a>';
            }

            $tg->sendMessage($user->telegram_chat_id, $message);
        } catch (\Throwable $e) {
            Log::error('Ошибка отправки Telegram уведомления', [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
                'error' => $e->getMessage(),
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

    /**
     * Создать безопасное превью комментария
     */
    private function createCommentPreview(string $content, int $length = 50): string
    {
        $cleanContent = $this->sanitizeUtf8($content);

        if (mb_strlen($cleanContent, 'UTF-8') <= $length) {
            return $cleanContent;
        }

        return mb_substr($cleanContent, 0, $length, 'UTF-8') . '...';
    }

    /**
     * Очистить и валидировать UTF-8 строку
     */
    private function sanitizeUtf8(?string $string): string
    {
        if ($string === null) {
            return '';
        }

        if (mb_check_encoding($string, 'UTF-8')) {
            return $string;
        }

        $clean = mb_convert_encoding($string, 'UTF-8', 'UTF-8');

        if (!mb_check_encoding($clean, 'UTF-8')) {
            $clean = mb_convert_encoding($clean, 'UTF-8', 'auto');
        }

        return $clean ?: '';
    }

    /**
     * Очистить массив данных уведомления от некорректных UTF-8 символов
     */
    private function sanitizeNotificationData(array $data): array
    {
        $sanitized = [];

        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $sanitized[$key] = $this->sanitizeUtf8($value);
            } elseif (is_array($value)) {
                $sanitized[$key] = $this->sanitizeNotificationData($value);
            } else {
                $sanitized[$key] = $value;
            }
        }

        return $sanitized;
    }
}
