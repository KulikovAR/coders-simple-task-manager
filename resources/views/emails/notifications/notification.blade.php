<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Новое уведомление в 379ТМ</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px 0;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: #667eea;
            color: white;
            padding: 25px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 500;
        }
        .logo {
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
        }
        .notification-text {
            font-size: 16px;
            color: #333;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .meta {
            font-size: 14px;
            color: #666;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .meta span {
            display: block;
            margin-bottom: 5px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 500;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .button-secondary {
            background: #6c757d;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            border-top: 1px solid #eee;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="24" rx="4" fill="white"/>
                    <text x="30" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#667eea">379ТМ</text>
                </svg>
            </div>
            <h1>Новое уведомление</h1>
        </div>
        
        <div class="content">
            <div class="notification-text">
                {{ $notificationText }}
            </div>
            
            <div class="meta">
                @if($notification->from_user)
                <span><strong>От:</strong> {{ $notification->from_user->name }}</span>
                @endif
                <span><strong>Дата:</strong> {{ $notification->created_at ? $notification->created_at->format('d.m.Y H:i') : now()->format('d.m.Y H:i') }}</span>
            </div>
            
            @if($actionUrl)
            <a href="{{ $actionUrl }}" class="button">
                Перейти к объекту
            </a>
            @endif
            
            <a href="{{ route('notifications.index') }}" class="button button-secondary">
                Все уведомления
            </a>
        </div>
        
        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p style="font-size: 12px; color: #999;">
                <a href="{{ route('profile.edit') }}">Отключить уведомления</a>
            </p>
        </div>
    </div>
</body>
</html> 