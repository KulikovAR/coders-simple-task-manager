-- ПОЛНОЕ УДАЛЕНИЕ ТАБЛИЦ TELESCOPE
-- ВНИМАНИЕ: Этот скрипт удалит ВСЕ таблицы Telescope

-- 1. Удаляем внешние ключи
ALTER TABLE telescope_entries_tags DROP FOREIGN KEY telescope_entries_tags_entry_uuid_foreign;

-- 2. Удаляем таблицы
DROP TABLE IF EXISTS telescope_entries_tags;
DROP TABLE IF EXISTS telescope_entries;
DROP TABLE IF EXISTS telescope_monitoring;

-- 3. Проверяем что таблицы удалены
SHOW TABLES LIKE 'telescope_%';
