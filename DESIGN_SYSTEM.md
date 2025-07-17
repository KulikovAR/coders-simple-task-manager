# Система дизайна Task Manager

## Обзор

Этот документ описывает единую систему дизайна для приложения Task Manager, которая обеспечивает консистентность и профессиональный внешний вид.

## Цветовая палитра

### Основные цвета
- **Primary Background**: `#0a0a0a` - Основной фон приложения
- **Secondary Background**: `#111111` - Вторичный фон для элементов
- **Card Background**: `#1a1a1a` - Фон карточек
- **Border Color**: `#2a2a2a` - Цвет границ

### Текстовые цвета
- **Text Primary**: `#ffffff` - Основной текст
- **Text Secondary**: `#a0a0a0` - Вторичный текст
- **Text Muted**: `#666666` - Приглушенный текст

### Акцентные цвета
- **Accent Green**: `#10b981` - Успех, завершение
- **Accent Blue**: `#3b82f6` - Основной акцент, ссылки
- **Accent Yellow**: `#f59e0b` - Предупреждения, ожидание
- **Accent Red**: `#ef4444` - Ошибки, опасность
- **Accent Purple**: `#8b5cf6` - Тестирование
- **Accent Pink**: `#ec4899` - Готов к релизу

## Типографика

### Шрифт
- **Основной шрифт**: Inter
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Размеры
- **Заголовки**: 2xl (1.5rem), xl (1.25rem), lg (1.125rem)
- **Основной текст**: base (1rem)
- **Мелкий текст**: sm (0.875rem), xs (0.75rem)

## Компоненты

### Кнопки

#### Основные классы
- `.btn` - Базовый класс кнопки
- `.btn-primary` - Основная кнопка
- `.btn-secondary` - Вторичная кнопка
- `.btn-success` - Кнопка успеха
- `.btn-danger` - Кнопка опасности

#### Размеры
- `.btn-sm` - Маленькая кнопка
- `.btn-lg` - Большая кнопка

#### Примеры
```jsx
<button className="btn btn-primary">Основная кнопка</button>
<button className="btn btn-secondary btn-sm">Вторичная кнопка</button>
<Link href="/create" className="btn btn-success">Создать</Link>
```

### Карточки

#### Основные классы
- `.card` - Базовый класс карточки
- `.card-header` - Заголовок карточки
- `.card-title` - Заголовок
- `.card-subtitle` - Подзаголовок

#### Примеры
```jsx
<div className="card">
    <div className="card-header">
        <h3 className="card-title">Заголовок карточки</h3>
    </div>
    <p className="text-text-secondary">Содержимое карточки</p>
</div>
```

### Формы

#### Основные классы
- `.form-input` - Поле ввода
- `.form-select` - Выпадающий список
- `.form-label` - Метка поля

#### Примеры
```jsx
<div>
    <label className="form-label">Название</label>
    <input type="text" className="form-input" placeholder="Введите название" />
</div>

<div>
    <label className="form-label">Статус</label>
    <select className="form-select">
        <option>Активный</option>
        <option>Завершен</option>
    </select>
</div>
```

### Статусы

#### Классы статусов проектов
- `.status-active` - Активный
- `.status-completed` - Завершен
- `.status-on-hold` - Приостановлен
- `.status-cancelled` - Отменен
- `.status-todo` - К выполнению

#### Классы статусов задач
- `.status-todo` - К выполнению
- `.status-in-progress` - В работе
- `.status-review` - На проверке
- `.status-testing` - Тестирование
- `.status-ready` - Готов к релизу
- `.status-done` - Завершена

#### Примеры
```jsx
<span className="status-badge status-active">Активный</span>
<span className="status-badge status-in-progress">В работе</span>
```

### Навигация

#### Классы
- `.nav-link` - Базовый класс ссылки навигации
- `.nav-link-default` - Обычное состояние
- `.nav-link-active` - Активное состояние

#### Примеры
```jsx
<Link href="/dashboard" className="nav-link nav-link-active">Dashboard</Link>
<Link href="/projects" className="nav-link nav-link-default">Проекты</Link>
```

## Сетки

### Основные классы
- `.grid-cards` - Сетка для карточек (1-3 колонки)
- `.grid-stats` - Сетка для статистики (1-4 колонки)

### Адаптивность
- **Мобильные устройства**: 1 колонка
- **Планшеты**: 2 колонки
- **Десктоп**: 3-4 колонки

## Утилиты

### Анимации
- `.animate-fade-in` - Плавное появление
- `.animate-slide-up` - Плавное появление снизу

### Эффекты
- `.shadow-glow` - Свечение при наведении
- `.text-gradient` - Градиентный текст

### Примеры
```jsx
<div className="card animate-fade-in hover:shadow-glow">
    <h1 className="text-gradient">Градиентный заголовок</h1>
</div>
```

## Принципы использования

### 1. Консистентность
- Всегда используйте предопределенные классы компонентов
- Не создавайте inline стили
- Следуйте установленной цветовой палитре

### 2. Иерархия
- Используйте правильные размеры заголовков
- Применяйте соответствующие цвета для разных типов контента
- Соблюдайте отступы между элементами

### 3. Доступность
- Все интерактивные элементы имеют состояния hover и focus
- Цвета имеют достаточный контраст
- Формы имеют четкие метки

### 4. Адаптивность
- Используйте адаптивные сетки
- Тестируйте на разных размерах экранов
- Следуйте принципам мобильного дизайна

## Миграция

При обновлении существующих компонентов:

1. Замените старые классы на новые
2. Удалите inline стили
3. Используйте семантические классы
4. Проверьте адаптивность

### Пример миграции

**Было:**
```jsx
<div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
        Кнопка
    </button>
</div>
```

**Стало:**
```jsx
<div className="card">
    <button className="btn btn-primary">
        Кнопка
    </button>
</div>
```

## Поддержка

При возникновении вопросов по использованию системы дизайна:
1. Обратитесь к этому документу
2. Проверьте примеры в существующих компонентах
3. Следуйте принципам консистентности 