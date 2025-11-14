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

## Настройка Queue Worker как фоновой задачи

### Способ 1: Systemd Service (Рекомендуется)

1. Скопируйте файл service:
```bash
sudo cp scripts/laravel-queue-worker.service /etc/systemd/system/
```

2. Отредактируйте пути в файле service под ваш сервер:
```bash
sudo nano /etc/systemd/system/laravel-queue-worker.service
```

3. Перезагрузите systemd и запустите сервис:
```bash
sudo systemctl daemon-reload
sudo systemctl enable laravel-queue-worker
sudo systemctl start laravel-queue-worker
```

4. Проверьте статус:
```bash
sudo systemctl status laravel-queue-worker
sudo journalctl -u laravel-queue-worker -f
```

### Способ 2: Скрипт управления

1. Скопируйте скрипт на сервер и сделайте исполняемым:
```bash
sudo cp scripts/queue-worker.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/queue-worker.sh
```

2. Использование:
```bash
# Запуск
sudo /usr/local/bin/queue-worker.sh start

# Остановка
sudo /usr/local/bin/queue-worker.sh stop

# Перезапуск
sudo /usr/local/bin/queue-worker.sh restart

# Проверка статуса
sudo /usr/local/bin/queue-worker.sh status
```

3. Добавьте в автозапуск через cron:
```bash
@reboot /usr/local/bin/queue-worker.sh start
```

### Способ 3: Через crontab (@reboot)

Команда уже добавлена в файл `crontab` и будет запускаться при старте системы.

## Мониторинг Queue Worker

```bash
# Просмотр логов
tail -f /var/www/storage/logs/queue-worker.log

# Проверка процессов
ps aux | grep "queue:work"

# Проверка очередей
php artisan queue:monitor
```

## Важно:

- Замените `/var/www` на реальный путь к проекту
- Убедитесь, что у пользователя cron есть права на выполнение PHP и доступ к файлам проекта
- Логи будут создаваться автоматически в `storage/logs/`
- Systemd service автоматически перезапускается при сбоях
- Queue worker обрабатывает очереди: seo-recognition, wordstat-recognition, default
