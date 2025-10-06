#!/bin/bash

# ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ
# Используйте только если SELECT запросы зависают

echo "🚨 ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ БАЗЫ ДАННЫХ"
echo "====================================="
echo ""

# Проверяем подключение к MySQL
echo "🔍 Проверка подключения к MySQL..."
mysql -e "SELECT 1;" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Не удается подключиться к MySQL"
    echo "Попробуйте подключиться вручную:"
    echo "mysql -u root -p"
    exit 1
fi

echo "✅ Подключение к MySQL успешно"
echo ""

# Получаем имя базы данных из .env
DB_DATABASE=$(grep DB_DATABASE .env | cut -d '=' -f2 | tr -d ' ')
if [ -z "$DB_DATABASE" ]; then
    echo "❌ Не удается найти имя базы данных в .env"
    exit 1
fi

echo "📊 База данных: $DB_DATABASE"
echo ""

# Показываем текущий размер таблиц
echo "📈 Текущий размер таблиц Telescope:"
mysql -e "
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.TABLES 
WHERE table_schema = '$DB_DATABASE'
    AND table_name LIKE 'telescope_%'
ORDER BY (data_length + index_length) DESC;
"

echo ""
echo "⚠️  ВНИМАНИЕ: Выберите действие:"
echo "1) Попробовать очистку пакетами (безопасно)"
echo "2) Полностью удалить таблицы Telescope (радикально)"
echo "3) Отмена"
echo ""

read -p "Выберите действие (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🧹 Начинаем очистку пакетами..."
        
        # Выполняем очистку пакетами
        for i in {1..10}; do
            echo "Пакет $i/10..."
            mysql $DB_DATABASE -e "
                DELETE FROM telescope_entries_tags 
                WHERE entry_uuid IN (
                    SELECT uuid FROM telescope_entries 
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
                    LIMIT 1000
                );
                
                DELETE FROM telescope_entries 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
                LIMIT 1000;
            "
            
            if [ $? -eq 0 ]; then
                echo "✅ Пакет $i выполнен"
            else
                echo "❌ Ошибка в пакете $i"
                break
            fi
            
            sleep 1
        done
        
        echo ""
        echo "🔧 Оптимизируем таблицы..."
        mysql $DB_DATABASE -e "OPTIMIZE TABLE telescope_entries, telescope_entries_tags, telescope_monitoring;"
        ;;
        
    2)
        echo ""
        echo "🗑️  Полное удаление таблиц Telescope..."
        read -p "Вы уверены? Это необратимо! (yes/no): " confirm
        
        if [ "$confirm" = "yes" ]; then
            mysql $DB_DATABASE < scripts/drop-telescope-tables.sql
            
            if [ $? -eq 0 ]; then
                echo "✅ Таблицы Telescope удалены"
                echo ""
                echo "💡 Для пересоздания таблиц выполните:"
                echo "php artisan migrate --path=database/migrations/2025_07_20_141337_create_telescope_entries_table.php"
            else
                echo "❌ Ошибка при удалении таблиц"
            fi
        else
            echo "❌ Операция отменена"
        fi
        ;;
        
    3)
        echo "❌ Операция отменена"
        exit 0
        ;;
        
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "📊 Финальная статистика:"
mysql -e "
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows
FROM information_schema.TABLES 
WHERE table_schema = '$DB_DATABASE'
    AND table_name LIKE 'telescope_%'
ORDER BY (data_length + index_length) DESC;
"

echo ""
echo "✅ Операция завершена!"
echo ""
echo "💡 Рекомендации:"
echo "1. Добавьте TELESCOPE_ENABLED=false в .env"
echo "2. Настройте мониторинг размера БД"
echo "3. Рассмотрите использование Redis для Telescope"
