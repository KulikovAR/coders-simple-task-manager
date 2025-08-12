<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    )
    {
    }

    /**
     * Показать страницу уведомлений
     */
    public function index()
    {
        $user = Auth::user();
        $notifications = $this->notificationService->getAllNotifications($user, 50);
        $unreadCount = $this->notificationService->getUnreadCount($user);

        return Inertia::render('Notifications/Index', compact('notifications', 'unreadCount'));
    }

    /**
     * Получить непрочитанные уведомления (для API)
     */
    public function getUnread()
    {
        $user = Auth::user();
        $notifications = $this->notificationService->getUnreadNotifications($user, 10);
        $unreadCount = $this->notificationService->getUnreadCount($user);

        return response()->json(compact('notifications', 'unreadCount'));
    }

    /**
     * Пометить уведомление как прочитанное
     */
    public function markAsRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $this->notificationService->markAsRead($notification);

        return response()->json([
            'success' => true,
            'unreadCount' => $this->notificationService->getUnreadCount(Auth::user()),
        ]);
    }

    /**
     * Пометить все уведомления как прочитанные
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        $this->notificationService->markAllAsRead($user);

        return response()->json([
            'success' => true,
            'unreadCount' => 0,
        ]);
    }

    /**
     * Удалить уведомление
     */
    public function destroy(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403);
        }

        $notification->delete();

        return response()->json([
            'success' => true,
            'unreadCount' => $this->notificationService->getUnreadCount(Auth::user()),
        ]);
    }

    /**
     * Удалить все прочитанные уведомления
     */
    public function destroyRead()
    {
        $user = Auth::user();

        Notification::where('user_id', $user->id)
            ->where('read', true)
            ->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}
