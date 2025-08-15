# Компоненты UI

Этот файл содержит описание всех переиспользуемых компонентов пользовательского интерфейса.

## 🎯 Переиспользуемые компоненты

### SearchInput
Компонент поиска с индикатором загрузки.

```jsx
<SearchInput
    value={search}
    onChange={setSearch}
    placeholder="Поиск..."
    isLoading={isSearching}
/>
```

### StatusBadge
Бейдж для отображения статуса задачи.

```jsx
<StatusBadge status={task.status} />
<StatusBadge statusName="active" />
```

### PriorityBadge
Бейдж для отображения приоритета задачи.

```jsx
<PriorityBadge priority="high" showIcon={true} />
```

### FilterPanel
Универсальная панель фильтров.

```jsx
<FilterPanel
    isVisible={showFilters}
    onClearFilters={clearFilters}
    searchConfig={{
        label: 'Поиск',
        value: search,
        onChange: setSearch,
        placeholder: 'Введите текст...',
        isLoading: isSearching
    }}
    filters={[
        {
            type: 'select',
            label: 'Статус',
            value: status,
            onChange: handleStatusChange,
            options: [
                { value: '', label: 'Все' },
                { value: 'active', label: 'Активный' }
            ]
        },
        {
            type: 'checkbox',
            checked: myItems,
            onChange: handleMyItemsChange,
            checkboxLabel: 'Мои элементы'
        }
    ]}
/>
```

### StatsGrid
Сетка статистических карточек.

```jsx
<StatsGrid 
    columns={4}
    stats={[
        { label: 'Всего', value: 10, color: 'text-text-primary' },
        { label: 'Активных', value: 5, color: 'text-accent-green' }
    ]}
/>
```

### EmptyState
Компонент для пустых состояний.

```jsx
<EmptyState 
    title="Ничего не найдено"
    description="Попробуйте изменить параметры поиска"
    hasFilters={!!search}
    onClearFilters={clearFilters}
    action={{
        href: route('items.create'),
        text: 'Создать элемент',
        icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
    }}
/>
```

### Pagination
Компонент пагинации для Laravel.

```jsx
<Pagination data={paginatedData} />
```

### InfoCard
Информационная карточка с иконкой.

```jsx
<InfoCard 
    title="Совет"
    description="Это полезная информация"
    variant="info" // info, warning, success, error
    icon="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
>
    <p>Дополнительный контент</p>
</InfoCard>
```

### PageHeader
Заголовок страницы с действиями.

```jsx
<PageHeader 
    title="Заголовок"
    description="Описание страницы"
    actions={[
        {
            type: 'button',
            variant: 'secondary',
            text: 'Фильтры',
            icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
            onClick: toggleFilters
        },
        {
            type: 'link',
            variant: 'primary',
            text: 'Создать',
            icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
            href: route('items.create')
        }
    ]}
/>
```

### LoadingSpinner
Спиннер загрузки.

```jsx
<LoadingSpinner 
    size="md" // sm, md, lg
    color="text-accent-blue"
    text="Загрузка..."
/>
```

## 🔧 Обновленные компоненты

### Modal
- Обновлен для соответствия дизайн-системе
- Использует темную тему и `backdrop-blur`

### TextInput
- Использует класс `form-input` из дизайн-системы

### InputLabel
- Использует класс `form-label` из дизайн-системы

### PrimaryButton/SecondaryButton
- Используют классы `btn btn-primary`/`btn btn-secondary`

## 🎨 CSS классы

Все компоненты используют единую дизайн-систему из `app.css`:

- `.card` - основной класс карточек
- `.btn`, `.btn-primary`, `.btn-secondary` - кнопки
- `.form-input`, `.form-select`, `.form-label` - элементы форм
- `.status-badge` - бейджи статусов
- `.grid-cards` - сетка карточек
- CSS переменные для цветов и отступов

## 📱 Адаптивность

Все компоненты адаптивны и корректно работают на мобильных устройствах.
