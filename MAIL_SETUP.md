# Настройка почтовой системы для 379ТМ

## Что реализовано

### 1. Email уведомления
- ✅ Автоматическая отправка уведомлений на почту
- ✅ Красивые шаблоны писем с кнопками действий
- ✅ Возможность отключения email уведомлений в профиле
- ✅ Обработка ошибок отправки

### 2. Восстановление пароля
- ✅ Форма запроса восстановления пароля
- ✅ Отправка ссылки для сброса пароля
- ✅ Форма сброса пароля
- ✅ Безопасные токены с истечением срока действия

### 3. Тестирование
- ✅ Команда для тестирования отправки писем
- ✅ Тестирование уведомлений и восстановления пароля

## Команды для тестирования

### Тестирование уведомлений
```bash
# Через Docker
docker-compose exec app php artisan mail:test your-email@example.com --type=notification

# Локально
php artisan mail:test your-email@example.com --type=notification
```

### Тестирование восстановления пароля
```bash
# Через Docker
docker-compose exec app php artisan mail:test your-email@example.com --type=password-reset

# Локально
php artisan mail:test your-email@example.com --type=password-reset
```

## Настройка на сервере

### 1. Настройка .env файла

#### Для Gmail SMTP:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="379ТМ"
```

#### Для Yandex SMTP:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.yandex.ru
MAIL_PORT=587
MAIL_USERNAME=your-email@yandex.ru
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@yandex.ru
MAIL_FROM_NAME="379ТМ"
```

#### Для Mailgun:
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="379ТМ"
```

#### Для SendGrid:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="379ТМ"
```

### 2. Настройка Gmail (рекомендуется для начала)

1. Включите двухфакторную аутентификацию в Google аккаунте
2. Создайте пароль приложения:
   - Перейдите в настройки безопасности Google
   - Найдите "Пароли приложений"
   - Создайте новый пароль для "Почта"
   - Используйте этот пароль в MAIL_PASSWORD

### 3. Настройка Yandex

1. Включите SMTP в настройках почты Yandex
2. Создайте пароль приложения:
   - Перейдите в настройки безопасности
   - Включите "Пароли для внешних приложений"
   - Создайте новый пароль
   - Используйте этот пароль в MAIL_PASSWORD

### 4. Проверка настроек

После настройки .env файла протестируйте отправку:

```bash
# Тест уведомления
docker-compose exec app php artisan mail:test your-email@example.com --type=notification

# Тест восстановления пароля
docker-compose exec app php artisan mail:test your-email@example.com --type=password-reset
```

### 5. Настройка очередей (рекомендуется для продакшена)

Для асинхронной отправки писем настройте очереди:

```env
QUEUE_CONNECTION=database
```

Создайте таблицу очередей:
```bash
docker-compose exec app php artisan queue:table
docker-compose exec app php artisan migrate
```

Запустите обработчик очередей:
```bash
docker-compose exec app php artisan queue:work
```

## Структура файлов

### Mailable классы
- `app/Mail/NotificationMail.php` - Email уведомления
- `app/Mail/PasswordResetMail.php` - Восстановление пароля

### Шаблоны писем
- `resources/views/emails/notifications/notification.blade.php` - Шаблон уведомления
- `resources/views/emails/auth/password-reset.blade.php` - Шаблон восстановления пароля

### Контроллеры
- `app/Http/Controllers/Auth/PasswordResetController.php` - Восстановление пароля

### Страницы
- `resources/js/Pages/Auth/ForgotPassword.jsx` - Форма запроса восстановления
- `resources/js/Pages/Auth/ResetPassword.jsx` - Форма сброса пароля

### Команды
- `app/Console/Commands/TestMailCommand.php` - Тестирование почты

## Маршруты

### Восстановление пароля
- `GET /forgot-password` - Форма запроса восстановления
- `POST /forgot-password` - Отправка ссылки
- `GET /reset-password/{token}` - Форма сброса пароля
- `POST /reset-password` - Сброс пароля

## Безопасность

- Токены восстановления пароля имеют ограниченный срок действия
- Используются безопасные пароли приложений для SMTP
- Все письма отправляются через защищенные соединения
- Обработка ошибок без раскрытия чувствительной информации

## Мониторинг

Проверяйте логи для диагностики проблем:
```bash
docker-compose exec app tail -f storage/logs/laravel.log
```

## Troubleshooting

### Письма не отправляются
1. Проверьте настройки .env файла
2. Убедитесь, что SMTP сервер доступен
3. Проверьте логи Laravel
4. Протестируйте с помощью команды `mail:test`

### Ошибки аутентификации
1. Проверьте правильность логина и пароля
2. Убедитесь, что включена двухфакторная аутентификация
3. Используйте пароли приложений, а не основной пароль

### Письма попадают в спам
1. Настройте SPF, DKIM и DMARC записи для домена
2. Используйте надежный SMTP провайдер
3. Добавьте обратный адрес в настройки 