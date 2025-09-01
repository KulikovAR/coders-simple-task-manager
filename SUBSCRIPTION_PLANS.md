# Тарифы и подписки

В системе реализована функциональность тарифов, которая позволяет ограничивать доступ пользователей к различным возможностям системы в зависимости от выбранного тарифа.

## Доступные тарифы

### Бесплатный тариф
- **Цена**: 0 руб/мес
- **Лимиты**:
  - 10 проектов
  - 5 участников на проект
  - 5 ГБ хранилища
  - 5 запросов к ИИ-ассистенту в месяц

### Тариф "Команда"
- **Цена**: 199 руб/мес за человека
- **Лимиты**:
  - Неограниченное количество проектов
  - Неограниченное количество участников в проекте
  - Неограниченное хранилище
  - 5 запросов к ИИ-ассистенту в месяц

### Тариф "Команда + ИИ"
- **Цена**: 399 руб/мес за человека
- **Лимиты**:
  - Неограниченное количество проектов
  - Неограниченное количество участников в проекте
  - Неограниченное хранилище
  - 50 запросов к ИИ-ассистенту в день (используется GPT нового поколения)

### Тариф "Эксклюзив"
- **Цена**: индивидуальная
- **Лимиты**: индивидуальные настройки
- Для получения информации свяжитесь с менеджером

## Технические детали реализации

### Модели данных

#### Subscription
Модель для хранения информации о тарифах:
```php
class Subscription extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'description',
        'max_projects',
        'max_members_per_project',
        'storage_limit_gb',
        'ai_requests_limit',
        'ai_requests_period',
        'is_custom',
        'is_active'
    ];
}
```

#### SubscriptionUserLimit
Модель для хранения информации о лимитах пользователя:
```php
class SubscriptionUserLimit extends Model
{
    protected $fillable = [
        'user_id',
        'storage_used_bytes'
    ];
}
```

### Сервисы

#### SubscriptionService
Сервис для работы с тарифами и проверки лимитов:
```php
class SubscriptionService
{
    // Получение активных тарифов
    public function getActiveSubscriptions(): Collection;
    
    // Получение тарифа по slug
    public function getSubscriptionBySlug(string $slug): ?Subscription;
    
    // Назначение тарифа пользователю
    public function assignSubscriptionToUser(User $user, Subscription $subscription, int $months = 1): void;
    
    // Проверка лимитов
    public function canCreateProject(User $user): bool;
    public function canAddMemberToProject(User $user, int $currentMembersCount): bool;
    public function canUseAi(User $user): bool;
    public function canUploadFile(User $user, int $fileSize): bool;
    
    // Получение информации о тарифе пользователя
    public function getUserSubscriptionInfo(User $user): array;
    
    // Обработка использования ресурсов
    public function processAiUsage(User $user): bool;
    public function processFileUpload(User $user, int $fileSize): bool;
    public function processFileDelete(User $user, int $fileSize): void;
}
```

### Интеграция с существующими компонентами

#### Профиль пользователя
В профиле пользователя отображается информация о текущем тарифе, лимитах и использовании ресурсов.

#### Модальное окно загрузки файлов
В модальном окне загрузки файлов отображается информация о доступном месте в хранилище.

#### ИИ-ассистент
При использовании ИИ-ассистента проверяется доступное количество запросов и отображается информация о лимитах.

#### Создание проектов
При создании проектов проверяется лимит на количество проектов.

#### Добавление участников
При добавлении участников в проект проверяется лимит на количество участников.

## Как обновить тариф

Для обновления тарифа пользователя используйте метод `assignSubscriptionToUser` сервиса `SubscriptionService`:

```php
$subscriptionService->assignSubscriptionToUser($user, $subscription, $months);
```

## Как добавить новый тариф

1. Добавьте новый тариф в сидер `SubscriptionSeeder`
2. Запустите сидер: `php artisan db:seed --class=SubscriptionSeeder`

## Как изменить лимиты для существующего тарифа

1. Измените параметры тарифа в базе данных
2. Или обновите сидер `SubscriptionSeeder` и запустите его

## Отслеживание использования ресурсов

### Хранилище
Использование хранилища отслеживается в модели `SubscriptionUserLimit`. При загрузке и удалении файлов счетчик обновляется автоматически.

### Запросы к ИИ
Количество запросов к ИИ отслеживается в модели `User` в поле `ai_requests_used`. Счетчик сбрасывается автоматически в зависимости от периода тарифа (ежедневно или ежемесячно).
