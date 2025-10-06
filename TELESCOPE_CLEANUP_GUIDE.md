# 🚨 Решение проблемы переполнения Telescope

## 📋 Описание проблемы

Laravel Telescope заполнил базу данных более чем на 30ГБ записей, что привело к:
- Зависанию операций удаления
- Нехватке места на сервере
- Снижению производительности приложения

## 🛠️ Решение

### 1. Экстренная очистка (НЕМЕДЛЕННО)

Для быстрого освобождения места выполните:

```bash
# Перейдите в директорию проекта
cd /path/to/your/project

# Запустите экстренную очистку
./scripts/telescope-emergency-cleanup.sh
```

Или вручную:
```bash
php artisan telescope:emergency-cleanup --keep-days=1 --batch-size=500 --force
```

### 2. Обычная очистка (рекомендуется)

После экстренной очистки настройте регулярную очистку:

```bash
# Очистка записей старше 7 дней
php artisan telescope:cleanup --days=7 --batch-size=1000

# Предварительный просмотр
php artisan telescope:cleanup --days=7 --dry-run
```

### 3. Автоматическая очистка

Автоматическая очистка уже настроена в `routes/console.php`:
- Ежедневно в 02:00 - очистка Telescope (записи старше 7 дней)
- Ежедневно в 02:30 - очистка файлов

Для работы автоматической очистки добавьте в cron:
```bash
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

## 🔧 Настройка Telescope

### Отключение на продакшене (рекомендуется)

В файле `.env`:
```env
TELESCOPE_ENABLED=false
```

### Ограничение watchers

В файле `config/telescope.php` можно отключить ненужные watchers:
```php
'watchers' => [
    Watchers\QueryWatcher::class => false,  // Отключить логирование запросов
    Watchers\ModelWatcher::class => false,  // Отключить логирование моделей
    Watchers\RequestWatcher::class => [
        'enabled' => env('TELESCOPE_REQUEST_WATCHER', false), // Отключить логирование запросов
    ],
    // Оставить только критически важные
    Watchers\ExceptionWatcher::class => true,
    Watchers\LogWatcher::class => [
        'enabled' => env('TELESCOPE_LOG_WATCHER', true),
        'level' => 'error', // Только ошибки
    ],
],
```

### Фильтрация записей

В файле `app/Providers/TelescopeServiceProvider.php` уже настроена фильтрация:
```php
Telescope::filter(function (IncomingEntry $entry) use ($isLocal) {
    return $isLocal ||
        $entry->isReportableException() ||
        $entry->isFailedRequest() ||
        $entry->isFailedJob() ||
        $entry->isScheduledTask() ||
        $entry->hasMonitoredTag();
});
```

## 📊 Мониторинг

### Проверка размера таблиц

```sql
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'your_database_name'
    AND table_name LIKE 'telescope_%'
ORDER BY (data_length + index_length) DESC;
```

### Проверка количества записей

```bash
php artisan tinker --execute="
echo 'Всего записей: ' . DB::table('telescope_entries')->count() . PHP_EOL;
echo 'Записей за последние 7 дней: ' . DB::table('telescope_entries')->where('created_at', '>=', now()->subDays(7))->count() . PHP_EOL;
"
```

## 🚀 Команды для управления

### Основные команды очистки

```bash
# Обычная очистка
php artisan telescope:cleanup --days=7

# Экстренная очистка
php artisan telescope:emergency-cleanup --keep-days=1

# Предварительный просмотр
php artisan telescope:cleanup --dry-run
```

### Параметры команд

- `--days=N` - количество дней для сохранения записей
- `--batch-size=N` - размер пакета для удаления (меньше = безопаснее)
- `--dry-run` - показать что будет удалено без выполнения
- `--force` - выполнить без подтверждения

## ⚠️ Важные замечания

1. **Всегда делайте резервную копию** перед массовым удалением
2. **Начните с экстренной очистки** для быстрого освобождения места
3. **Настройте автоматическую очистку** для предотвращения повторения проблемы
4. **Рассмотрите отключение Telescope на продакшене** - он предназначен для разработки
5. **Мониторьте размер базы данных** регулярно

## 🔍 Диагностика

### Проверка производительности

```bash
# Проверка медленных запросов
php artisan telescope:cleanup --dry-run

# Анализ размера таблиц
php artisan tinker --execute="
DB::table('telescope_entries')->selectRaw('COUNT(*) as count, DATE(created_at) as date')
    ->groupBy('date')
    ->orderBy('date', 'desc')
    ->limit(10)
    ->get()
    ->each(function(\$item) {
        echo \$item->date . ': ' . \$item->count . ' записей' . PHP_EOL;
    });
"
```

## 📈 Оптимизация

### Индексы базы данных

Убедитесь, что в таблице `telescope_entries` есть индексы:
- `created_at` - для быстрого поиска по дате
- `type` - для фильтрации по типу записи
- `batch_id` - для группировки записей

### Настройка MySQL

```ini
# В my.cnf
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
```

## 🆘 Если ничего не помогает

1. **Временно отключите Telescope**:
   ```env
   TELESCOPE_ENABLED=false
   ```

2. **Удалите таблицы Telescope**:
   ```bash
   php artisan migrate:rollback --path=database/migrations/2025_07_20_141337_create_telescope_entries_table.php
   ```

3. **Пересоздайте таблицы** (если нужны):
   ```bash
   php artisan migrate --path=database/migrations/2025_07_20_141337_create_telescope_entries_table.php
   ```

## 📞 Поддержка

Если проблема не решается, проверьте:
1. Логи приложения: `storage/logs/laravel.log`
2. Логи веб-сервера
3. Логи базы данных
4. Использование памяти и CPU сервера
