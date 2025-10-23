#!/bin/bash

# Скрипт для управления Laravel Queue Worker и Kafka Consumer
# Использование: ./queue-worker.sh {start|stop|restart|status}

PROJECT_PATH="/var/www/dev.379tm.ru"
LOG_FILE="$PROJECT_PATH/storage/logs/services.log"
PID_FILE="$PROJECT_PATH/storage/logs/services.pid"

# Функция для запуска сервисов
start_services() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Сервисы уже запущены (PID: $(cat $PID_FILE))"
        return 1
    fi

    echo "Запуск queue worker и kafka consumer..."
    cd "$PROJECT_PATH"
    
    # Запускаем queue worker в фоне
    nohup php artisan queue:work \
        --queue=seo-recognition,wordstat-recognition,default \
        --tries=3 \
        --timeout=300 \
        --sleep=3 \
        --max-jobs=1000 \
        --max-time=3600 \
        >> "$LOG_FILE" 2>&1 &
    
    QUEUE_PID=$!
    
    # Запускаем kafka consumer в фоне
    nohup php artisan kafka:tracking-consumer \
        >> "$LOG_FILE" 2>&1 &
    
    KAFKA_PID=$!
    
    # Сохраняем PID основного процесса (queue worker)
    echo $QUEUE_PID > "$PID_FILE"
    echo "Queue worker запущен (PID: $QUEUE_PID)"
    echo "Kafka consumer запущен (PID: $KAFKA_PID)"
}

# Функция для остановки сервисов
stop_services() {
    if [ ! -f "$PID_FILE" ]; then
        echo "PID файл не найден. Сервисы могут быть не запущены."
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if ! kill -0 "$PID" 2>/dev/null; then
        echo "Сервисы не запущены"
        rm -f "$PID_FILE"
        return 1
    fi

    echo "Остановка сервисов (PID: $PID)..."
    
    # Останавливаем все процессы php artisan
    pkill -f "php artisan queue:work"
    pkill -f "php artisan kafka:tracking-consumer"

    # Ждем завершения процессов
    for i in {1..30}; do
        if ! pgrep -f "php artisan" > /dev/null; then
            break
        fi
        sleep 1
    done

    # Принудительная остановка если процессы все еще работают
    if pgrep -f "php artisan" > /dev/null; then
        echo "Принудительная остановка..."
        pkill -9 -f "php artisan"
    fi

    rm -f "$PID_FILE"
    echo "Сервисы остановлены"
}

# Функция для проверки статуса
status_services() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Сервисы запущены (PID: $(cat $PID_FILE))"
        
        # Проверяем отдельные процессы
        if pgrep -f "php artisan queue:work" > /dev/null; then
            echo "  ✓ Queue worker работает"
        else
            echo "  ✗ Queue worker не работает"
        fi
        
        if pgrep -f "php artisan kafka:tracking-consumer" > /dev/null; then
            echo "  ✓ Kafka consumer работает"
        else
            echo "  ✗ Kafka consumer не работает"
        fi
        
        return 0
    else
        echo "Сервисы не запущены"
        return 1
    fi
}

# Основная логика
case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        status_services
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
