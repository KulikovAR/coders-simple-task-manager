# Makefile для управления тестами проекта
# Использование: make [команда]

.PHONY: help test test-unit test-feature test-auth test-webhook test-task test-ai test-parallel test-coverage test-watch test-quick clean

# Цвета для вывода
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

# Помощь
help:
	@echo "$(GREEN)Доступные команды для тестирования:$(NC)"
	@echo ""
	@echo "$(YELLOW)Основные команды:$(NC)"
	@echo "  test          - Запустить все тесты"
	@echo "  test-unit     - Запустить только unit тесты"
	@echo "  test-feature  - Запустить только feature тесты"
	@echo "  test-parallel - Запустить все тесты параллельно (быстрее)"
	@echo ""
	@echo "$(YELLOW)Специализированные команды:$(NC)"
	@echo "  test-auth     - Тесты аутентификации"
	@echo "  test-webhook  - Тесты webhook функциональности"
	@echo "  test-task     - Тесты задач и проектов"
	@echo "  test-ai       - Тесты AI агента"
	@echo ""
	@echo "$(YELLOW)Дополнительные команды:$(NC)"
	@echo "  test-coverage - Запустить тесты с покрытием кода"
	@echo "  test-watch    - Запустить тесты в режиме наблюдения"
	@echo "  test-quick    - Быстрые тесты (без миграций)"
	@echo "  clean         - Очистить кэш и временные файлы"

# Запуск всех тестов
test:
	@echo "$(GREEN)Запуск всех тестов...$(NC)"
	@php artisan config:clear
	@php artisan test

# Unit тесты
test-unit:
	@echo "$(GREEN)Запуск unit тестов...$(NC)"
	@php artisan config:clear
	@php artisan test --testsuite=Unit

# Feature тесты
test-feature:
	@echo "$(GREEN)Запуск feature тестов...$(NC)"
	@php artisan config:clear
	@php artisan test --testsuite=Feature

# Параллельный запуск тестов (требует paratest)
test-parallel:
	@echo "$(GREEN)Запуск тестов параллельно...$(NC)"
	@php artisan config:clear
	@vendor/bin/paratest --processes=4

# Тесты аутентификации
test-auth:
	@echo "$(GREEN)Запуск тестов аутентификации...$(NC)"
	@php artisan config:clear
	@php artisan test tests/Feature/Auth/

# Тесты webhook функциональности
test-webhook:
	@echo "$(GREEN)Запуск тестов webhook...$(NC)"
	@php artisan config:clear
	@php artisan test tests/Feature/WebhookControllerTest.php tests/Feature/WebhookIntegrationTest.php tests/Unit/WebhookModelTest.php tests/Unit/WebhookServiceTest.php

# Тесты задач и проектов
test-task:
	@echo "$(GREEN)Запуск тестов задач и проектов...$(NC)"
	@php artisan config:clear
	@php -d memory_limit=512M artisan test tests/Feature/ProjectControllerTest.php tests/Feature/TaskControllerTest.php tests/Feature/TaskCommentControllerTest.php tests/Feature/TaskChecklistTest.php tests/Feature/TaskContextualFilterTest.php tests/Feature/TaskIndexStatusDuplicationTest.php tests/Feature/SprintControllerTest.php tests/Feature/SprintStatusEditingTest.php

# Тесты AI агента
test-ai:
	@echo "$(GREEN)Запуск тестов AI агента...$(NC)"
	@php artisan config:clear
	@php artisan test tests/Feature/AiAgentControllerTest.php

# Тесты с покрытием кода
test-coverage:
	@echo "$(GREEN)Запуск тестов с покрытием кода...$(NC)"
	@php artisan config:clear
	@php artisan test --coverage --coverage-html=storage/coverage

# Тесты в режиме наблюдения
test-watch:
	@echo "$(GREEN)Запуск тестов в режиме наблюдения...$(NC)"
	@php artisan config:clear
	@php artisan test --watch

# Быстрые тесты (без миграций)
test-quick:
	@echo "$(GREEN)Запуск быстрых тестов...$(NC)"
	@php artisan config:clear
	@php artisan test --without-migrations

# Очистка кэша и временных файлов
clean:
	@echo "$(GREEN)Очистка кэша и временных файлов...$(NC)"
	@php artisan config:clear
	@php artisan route:clear
	@php artisan view:clear
	@rm -rf storage/coverage
	@rm -rf storage/logs/*.log
	@echo "$(GREEN)Кэш очищен!$(NC)"

# Команды для CI/CD
test-ci:
	@echo "$(GREEN)Запуск тестов для CI...$(NC)"
	@php artisan config:clear
	@php artisan test --coverage-text --coverage-clover=coverage.xml

# Тесты только новых файлов (для разработки)
test-new:
	@echo "$(GREEN)Запуск тестов новых файлов...$(NC)"
	@php artisan config:clear
	@php artisan test tests/Feature/WebhookControllerTest.php tests/Feature/WebhookIntegrationTest.php tests/Unit/WebhookModelTest.php tests/Unit/WebhookServiceTest.php

# Проверка стиля кода
lint:
	@echo "$(GREEN)Проверка стиля кода...$(NC)"
	@./vendor/bin/pint --test

# Исправление стиля кода
lint-fix:
	@echo "$(GREEN)Исправление стиля кода...$(NC)"
	@./vendor/bin/pint
