# 🚀 Функционал загрузки файлов в RichTextEditor

## 📋 Описание

Реализован полнофункциональный механизм загрузки файлов в RichTextEditor с поддержкой:
- Различных типов файлов (документы, аудио, видео, архивы, изображения)
- Drag & Drop интерфейса
- Валидации и безопасности
- Статистики пользователя
- Красивого отображения файлов

## 🔧 Установка и настройка

### 1. Запуск миграций
```bash
php artisan migrate
```

### 2. Создание символической ссылки для storage
```bash
php artisan storage:link
```

### 3. Проверка настроек файловой системы
Убедитесь, что в `config/filesystems.php` настроен диск `public`:
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

## 🎯 Использование

### Базовое использование RichTextEditor с файлами

```jsx
import RichTextEditor from '@/Components/RichTextEditor';

<RichTextEditor
    value={content}
    onChange={setContent}
    attachableType="App\\Models\\TaskComment"
    attachableId={commentId}
    users={users}
    placeholder="Введите текст с поддержкой файлов..."
/>
```

### Обязательные параметры для работы с файлами

- **attachableType** - полное имя класса модели (например, `App\\Models\\TaskComment`)
- **attachableId** - ID объекта, к которому прикрепляются файлы

### Поддерживаемые типы файлов

| Тип | Расширения | Максимальный размер |
|-----|------------|-------------------|
| **Документы** | PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV | 50MB |
| **Архивы** | ZIP, RAR, 7Z | 50MB |
| **Аудио** | MP3, WAV, OGG, MP4 | 50MB |
| **Видео** | MP4, AVI, MOV, WMV, WebM | 50MB |
| **Изображения** | JPG, PNG, GIF, WebP, SVG | 50MB |

## 🏗️ Архитектура

### Frontend компоненты

```
RichTextEditor.jsx
├── FileExtension.js (TipTap расширение)
├── RichTextFileService.js (сервис для работы с файлами)
└── FileUploadModal.jsx (модальное окно загрузки)
```

### Backend компоненты

```
FileUploadController.php (web маршруты)
├── StoreFileRequest.php (валидация)
├── FileUploadService.php (бизнес-логика)
└── FileAttachment.php (модель)
```

### База данных

Таблица `file_attachments` с полями:
- `id` - уникальный идентификатор
- `user_id` - ID пользователя, загрузившего файл
- `original_name` - оригинальное имя файла
- `file_name` - уникальное имя файла на сервере
- `file_path` - путь к файлу на диске
- `mime_type` - MIME тип файла
- `file_size` - размер файла в байтах
- `description` - описание файла
- `attachable_type` - тип объекта (полиморфная связь)
- `attachable_id` - ID объекта
- `created_at`, `updated_at` - временные метки

## 🔒 Безопасность

### Валидация файлов
- Проверка размера (максимум 50MB)
- Проверка MIME типов
- Автоматическая очистка опасных файлов

### Права доступа
- Пользователь может удалять только свои файлы
- Проверка CSRF токенов
- Валидация на сервере

### Хранение файлов
- Уникальные имена файлов (UUID)
- Изолированные директории для разных типов объектов
- Автоматическая очистка неиспользуемых файлов

## 📊 Лимиты и ограничения

### Лимиты пользователя
- **Максимальный размер одного файла**: 50MB
- **Общий лимит пользователя**: 500MB
- **Автоматическая проверка** при загрузке

### Мониторинг использования
```php
// Получение статистики пользователя
$stats = $fileUploadService->getUserFileStats($userId);

// Проверка лимита перед загрузкой
$canUpload = $fileUploadService->checkUserFileLimit($userId, $fileSize);
```

## 🎨 Кастомизация

### Изменение максимального размера файлов

В `FileUploadService.php`:
```php
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

### Добавление новых типов файлов

В `FileUploadService.php`:
```php
const ALLOWED_FILE_TYPES = [
    // ... существующие типы
    'application/x-custom' => 'custom',
];
```

### Изменение структуры хранения

В `FileUploadService.php` метод `getStoragePath()`:
```php
private function getStoragePath(string $attachableType, $attachableId): string
{
    $basePath = 'custom-attachments';
    
    if (str_contains($attachableType, 'CustomModel')) {
        $basePath .= '/custom';
    }
    
    return $basePath . '/' . $attachableId;
}
```

## 🔄 Интеграция с существующими компонентами

### TaskComments

```jsx
<RichTextEditor
    value={data.content}
    onChange={(value) => setData('content', value)}
    attachableType="App\\Models\\TaskComment"
    attachableId={comment.id}
    users={projectUsers}
/>
```

### Tasks

```jsx
<RichTextEditor
    value={task.description}
    onChange={setTaskDescription}
    attachableType="App\\Models\\Task"
    attachableId={task.id}
/>
```

### Projects

```jsx
<RichTextEditor
    value={project.description}
    onChange={setProjectDescription}
    attachableType="App\\Models\\Project"
    attachableId={project.id}
/>
```

## 🧪 Тестирование

### Создание тестовых файлов

```php
// Использование фабрики
$attachment = FileAttachment::factory()->create();

// Создание файла определенного типа
$imageAttachment = FileAttachment::factory()->image()->create();
$pdfAttachment = FileAttachment::factory()->pdf()->create();
$wordAttachment = FileAttachment::factory()->word()->create();
$archiveAttachment = FileAttachment::factory()->archive()->create();
```

### Тестирование загрузки

```php
// Тест загрузки файла
public function test_can_upload_file()
{
    $file = UploadedFile::fake()->create('document.pdf', 1024);
    
    $response = $this->post('/file-upload', [
        'file' => $file,
        'attachable_type' => 'App\\Models\\TaskComment',
        'attachable_id' => 1,
        'description' => 'Тестовый файл'
    ]);
    
    $response->assertStatus(200);
    $this->assertDatabaseHas('file_attachments', [
        'original_name' => 'document.pdf'
    ]);
}
```

## 🐛 Решение проблем

### Файл не загружается

1. **Проверьте лимиты пользователя**
   ```php
   $stats = $fileUploadService->getUserFileStats(auth()->id());
   ```

2. **Проверьте права доступа к storage**
   ```bash
   chmod -R 775 storage/app/public
   ```

3. **Проверьте символическую ссылку**
   ```bash
   php artisan storage:link
   ```

### Ошибки валидации

1. **Проверьте размер файла** (максимум 50MB)
2. **Проверьте тип файла** (должен быть в списке разрешенных)
3. **Проверьте обязательные поля** (attachable_type, attachable_id)

### Файлы не отображаются

1. **Проверьте attachableType и attachableId**
2. **Проверьте существование файлов на диске**
3. **Проверьте права доступа к файлам**

## 📚 Полезные ссылки

- [Laravel Storage документация](https://laravel.com/docs/storage)
- [Laravel File Uploads](https://laravel.com/docs/requests#file-uploads)
- [TipTap документация](https://tiptap.dev/)
- [ProseMirror документация](https://prosemirror.net/)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи Laravel (`storage/logs/laravel.log`)
2. Убедитесь, что все миграции выполнены
3. Проверьте настройки файловой системы
4. Убедитесь, что символическая ссылка storage создана

## 🔮 Планы развития

- [ ] Поддержка облачных хранилищ (S3, Google Cloud)
- [ ] Автоматическое сжатие изображений
- [ ] Предпросмотр документов
- [ ] Версионирование файлов
- [ ] Интеграция с CDN
- [ ] Автоматическая очистка по расписанию
