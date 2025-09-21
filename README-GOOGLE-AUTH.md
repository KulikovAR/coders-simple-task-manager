# Настройка авторизации через Google

Для работы авторизации через Google в Docker-окружении необходимо выполнить следующие шаги:

## 1. Создание проекта в Google Cloud Platform

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. В меню слева выберите "APIs & Services" > "Credentials"
4. Нажмите "Create Credentials" > "OAuth client ID"
5. Выберите тип приложения "Web application"
6. Укажите название для OAuth клиента
7. В разделе "Authorized redirect URIs" добавьте: `http://localhost:8000/auth/google/callback`
8. Нажмите "Create"
9. Скопируйте полученные Client ID и Client Secret

## 2. Настройка переменных окружения

Добавьте следующие переменные в файл `.env`:

```
# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id
GOOGLE_CLIENT_SECRET=ваш_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

## 3. Запуск миграций

Выполните миграцию для добавления поля `google_id` в таблицу пользователей:

```
docker-compose exec app php artisan migrate
```

## 4. Перезапуск контейнеров

Для применения всех изменений рекомендуется перезапустить Docker-контейнеры:

```
docker-compose down
docker-compose up -d
```

## Проверка работоспособности

После выполнения всех шагов вы сможете авторизоваться через Google, нажав на соответствующую кнопку на странице входа или регистрации.

## Примечания

- Для работы в production-окружении необходимо обновить redirect URI на домен вашего сайта
- В случае изменения домена не забудьте обновить настройки в Google Cloud Console
