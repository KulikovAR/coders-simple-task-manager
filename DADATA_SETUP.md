# Настройка DaData API для поиска стран

## Описание
Интеграция с DaData API для поиска стран в селекте регионов SEO проектов.

## Настройка

### 1. Получение токена
1. Зарегистрируйтесь на [dadata.ru](https://dadata.ru/)
2. Получите API токен в личном кабинете
3. Добавьте токен в `.env` файл:

```env
DADATA_TOKEN=your_token_here
DADATA_URL=https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/country
```

### 2. API Endpoints
- `GET /api/dadata/countries/popular` - Получить популярные страны
- `POST /api/dadata/countries/search` - Поиск стран по запросу

### 3. Формат данных
Страны возвращаются в формате:
```json
{
  "value": "RU",           // ISO код страны (alfa2)
  "label": "Россия",       // Название страны
  "code": "643",          // Числовой код
  "alfa2": "RU",          // ISO 3166-1 alpha-2
  "alfa3": "RUS",         // ISO 3166-1 alpha-3
  "nameShort": "Россия",  // Краткое название
  "name": "Российская Федерация" // Полное название
}
```

### 4. Особенности
- Поиск работает с минимальной задержкой 300мс
- При первом открытии загружаются популярные страны
- Минимум 2 символа для поиска
- Показывается индикатор загрузки
- Отображается код страны рядом с названием

### 5. Компоненты
- `CountrySearchableSelect` - Основной компонент поиска стран
- `DaDataService` - Сервис для работы с API
- `DaDataController` - Контроллер API endpoints
