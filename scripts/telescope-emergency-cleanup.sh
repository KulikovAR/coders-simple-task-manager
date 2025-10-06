#!/bin/bash

# Скрипт экстренной очистки Telescope
# Используйте только в случае критической нехватки места на сервере

echo "🚨 ЭКСТРЕННАЯ ОЧИСТКА TELESCOPE"
echo "================================"
echo ""

# Проверяем, что мы в правильной директории
if [ ! -f "artisan" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории Laravel проекта"
    exit 1
fi

# Проверяем подключение к базе данных
echo "🔍 Проверка подключения к базе данных..."
php artisan tinker --execute="DB::connection()->getPdo(); echo '✅ Подключение к БД успешно';" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Ошибка подключения к базе данных"
    exit 1
fi

echo ""
echo "📊 Статистика перед очисткой:"
php artisan tinker --execute="
\$total = DB::table('telescope_entries')->count();
\$old = DB::table('telescope_entries')->where('created_at', '<', now()->subDays(1))->count();
echo \"Всего записей: \$total\n\";
echo \"Записей старше 1 дня: \$old\n\";
"

echo ""
echo "⚠️  ВНИМАНИЕ: Будет удалено ВСЕ кроме записей за последние 24 часа!"
read -p "Продолжить? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Операция отменена"
    exit 0
fi

echo ""
echo "🗑️  Начинаем экстренную очистку..."

# Запускаем команду экстренной очистки
php artisan telescope:emergency-cleanup --keep-days=1 --batch-size=500 --force

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Экстренная очистка завершена успешно!"
    echo ""
    echo "📊 Статистика после очистки:"
    php artisan tinker --execute="
    \$total = DB::table('telescope_entries')->count();
    echo \"Осталось записей: \$total\n\";
    "
    
    echo ""
    echo "💡 Рекомендации:"
    echo "1. Настройте автоматическую очистку: php artisan telescope:cleanup --days=7"
    echo "2. Добавьте в cron: 0 2 * * * cd /path/to/project && php artisan telescope:cleanup --days=7"
    echo "3. Рассмотрите возможность отключения Telescope на продакшене"
else
    echo ""
    echo "❌ Ошибка при выполнении очистки"
    exit 1
fi
