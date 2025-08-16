# 🚀 HtmlContentService - Сервис для обработки HTML контента с изображениями

## 📋 Описание

`HtmlContentService` - это мощный сервис для безопасной обработки HTML контента, включающий:
- Очистку HTML от потенциально опасных элементов
- Автоматическую загрузку изображений в хранилище
- Безопасное редактирование существующего контента
- Управление жизненным циклом изображений

## 🔧 Основные возможности

### ✨ Безопасность
- Автоматическая очистка от XSS атак
- Удаление опасных тегов (script, iframe, form, input, button)
- Фильтрация опасных атрибутов (onclick, onload, javascript:)
- Валидация MIME типов изображений

### 🖼️ Обработка изображений
- Поддержка base64 изображений (drag & drop)
- Скачивание внешних изображений
- Автоматическое определение типа файла
- Ограничение размера файлов (5MB по умолчанию)
- Уникальные имена файлов (UUID)

### 🔄 Управление контентом
- Безопасное обновление существующего HTML
- Сохранение уже загруженных изображений
- Автоматическая очистка неиспользуемых файлов
- Статистика контента

## 📦 Установка и настройка

### 1. Создание символической ссылки для storage
```bash
php artisan storage:link
```

### 2. Настройка диска в config/filesystems.php
```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

### 3. Создание директорий для изображений
```bash
mkdir -p storage/app/public/html-content-images
mkdir -p storage/app/public/comments
mkdir -p storage/app/public/tasks
```

## 🚀 Использование

### Базовое использование

```php
use App\Services\HtmlContentService;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $htmlContentService = app(HtmlContentService::class);
        
        // Обрабатываем HTML контент
        $processedContent = $htmlContentService->processContent($request->content, [
            'storage_path' => 'comments/' . $request->task_id,
            'disk' => 'public'
        ]);
        
        // Создаем комментарий с обработанным контентом
        $comment = Comment::create([
            'content' => $processedContent['html'],
            'task_id' => $request->task_id,
            'user_id' => auth()->id()
        ]);
        
        return response()->json([
            'comment' => $comment,
            'images' => $processedContent['images']
        ]);
    }
}
```

### Безопасное обновление

```php
public function update(Request $request, Comment $comment)
{
    $htmlContentService = app(HtmlContentService::class);
    
    // Безопасно обновляем контент
    $processedContent = $htmlContentService->updateContent(
        $request->content,
        $comment->content,
        [
            'storage_path' => 'comments/' . $comment->task_id,
            'disk' => 'public'
        ]
    );
    
    // Удаляем неиспользуемые изображения
    $htmlContentService->cleanupUnusedImages(
        $comment->content,
        $processedContent['html'],
        ['disk' => 'public']
    );
    
    // Обновляем комментарий
    $comment->update([
        'content' => $processedContent['html']
    ]);
    
    return response()->json([
        'comment' => $comment,
        'images' => $processedContent['images']
    ]);
}
```

## 🎯 Интеграция в существующие сервисы

### CommentService

```php
use App\Services\HtmlContentService;

class CommentService
{
    public function createComment(array $data, Task $task, User $user): TaskComment
    {
        // Обрабатываем HTML контент с изображениями
        $htmlContentService = app(HtmlContentService::class);
        $processedContent = $htmlContentService->processContent($data['content'], [
            'storage_path' => 'comments/' . $task->id,
            'disk' => 'public'
        ]);

        return TaskComment::create([
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => $processedContent['html'],
            'type' => $data['type'] ?? CommentType::GENERAL,
        ]);
    }
}
```

### TaskService

```php
use App\Services\HtmlContentService;

class TaskService
{
    public function createTask(array $data, Project $project, User $reporter): Task
    {
        $htmlContentService = app(HtmlContentService::class);
        
        // Обрабатываем описание
        $processedDescription = null;
        if (!empty($data['description'])) {
            $processedDescription = $htmlContentService->processContent($data['description'], [
                'storage_path' => 'tasks/' . $project->id . '/descriptions',
                'disk' => 'public'
            ]);
        }
        
        // Обрабатываем результат
        $processedResult = null;
        if (!empty($data['result'])) {
            $processedResult = $htmlContentService->processContent($data['result'], [
                'storage_path' => 'tasks/' . $project->id . '/results',
                'disk' => 'public'
            ]);
        }

        return Task::create([
            'project_id' => $project->id,
            'title' => $data['title'],
            'description' => $processedDescription ? $processedDescription['html'] : null,
            'result' => $processedResult ? $processedResult['html'] : null,
            // ... остальные поля
        ]);
    }
}
```

## ⚙️ Конфигурация

### Настройка размера изображений

```php
class HtmlContentService
{
    // Максимальный размер изображения в байтах (5MB)
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    
    // Разрешенные типы изображений
    const ALLOWED_IMAGE_TYPES = [
        'image/jpeg', 'image/jpg', 'image/png', 
        'image/gif', 'image/webp', 'image/svg+xml'
    ];
}
```

### Настройка разрешенных HTML тегов

```php
// Разрешенные HTML теги
const ALLOWED_HTML_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img',
    'div', 'span'
];

