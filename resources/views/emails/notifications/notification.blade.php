<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Новое уведомление в 379ТМ</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .logo {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px;
        }
        .notification-card {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .notification-text {
            font-size: 16px;
            color: #333;
            margin-bottom: 15px;
        }
        .meta-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 25px;
        }
        .from-user {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .user-avatar {
            width: 24px;
            height: 24px;
            background: #667eea;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 600;
        }
        .date {
            color: #999;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin: 10px 10px 10px 0;
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .button-secondary {
            background: #6c757d;
        }
        .button-secondary:hover {
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
        }
        .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
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
        .footer a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .meta-info {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="32" rx="6" fill="white"/>
                    <text x="40" y="21" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#667eea">379ТМ</text>
                </svg>
            </div>
            <h1>Новое уведомление в 379ТМ</h1>
        </div>
        
        <div class="content">
            <div class="notification-card">
                <div class="notification-text">
                    {{ $notificationText }}
                </div>
                
                <div class="meta-info">
                    @if($notification->from_user)
                    <div class="from-user">
                        <div class="user-avatar">
                            {{ strtoupper(substr($notification->from_user->name, 0, 1)) }}
                        </div>
                        <span><strong>От:</strong> {{ $notification->from_user->name }}</span>
                    </div>
                    @endif
                    
                    <div class="date">
                        <strong>Дата:</strong> {{ $notification->created_at ? $notification->created_at->format('d.m.Y H:i') : now()->format('d.m.Y H:i') }}
                    </div>
                </div>
            </div>
            
            @if($actionUrl)
            <a href="{{ $actionUrl }}" class="button">
                Перейти к объекту
            </a>
            @endif
            
            <a href="{{ route('notifications.index') }}" class="button button-secondary">
                Посмотреть все уведомления
            </a>
        </div>
        
        <div class="footer">
            <p><strong>С уважением,</strong></p>
            <p>{{ config('app.name') }}</p>
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
                Если вы не хотите получать email уведомления, вы можете 
                <a href="{{ route('profile.edit') }}">отключить их в настройках профиля</a>.
            </p>
        </div>
    </div>
</body>
</html> 