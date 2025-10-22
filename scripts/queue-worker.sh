#!/bin/bash

# Скрипт для управления Laravel Queue Worker
# Использование: ./queue-worker.sh {start|stop|restart|status}

PROJECT_PATH="/var/www/dev.379tm.ru"
LOG_FILE="$PROJECT_PATH/storage/logs/queue-worker.log"
PID_FILE="$PROJECT_PATH/storage/logs/queue-worker.pid"

# Функция для запуска worker
start_worker() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Queue worker уже запущен (PID: $(cat $PID_FILE))"
        return 1
    fi

    echo "Запуск queue worker..."
    cd "$PROJECT_PATH"
    nohup php artisan queue:work \
        --queue=seo-recognition,wordstat-recognition,default \
        --tries=3 \
        --timeout=300 \
        --sleep=3 \
        --max-jobs=1000 \
        --max-time=3600 \
        >> "$LOG_FILE" 2>&1 &

    echo $! > "$PID_FILE"
    echo "Queue worker запущен (PID: $!)"
}

# Функция для остановки worker
stop_worker() {
    if [ ! -f "$PID_FILE" ]; then
        echo "PID файл не найден. Queue worker может быть не запущен."
        return 1
    fi

    PID=$(cat "$PID_FILE")
    if ! kill -0 "$PID" 2>/dev/null; then
        echo "Queue worker не запущен"
        rm -f "$PID_FILE"
        return 1
    fi

    echo "Остановка queue worker (PID: $PID)..."
    kill "$PID"

    # Ждем завершения процесса
    for i in {1..30}; do
        if ! kill -0 "$PID" 2>/dev/null; then
            break
        fi
        sleep 1
    done

    # Принудительная остановка если процесс все еще работает
    if kill -0 "$PID" 2>/dev/null; then
        echo "Принудительная остановка..."
        kill -9 "$PID"
    fi

    rm -f "$PID_FILE"
    echo "Queue worker остановлен"
}

# Функция для проверки статуса
status_worker() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Queue worker запущен (PID: $(cat $PID_FILE))"
        return 0
    else
        echo "Queue worker не запущен"
        return 1
    fi
}

# Основная логика
case "$1" in
    start)
        start_worker
        ;;
    stop)
        stop_worker
        ;;
    restart)
        stop_worker
        sleep 2
        start_worker
        ;;
    status)
        status_worker
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
