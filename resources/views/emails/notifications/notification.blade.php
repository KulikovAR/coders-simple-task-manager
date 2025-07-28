<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Новое уведомление</title>
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333; background-color: #f5f5f5;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
            <td style="background-color: #667eea; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 18px; font-weight: normal;">Новое уведомление</h1>
            </td>
        </tr>
        
        <!-- Content -->
        <tr>
            <td style="padding: 30px;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">
                    {{ $notificationText }}
                </p>
                
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    @if($notification->from_user)
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #666;">
                            <strong>От:</strong> {{ $notification->from_user->name }}
                        </td>
                    </tr>
                    @endif
                    <tr>
                        <td style="padding: 5px 0; font-size: 14px; color: #666;">
                            <strong>Дата:</strong> {{ $notification->created_at ? $notification->created_at->format('d.m.Y H:i') : now()->format('d.m.Y H:i') }}
                        </td>
                    </tr>
                </table>
                
                @if($actionUrl)
                <table cellpadding="0" cellspacing="0" style="margin-bottom: 15px;">
                    <tr>
                        <td style="background-color: #667eea; padding: 12px 20px; text-align: center;">
                            <a href="{{ $actionUrl }}" style="color: white; text-decoration: none; font-weight: bold;">Перейти к объекту</a>
                        </td>
                    </tr>
                </table>
                @endif
                
                <table cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="background-color: #6c757d; padding: 12px 20px; text-align: center;">
                            <a href="{{ route('notifications.index') }}" style="color: white; text-decoration: none; font-weight: bold;">Все уведомления</a>
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
                    <a href="{{ route('profile.edit') }}" style="color: #667eea; text-decoration: none;">Отключить уведомления</a>
                </p>
            </td>
        </tr>
    </table>
    
</body>
</html> 