# CSTM API Documentation

## Обзор

CSTM (Coders Simple Task Manager) предоставляет RESTful API для управления задачами.

## Базовый URL

```
http://localhost:8000/api
```

## Аутентификация

API использует Laravel Sanctum для аутентификации. Все защищенные эндпоинты требуют токен аутентификации.

### Получение токена

```bash
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

### Использование токена

Добавьте заголовок в запросы:
```
Authorization: Bearer {your-token}
```

## Стандартный формат ответа

Все API ответы имеют единый формат:

### Успешный ответ
```json
{
    "success": true,
    "data": {...},
    "message": "Success message",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

### Ошибка
```json
{
    "success": false,
    "message": "Error message",
    "errors": {...},
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

## Эндпоинты

### Health Check

**GET** `/api/health`

Проверка работоспособности API.

**Ответ:**
```json
{
    "success": true,
    "data": null,
    "message": "CSTM API is running",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

### Пользователь

**GET** `/api/user`

Получение информации о текущем пользователе.

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    },
    "message": "Success",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

### Задачи

#### Получение списка задач

**GET** `/api/tasks`

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": [],
    "message": "Tasks retrieved successfully",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

#### Создание задачи

**POST** `/api/tasks`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "title": "Новая задача",
    "description": "Описание задачи",
    "priority": "high"
}
```

**Ответ:**
```json
{
    "success": true,
    "data": {
        "title": "Новая задача",
        "description": "Описание задачи",
        "priority": "high"
    },
    "message": "Task created successfully",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

#### Получение задачи

**GET** `/api/tasks/{id}`

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": {
        "id": "1"
    },
    "message": "Task 1 details",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

#### Обновление задачи

**PUT** `/api/tasks/{id}`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "title": "Обновленная задача",
    "status": "completed"
}
```

**Ответ:**
```json
{
    "success": true,
    "data": {
        "id": "1",
        "title": "Обновленная задача",
        "status": "completed"
    },
    "message": "Task 1 updated successfully",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

#### Удаление задачи

**DELETE** `/api/tasks/{id}`

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": null,
    "message": "Task 1 deleted successfully",
    "timestamp": "2024-01-01T00:00:00.000000Z"
}
```

## Коды состояния HTTP

- **200** - Успешный запрос
- **201** - Ресурс создан
- **400** - Ошибка валидации
- **401** - Не авторизован
- **404** - Ресурс не найден
- **422** - Ошибка валидации данных
- **500** - Внутренняя ошибка сервера

## Rate Limiting

API имеет ограничение на количество запросов: 60 запросов в минуту на IP-адрес или пользователя.

## Тестирование API

### С помощью curl

```bash
# Health check
curl -X GET http://localhost:8000/api/health

# Получение задач (с токеном)
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/json"
```

### С помощью Postman

1. Импортируйте коллекцию
2. Установите базовый URL: `http://localhost:8000/api`
3. Добавьте токен в заголовки авторизации
4. Тестируйте эндпоинты

## Разработка

### Добавление нового эндпоинта

1. Создайте контроллер в `app/Http/Controllers/Api/`
2. Добавьте роут в `routes/api.php`
3. Используйте `ApiResponse` для стандартизации ответов
4. Добавьте валидацию с помощью Form Requests
5. Напишите тесты

### Структура файлов

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── TaskController.php
│   └── Resources/
│       └── ApiResponse.php
├── Exceptions/
│   └── Handler.php
└── Providers/
    └── RouteServiceProvider.php

routes/
└── api.php
``` 