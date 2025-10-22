# Настройка Cron для SEO парсинга

## Установка crontab на сервере:

```bash
# Скопировать содержимое файла crontab в системный crontab
sudo crontab -e

# Или установить из файла:
sudo crontab /path/to/project/crontab
```
# Посмотреть логи
tail -f /var/www/storage/logs/scheduled-parsing.log
tail -f /var/www/storage/logs/cleanup-tasks.log
tail -f /var/www/storage/logs/cleanup-wordstat-tasks.log

# Запустить команду вручную для тестирования
cd /var/www && php artisan seo:run-scheduled-parsing --force
```

## Важно:

- Замените `/var/www` на реальный путь к проекту
- Убедитесь, что у пользователя cron есть права на выполнение PHP и доступ к файлам проекта
- Логи будут создаваться автоматически в `storage/logs/`
