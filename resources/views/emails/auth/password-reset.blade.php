<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Восстановление пароля в 379ТМ</title>
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
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
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
        .message-box {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .message-box h2 {
            color: #856404;
            margin: 0 0 15px 0;
            font-size: 18px;
        }
        .message-text {
            color: #856404;
            margin-bottom: 0;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }
        .warning-box {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .warning-box h3 {
            color: #721c24;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        .warning-text {
            color: #721c24;
            margin: 0;
        }
        .expiry-info {
            background: #e2e3e5;
            border: 1px solid #d6d8db;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .expiry-text {
            color: #495057;
            margin: 0;
            font-weight: 500;
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
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content, .footer {
                padding: 20px;
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
                    <text x="40" y="21" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#dc3545">379ТМ</text>
                </svg>
            </div>
            <h1>Восстановление пароля в 379ТМ</h1>
        </div>
        
        <div class="content">
            <div class="message-box">
                <h2>Запрос на сброс пароля</h2>
                <p class="message-text">
                    Вы получили это письмо, потому что мы получили запрос на сброс пароля для вашей учетной записи.
                </p>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $url }}" class="button">
                    Сбросить пароль
                </a>
            </div>
            
            <div class="expiry-info">
                <p class="expiry-text">
                    ⏰ Срок действия ссылки для сброса пароля истекает через {{ config('auth.passwords.users.expire') }} минут.
                </p>
            </div>
            
            <div class="warning-box">
                <h3>⚠️ Важно</h3>
                <p class="warning-text">
                    Если вы не запрашивали сброс пароля, никаких действий не требуется. 
                    Ваш пароль останется без изменений.
                </p>
            </div>
            
            <div class="url-box">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #495057;">
                    Если у вас возникли проблемы с нажатием кнопки, скопируйте и вставьте URL ниже в ваш веб-браузер:
                </p>
                <p class="url-text">{{ $url }}</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>С уважением,</strong></p>
            <p>{{ config('app.name') }}</p>
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
                Это письмо отправлено автоматически. Пожалуйста, не отвечайте на него.
            </p>
        </div>
    </div>
</body>
</html> 