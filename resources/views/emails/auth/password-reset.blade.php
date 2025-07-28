<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Восстановление пароля</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333; background-color: #f5f5f5;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
            <td style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px; font-weight: normal;">Восстановление пароля</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    Вы получили это письмо, потому что мы получили запрос на сброс пароля для вашей учетной записи.
                </p>
                
                <table cellpadding="0" cellspacing="0" style="margin: 20px 0; width: 100%;">
                    <tr>
                        <td style="background-color: #dc3545; padding: 14px 24px; text-align: center;">
                            <a href="{{ $url }}" style="color: white; text-decoration: none; font-weight: bold; font-size: 16px;">Сбросить пароль</a>
                        </td>
                    </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #f8f9fa; border: 1px solid #e9ecef;">
                    <tr>
                        <td style="padding: 15px; font-size: 14px; color: #666;">
                            <strong>Срок действия:</strong> {{ config('auth.passwords.users.expire') }} минут
                        </td>
                    </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #fff3cd; border: 1px solid #ffeaa7;">
                    <tr>
                        <td style="padding: 15px; font-size: 14px; color: #856404;">
                            <strong>Важно:</strong> Если вы не запрашивали сброс пароля, никаких действий не требуется.
                        </td>
                    </tr>
                </table>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #f8f9fa; border: 1px solid #e9ecef;">
                    <tr>
                        <td style="padding: 15px;">
                            <p style="margin: 0 0 10px 0; font-weight: bold; color: #495057;">
                                Если кнопка не работает, скопируйте ссылку:
                            </p>
                            <p style="margin: 0; color: #495057; font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all;">
                                {{ $url }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        
        <!-- Footer -->
        <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">{{ config('app.name') }}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">
                    Это письмо отправлено автоматически
                </p>
            </td>
        </tr>
    </table>
    
</body>
</html> 