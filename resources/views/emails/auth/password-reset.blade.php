<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Восстановление пароля в 379ТМ</title>
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
            background: #dc3545;
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
        .message {
            font-size: 16px;
            color: #333;
            margin-bottom: 25px;
            line-height: 1.5;
        }
        .button {
            display: inline-block;
            background: #dc3545;
            color: white;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 16px;
            margin: 20px 0;
        }
        .info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        .url-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            word-break: break-all;
        }
        .url-text {
            color: #495057;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin: 0;
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
                    <text x="30" y="16" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="#dc3545">379ТМ</text>
                </svg>
            </div>
            <h1>Восстановление пароля</h1>
        </div>
        
        <div class="content">
            <div class="message">
                Вы получили это письмо, потому что мы получили запрос на сброс пароля для вашей учетной записи.
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $url }}" class="button">
                    Сбросить пароль
                </a>
            </div>
            
            <div class="info">
                <strong>Срок действия:</strong> {{ config('auth.passwords.users.expire') }} минут
            </div>
            
            <div class="warning">
                <strong>Важно:</strong> Если вы не запрашивали сброс пароля, никаких действий не требуется.
            </div>
            
            <div class="url-box">
                <p style="margin: 0 0 10px 0; font-weight: 500; color: #495057;">
                    Если кнопка не работает, скопируйте ссылку:
                </p>
                <p class="url-text">{{ $url }}</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p style="font-size: 12px; color: #999;">
                Это письмо отправлено автоматически
            </p>
        </div>
    </div>
</body>
</html> 