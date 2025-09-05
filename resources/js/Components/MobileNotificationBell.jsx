import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function MobileNotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadNotifications();
        
        // Обновляем каждые 30 секунд
        const interval = setInterval(fetchUnreadNotifications, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadNotifications = async () => {
        try {
            const response = await axios.get(route('notifications.unread'));
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    };

    return (
        <Link
            href={route('notifications.index')}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary-bg border border-border-color hover:bg-accent-blue/10 hover:border-accent-blue/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:ring-offset-2 focus:ring-offset-card-bg shadow-sm hover:shadow-md"
            title="Уведомления"
        >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 20.6302C9.79613 21.2332 10.8475 21.5999 12 21.5999C13.1525 21.5999 14.2039 21.2332 15 20.6302M3.57109 17.5271C3.09677 17.5271 2.83186 16.8206 3.11877 16.4281C3.78453 15.5173 4.42712 14.1814 4.42712 12.5727L4.45458 10.2417C4.45458 5.91078 7.83278 2.3999 12 2.3999C16.2286 2.3999 19.6566 5.9625 19.6566 10.3572L19.6291 12.5727C19.6291 14.1924 20.2495 15.5356 20.8882 16.4468C21.164 16.8403 20.8984 17.5271 20.43 17.5271H3.57109Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );
}
