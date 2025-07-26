import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function NotificationsIndex({ auth, notifications, unreadCount }) {
    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(route('notifications.mark-as-read', notificationId));
            
            setLocalNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true, read_at: new Date().toISOString() }
                        : notification
                )
            );
            
            setLocalUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Ошибка пометки уведомления:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(route('notifications.mark-all-as-read'));
            
            setLocalNotifications(prev => 
                prev.map(notification => ({ ...notification, read: true, read_at: new Date().toISOString() }))
            );
            
            setLocalUnreadCount(0);
        } catch (error) {
            console.error('Ошибка пометки всех уведомлений:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(route('notifications.destroy', notificationId));
            
            setLocalNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
            
            // Уменьшаем счетчик непрочитанных, если уведомление было непрочитанным
            const notification = localNotifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                setLocalUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Ошибка удаления уведомления:', error);
        }
    };

    const deleteReadNotifications = async () => {
        try {
            await axios.delete(route('notifications.destroy-read'));
            
            setLocalNotifications(prev => 
                prev.filter(notification => !notification.read)
            );
        } catch (error) {
            console.error('Ошибка удаления прочитанных уведомлений:', error);
        }
    };

    const getNotificationLink = (notification) => {
        if (notification.notifiable_type === 'App\\Models\\Task') {
            return route('tasks.show', notification.notifiable_id);
        } else if (notification.notifiable_type === 'App\\Models\\Project') {
            return route('projects.show', notification.notifiable_id);
        } else if (notification.notifiable_type === 'App\\Models\\Sprint') {
            return route('sprints.show', notification.notifiable_id);
        } else if (notification.notifiable_type === 'App\\Models\\TaskComment') {
            return route('tasks.show', notification.notifiable.task_id);
        }
        return null;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Уведомления" />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-text-primary">Уведомления</h1>
                    
                    <div className="flex items-center gap-3">
                        {localUnreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn btn-secondary text-sm"
                            >
                                Прочитать все
                            </button>
                        )}
                        
                        <button
                            onClick={deleteReadNotifications}
                            className="btn btn-danger text-sm"
                        >
                            Удалить прочитанные
                        </button>
                    </div>
                </div>

                {localNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {localNotifications.map((notification) => {
                            const link = getNotificationLink(notification);
                            
                            return (
                                <div
                                    key={notification.id}
                                    className={`card transition-all duration-200 ${
                                        !notification.read 
                                            ? 'border-accent-blue/30 bg-accent-blue/5' 
                                            : 'hover:bg-secondary-bg'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`text-2xl ${notification.getColor}`}>
                                            {notification.getIcon}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="text-text-primary font-medium mb-1">
                                                        {notification.getMessage}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-text-muted">
                                                        <span>
                                                            {new Date(notification.created_at).toLocaleString('ru-RU', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        
                                                        {notification.from_user && (
                                                            <span>
                                                                от {notification.from_user.name}
                                                            </span>
                                                        )}
                                                        
                                                        {!notification.read && (
                                                            <span className="text-accent-blue font-medium">
                                                                Новое
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    {link && (
                                                        <Link
                                                            href={link}
                                                            className="text-accent-blue hover:text-accent-green transition-colors text-sm"
                                                        >
                                                            Перейти
                                                        </Link>
                                                    )}
                                                    
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-accent-blue hover:text-accent-green transition-colors text-sm"
                                                        >
                                                            Прочитать
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-accent-red hover:text-red-600 transition-colors text-sm"
                                                    >
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-text-primary mb-2">
                            Нет уведомлений
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Здесь будут отображаться все ваши уведомления о действиях в проектах
                        </p>
                        <Link
                            href={route('dashboard')}
                            className="btn btn-primary"
                        >
                            Вернуться на главную
                        </Link>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
} 