import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { 
    getNotificationText, 
    getNotificationIcon, 
    getNotificationColor, 
    getNotificationLink,
    formatNotificationDate 
} from '@/utils/notificationUtils';

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    useEffect(() => {
        fetchUnreadNotifications();
        
        // Обновляем каждые 30 секунд
        const interval = setInterval(fetchUnreadNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (showDropdown && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            setPosition({
                top: rect.bottom + scrollTop + 8,
                left: rect.right + scrollLeft - 320 // 320px = w-80
            });
        }
    }, [showDropdown]);

    const fetchUnreadNotifications = async () => {
        try {
            const response = await axios.get(route('notifications.unread'));
            setUnreadCount(response.data.unreadCount);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(route('notifications.mark-as-read', notificationId));
            fetchUnreadNotifications();
        } catch (error) {
            console.error('Ошибка пометки уведомления:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Сначала помечаем как прочитанное
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        
        // Затем переходим по ссылке, если она есть
        const link = getNotificationLink(notification);
        if (link) {
            window.location.href = link;
        }
        
        // Закрываем дропдаун
        setShowDropdown(false);
    };

    const markAllAsRead = async () => {
        try {
            await axios.post(route('notifications.mark-all-as-read'));
            setUnreadCount(0);
            setNotifications([]);
        } catch (error) {
            console.error('Ошибка пометки всех уведомлений:', error);
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-bg border border-border-color hover:bg-accent-blue/10 hover:border-accent-blue/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:ring-offset-2 focus:ring-offset-card-bg shadow-sm hover:shadow-md"
                title="Уведомления"
            >
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 20.6302C9.79613 21.2332 10.8475 21.5999 12 21.5999C13.1525 21.5999 14.2039 21.2332 15 20.6302M3.57109 17.5271C3.09677 17.5271 2.83186 16.8206 3.11877 16.4281C3.78453 15.5173 4.42712 14.1814 4.42712 12.5727L4.45458 10.2417C4.45458 5.91078 7.83278 2.3999 12 2.3999C16.2286 2.3999 19.6566 5.9625 19.6566 10.3572L19.6291 12.5727C19.6291 14.1924 20.2495 15.5356 20.8882 16.4468C21.164 16.8403 20.8984 17.5271 20.43 17.5271H3.57109Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium [&]:text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && createPortal(
                <>
                    <div 
                        className="fixed w-80 bg-card-bg border border-border-color rounded-lg shadow-lg"
                        style={{
                            top: position.top,
                            left: position.left,
                            zIndex: 9999
                        }}
                    >
                        <div className="p-4 border-b border-border-color">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-text-primary">Уведомления</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-sm text-accent-blue hover:text-accent-green transition-colors"
                                    >
                                        Прочитать все
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border-color">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-secondary-bg transition-colors cursor-pointer ${
                                                !notification.read ? 'bg-accent-blue/5' : ''
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`text-lg ${getNotificationColor(notification.type)}`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-text-primary font-medium">
                                                        {getNotificationText(notification)}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <p className="text-xs text-text-muted">
                                                            {formatNotificationDate(notification.created_at)}
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            {notification.from_user && (
                                                                <p className="text-xs text-text-secondary">
                                                                    от {notification.from_user.name}
                                                                </p>
                                                            )}
                                                            {getNotificationLink(notification) && (
                                                                <span className="text-xs text-accent-blue">
                                                                    Перейти →
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-accent-blue rounded-full flex-shrink-0 mt-1"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="text-4xl mb-2">🔔</div>
                                    <p className="text-text-secondary">Нет новых уведомлений</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-border-color">
                            <Link
                                href={route('notifications.index')}
                                className="block w-full text-center text-sm text-accent-blue hover:text-accent-green transition-colors"
                                onClick={() => setShowDropdown(false)}
                            >
                                Посмотреть все уведомления
                            </Link>
                        </div>
                    </div>

                    {/* Overlay для закрытия dropdown */}
                    <div
                        className="fixed inset-0"
                        style={{ zIndex: 9998 }}
                        onClick={() => setShowDropdown(false)}
                    />
                </>,
                document.body
            )}
        </div>
    );
} 