// Разрешенные HTML атрибуты
const ALLOWED_HTML_ATTRIBUTES = [
    'href', 'src', 'alt', 'title', 'class', 'style',
    'width', 'height', 'target', 'rel'
];
```

## 🔒 Безопасность

### Автоматическая очистка HTML

Сервис автоматически удаляет:
- `<script>` теги и содержимое
- `<iframe>` элементы
- `<form>`, `<input>`, `<button>` элементы
- Опасные атрибуты (onclick, onload, javascript:)
- Невалидные data URL

### Валидация изображений

- Проверка MIME типа
- Ограничение размера файла
- Проверка валидности base64 данных
- Безопасное скачивание внешних изображений

## 📊 Статистика и мониторинг

### Получение статистики контента

```php
$htmlContentService = app(HtmlContentService::class);
$stats = $htmlContentService->getContentStats($htmlContent);

// Результат:
[
    'characters' => 1250,
    'words' => 200,
    'paragraphs' => 5,
    'headings' => 2,
    'lists' => 1,
    'images' => 3,
    'links' => 2,
    'code_blocks' => 1,
    'blockquotes' => 1
]
```

### Логирование

Сервис автоматически логирует:
- Ошибки обработки контента
- Предупреждения о неудачной обработке изображений
- Ошибки очистки неиспользуемых файлов

## 🚨 Обработка ошибок

### Примеры ошибок и их решения

```php
try {
    $processedContent = $htmlContentService->processContent($html);
} catch (Exception $e) {
    // Ошибка обработки контента
    Log::error('HTML processing error: ' . $e->getMessage());
    
    // Возвращаем очищенный HTML без изображений
    $cleanHtml = $htmlContentService->sanitizeHtml($html);
    
    return [
        'html' => $cleanHtml,
        'error' => 'Ошибка обработки изображений'
    ];
}
```

## 🔄 Миграция существующих данных

### Обновление существующих комментариев

```php
// В миграции или команде
$comments = TaskComment::all();
$htmlContentService = app(HtmlContentService::class);

foreach ($comments as $comment) {
    if (!empty($comment->content)) {
        $processedContent = $htmlContentService->sanitizeHtml($comment->content);
        $comment->update(['content' => $processedContent]);
    }
}
```

## 📱 Frontend интеграция

### Отправка HTML контента

```javascript
// В React компоненте
const handleSubmit = async (content) => {
    try {
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
                content: content, // HTML контент из RichTextEditor
                task_id: taskId,
                type: 'comment'
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Comment created:', result.comment);
            console.log('Images processed:', result.images);
        }
    } catch (error) {
        console.error('Error creating comment:', error);
    }
};
```

## 🧪 Тестирование

### Unit тесты

```php
use App\Services\HtmlContentService;
use Tests\TestCase;

class HtmlContentServiceTest extends TestCase
{
    public function test_sanitizes_dangerous_html()
    {
        $service = new HtmlContentService();
        
        $dangerousHtml = '<script>alert("xss")</script><p>Safe content</p>';
        $cleanHtml = $service->sanitizeHtml($dangerousHtml);
        
        $this->assertStringNotContainsString('<script>', $cleanHtml);
        $this->assertStringContainsString('<p>Safe content</p>', $cleanHtml);
    }
    
    public function test_processes_base64_images()
    {
        $service = new HtmlContentService();
        
        $htmlWithImage = '<p>Text</p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==">';
        
        $result = $service->processContent($htmlWithImage, [
            'storage_path' => 'test',
            'disk' => 'public'
        ]);
        
        $this->assertNotEmpty($result['images']);
        $this->assertStringNotContainsString('data:image', $result['html']);
    }
}
```

## 📚 Полезные ссылки

- [Laravel Storage документация](https://laravel.com/docs/storage)
- [Laravel File Uploads](https://laravel.com/docs/requests#file-uploads)
- [HTML Purifier (альтернатива)](https://github.com/mewebstudio/Purifier)
- [ProseMirror (редактор)](https://prosemirror.net/)

## 🤝 Поддержка

При возникновении проблем:

1. Проверьте логи Laravel (`storage/logs/laravel.log`)
2. Убедитесь, что символическая ссылка storage создана
3. Проверьте права доступа к директориям storage
4. Убедитесь, что диск 'public' настроен корректно

## 🔮 Планы развития

- [ ] Поддержка видео файлов
- [ ] Автоматическое сжатие изображений
- [ ] CDN интеграция
- [ ] Кэширование обработанного контента
- [ ] WebP конвертация для старых браузеров
- [ ] Drag & Drop API для файлов
- [ ] Прогресс-бар загрузки
- [ ] Превью изображений
- [ ] Метаданные изображений (EXIF)
- [ ] Водяные знаки
- [ ] Автоматическое резервное копирование
