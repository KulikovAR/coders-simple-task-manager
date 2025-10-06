-- ЭКСТРЕННАЯ ОЧИСТКА TELESCOPE
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ записи Telescope кроме последних 24 часов

-- 1. Сначала удаляем связанные записи в telescope_entries_tags
DELETE FROM telescope_entries_tags 
WHERE entry_uuid IN (
    SELECT uuid FROM telescope_entries 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
    LIMIT 10000
);

-- 2. Удаляем основные записи пакетами по 1000
DELETE FROM telescope_entries 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)
LIMIT 1000;

-- 3. Повторяем удаление пока не очистим все
-- (выполните этот блок несколько раз)

-- 4. Оптимизируем таблицы после очистки
OPTIMIZE TABLE telescope_entries;
OPTIMIZE TABLE telescope_entries_tags;
OPTIMIZE TABLE telescope_monitoring;

-- 5. Проверяем результат
SELECT 
    'telescope_entries' as table_name,
    COUNT(*) as records,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM telescope_entries, information_schema.TABLES 
WHERE table_schema = DATABASE() 
    AND table_name = 'telescope_entries';
