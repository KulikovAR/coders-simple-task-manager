# CSTM API Documentation

## Обзор

CSTM (Coders Simple Task Manager) предоставляет RESTful API для управления проектами, спринтами и задачами.

## Новые поля (v2)

- **Задача**:
  - `result` — текстовое поле (nullable). Описание результата работы по задаче (что было сделано).
  - `merge_request` — строка (nullable, ссылка). Ссылка на Merge Request или Pull Request, связанный с задачей.
- **Проект**:
  - `docs` — массив ссылок на Google Docs (nullable). Список документации по проекту.

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

### Проекты

#### Получение списка проектов

**GET** `/api/projects`

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "My Project",
            "description": "Project description",
            "owner_id": 1,
            "docs": [
                "https://docs.google.com/document/d/abc123",
                "https://docs.google.com/document/d/xyz456"
            ],
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "owner": {...},
            "members": [...]
        }
    ],
    "message": "Проекты успешно загружены"
}
```

#### Создание проекта

**POST** `/api/projects`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "name": "Новый проект",
    "description": "Описание проекта",
    "docs": [
        "https://docs.google.com/document/d/abc123",
        "https://docs.google.com/document/d/xyz456"
    ]
}
```

**Ответ:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Новый проект",
        "description": "Описание проекта",
        "owner_id": 1,
        "docs": [
            "https://docs.google.com/document/d/abc123",
            "https://docs.google.com/document/d/xyz456"
        ]
    },
    "message": "Проект успешно создан"
}
```

#### Получение проекта

**GET** `/api/projects/{id}`

**Требует аутентификации:** Да

#### Обновление проекта

**PUT** `/api/projects/{id}`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "name": "Обновленное имя",
    "docs": ["https://docs.google.com/document/d/abc123"]
}
```

#### Удаление проекта

**DELETE** `/api/projects/{id}`

**Требует аутентификации:** Да

#### Добавление участника

**POST** `/api/projects/{id}/members`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "user_id": 2,
    "role": "member"
}
```

#### Удаление участника

**DELETE** `/api/projects/{id}/members/{user_id}`

**Требует аутентификации:** Да

### Спринты

#### Получение списка спринтов проекта

**GET** `/api/projects/{project_id}/sprints`

**Требует аутентификации:** Да

#### Создание спринта

**POST** `/api/projects/{project_id}/sprints`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "name": "Sprint 1",
    "description": "First sprint",
    "start_date": "2024-01-01",
    "end_date": "2024-01-15",
    "status": "planned"
}
```

#### Получение спринта

**GET** `/api/sprints/{id}`

**Требует аутентификации:** Да

#### Обновление спринта

**PUT** `/api/sprints/{id}`

**Требует аутентификации:** Да

#### Удаление спринта

**DELETE** `/api/sprints/{id}`

**Требует аутентификации:** Да

### Задачи

#### Получение списка задач проекта

**GET** `/api/projects/{project_id}/tasks`

**Требует аутентификации:** Да

#### Создание задачи

**POST** `/api/projects/{project_id}/tasks`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "title": "Новая задача",
    "description": "Описание задачи",
    "sprint_id": 1,
    "assignee_id": 2,
    "priority": "high",
    "result": "Описание результата",
    "merge_request": "https://github.com/example/pr-123"
}
```

**Ответ:**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "title": "Новая задача",
        "description": "Описание задачи",
        "sprint_id": 1,
        "assignee_id": 2,
        "priority": "high",
        "result": "Описание результата",
        "merge_request": "https://github.com/example/pr-123"
    },
    "message": "Задача успешно создана"
}
```

#### Получение задачи

**GET** `/api/tasks/{id}`

**Требует аутентификации:** Да

#### Обновление задачи

**PUT** `/api/tasks/{id}`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "title": "Обновленный заголовок",
    "description": "Обновленное описание",
    "result": "Обновленный результат",
    "merge_request": "https://github.com/example/pr-124"
}
```

#### Удаление задачи

**DELETE** `/api/tasks/{id}`

**Требует аутентификации:** Да

#### Изменение статуса задачи

**PUT** `/api/tasks/{id}/status`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "status_id": 2
}
```

#### Назначение исполнителя

**PUT** `/api/tasks/{id}/assign`

**Требует аутентификации:** Да

**Тело запроса:**
```json
{
    "assignee_id": 2
}
```

#### Получение доски проекта

**GET** `/api/projects/{project_id}/board`

**Требует аутентификации:** Да

**Ответ:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "To Do",
            "order": 1,
            "color": "#6B7280",
            "tasks": [...]
        },
        {
            "id": 2,
            "name": "In Progress",
            "order": 2,
            "color": "#3B82F6",
            "tasks": [...]
        },
        {
            "id": 3,
            "name": "Review",
            "order": 3,
            "color": "#F59E0B",
            "tasks": [...]
        },
        {
            "id": 4,
            "name": "Testing",
            "order": 4,
            "color": "#8B5CF6",
            "tasks": [...]
        },
        {
            "id": 5,
            "name": "Ready for Release",
            "order": 5,
            "color": "#EC4899",
            "tasks": [...]
        },
        {
            "id": 6,
            "name": "Done",
            "order": 6,
            "color": "#10B981",
            "tasks": [...]
        }
    ],
    "message": "Доска проекта успешно загружена"
}
```

## Коды состояния HTTP

- **200** - Успешный запрос
- **201** - Ресурс создан
- **400** - Ошибка валидации
- **401** - Не авторизован
- **403** - Доступ запрещен
- **404** - Ресурс не найден
- **422** - Ошибка валидации данных
- **500** - Внутренняя ошибка сервера

## Валидация

### Проекты
- `name` - обязательное, строка, максимум 255 символов
- `description` - необязательное, строка, максимум 1000 символов
- `docs` - необязательное, массив строк (URL)

### Спринты
- `name` - обязательное, строка, максимум 255 символов
- `description` - необязательное, строка, максимум 1000 символов
- `start_date` - обязательное, дата, не раньше сегодня
- `end_date` - обязательное, дата, после start_date
- `status` - необязательное, одно из: planned, active, completed

### Задачи
- `title` - обязательное, строка, максимум 255 символов
- `description` - необязательное, строка, максимум 1000 символов
- `sprint_id` - необязательное, существующий ID спринта
- `assignee_id` - необязательное, существующий ID пользователя
- `priority` - необязательное, одно из: low, medium, high, critical
- `result` - необязательное, строка
- `merge_request` - необязательное, строка (URL)

## Rate Limiting

API имеет ограничение на количество запросов: 60 запросов в минуту на IP-адрес или пользователя.

## Тестирование API

### С помощью curl

```bash
# Health check
curl -X GET http://localhost:8000/api/health

# Создание проекта
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer {your-token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test", "docs": ["https://docs.google.com/document/d/abc123"]}'

# Получение задач проекта
curl -X GET http://localhost:8000/api/projects/1/tasks \
  -H "Authorization: Bearer {your-token}" \
  -H "Accept: application/json"
```