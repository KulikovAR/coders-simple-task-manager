# 🚀 Руководство по интеграции функционала файлов

## 📋 Обзор

Функционал загрузки файлов полностью интегрирован в систему и готов к использованию. Все основные компоненты (задачи, проекты, комментарии) теперь поддерживают загрузку и отображение файлов.

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

## 🎯 Интеграция с существующими компонентами

### Tasks (Задачи)

#### Обновление TaskForm
```jsx
// В TaskForm.jsx уже добавлена поддержка файлов
<RichTextEditor
    value={data.description}
    onChange={(value) => setDataWithAutoSave('description', value)}
    attachableType="App\\Models\\Task"
    attachableId={task?.id || 'temp_' + Date.now()}
    placeholder="Опишите задачу подробно... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
    className="w-full"
/>
```

#### Отображение файлов в задаче
```jsx
import TaskFileAttachments from '@/Components/Tasks/TaskFileAttachments';

// В компоненте отображения задачи
<TaskFileAttachments 
    taskId={task.id} 
    onFileDeleted={(fileId) => {
        // Обработка удаления файла
        console.log('Файл удален:', fileId);
    }} 
/>
```

### Projects (Проекты)

#### Обновление ProjectForm
```jsx
// В ProjectForm.jsx уже добавлена поддержка файлов
<RichTextEditor
    value={data.description}
    onChange={(value) => setData('description', value)}
    attachableType="App\\Models\\Project"
    attachableId={project?.id || 'temp_' + Date.now()}
    placeholder="Опишите цели проекта... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
    className="w-full"
/>
```

#### Отображение файлов в проекте
```jsx
import ProjectFileAttachments from '@/Components/Projects/ProjectFileAttachments';

// В компоненте отображения проекта
<ProjectFileAttachments 
    projectId={project.id} 
    onFileDeleted={(fileId) => {
        // Обработка удаления файла
        console.log('Файл удален:', fileId);
    }} 
/>
```

### TaskComments (Комментарии к задачам)

#### Обновление TaskComments Form
```jsx
// В TaskComments/Form.jsx уже добавлена поддержка файлов
<RichTextEditor
    value={data.content}
    onChange={(value) => setData('content', value)}
    attachableType="App\\Models\\TaskComment"
    attachableId={isEditing ? comment.id : 'temp_' + Date.now()}
    placeholder="Введите комментарий... (поддерживается форматирование, изображения, ссылки и загрузка файлов)"
    className="w-full"
/>
```

#### Отображение файлов в комментарии
```jsx
import FileAttachments from '@/Components/TaskComments/FileAttachments';

// В компоненте отображения комментария
<FileAttachments 
    commentId={comment.id} 
    onFileDeleted={(fileId) => {
        // Обработка удаления файла
        console.log('Файл удален:', fileId);
    }} 
/>
```

## 🔄 Использование в новых компонентах

### Создание нового компонента с поддержкой файлов

```jsx
import RichTextEditor from '@/Components/RichTextEditor';

export default function MyComponent({ item }) {
    const [content, setContent] = useState(item?.content || '');

    return (
        <div>
            <RichTextEditor
                value={content}
                onChange={setContent}
                attachableType="App\\Models\\MyModel"
                attachableId={item?.id || 'temp_' + Date.now()}
                placeholder="Введите текст с поддержкой файлов..."
                className="w-full"
            />
        </div>
    );
}
```

### Создание компонента отображения файлов

```jsx
import { useState, useEffect } from 'react';
import { Paperclip, Download, Trash2 } from 'lucide-react';

export default function MyFileAttachments({ modelType, modelId, onFileDeleted }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (modelId) {
            loadAttachments();
        }
    }, [modelId]);

    const loadAttachments = async () => {
        try {
            const response = await fetch(`/api/file-upload?attachable_type=${modelType}&attachable_id=${modelId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setAttachments(result.data.attachments || []);
                }
            }
        } catch (err) {
            console.error('Ошибка загрузки файлов:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileDelete = async (fileId) => {
        try {
            const response = await fetch(`/api/file-upload/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                setAttachments(prev => prev.filter(file => file.id !== fileId));
                onFileDeleted?.(fileId);
            }
        } catch (err) {
            console.error('Ошибка при удалении файла:', err);
        }
    };

    if (loading) return <div>Загрузка файлов...</div>;
    if (attachments.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
                <Paperclip size={16} />
                <span className="font-medium">Файлы ({attachments.length})</span>
            </div>
            
            <div className="space-y-2">
                {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="truncate">{attachment.original_name}</span>
                        <div className="flex gap-2">
                            <a
                                href={`/api/file-upload/${attachment.id}/download`}
                                target="_blank"
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <Download size={16} />
                            </a>
                            <button
                                onClick={() => handleFileDelete(attachment.id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 🧪 Тестирование

### Запуск тестов
```bash
# Запуск всех тестов
php artisan test

# Запуск только тестов файлов
php artisan test --filter=FileUploadTest

# Запуск конкретного теста
php artisan test --filter=test_user_can_upload_file
```

### Тестирование в браузере
1. Создайте задачу или проект
2. Попробуйте загрузить файл через RichTextEditor
3. Проверьте отображение файлов
4. Протестируйте скачивание и удаление

## 🗑️ Очистка неиспользуемых файлов

### Ручная очистка
```bash
# Предварительный просмотр (dry-run)
php artisan files:cleanup --dry-run

# Очистка файлов старше 7 дней
php artisan files:cleanup --days=7

# Очистка файлов старше 30 дней
php artisan files:cleanup --days=30
```

### Автоматическая очистка
Добавьте в `app/Console/Kernel.php`:
```php
protected function schedule(Schedule $schedule)
{
    // Очистка неиспользуемых файлов каждую неделю
    $schedule->command('files:cleanup --days=7')->weekly();
}
```

## 🔒 Безопасность

### Проверка прав доступа
- Пользователь может удалять только свои файлы
- Все запросы проверяют CSRF токены
- Валидация файлов на сервере

### Лимиты
- Максимальный размер файла: 50MB
- Общий лимит пользователя: 500MB
- Поддерживаются только безопасные типы файлов

## 🐛 Решение проблем

### Файл не загружается
1. Проверьте лимиты пользователя
2. Убедитесь, что attachableType и attachableId указаны
3. Проверьте права доступа к storage

### Файлы не отображаются
1. Проверьте attachableType и attachableId
2. Убедитесь, что миграции выполнены
3. Проверьте логи Laravel

### Ошибки валидации
1. Проверьте размер файла (максимум 50MB)
2. Убедитесь, что тип файла поддерживается
3. Проверьте обязательные поля

## 📚 Полезные ссылки

- [FILE_UPLOAD_README.md](./FILE_UPLOAD_README.md) - Подробная документация по функционалу
- [RICH_TEXT_EDITOR_FILE_UPLOAD_PROGRESS.md](./RICH_TEXT_EDITOR_FILE_UPLOAD_PROGRESS.md) - Прогресс реализации
- [Laravel Storage документация](https://laravel.com/docs/storage)
- [TipTap документация](https://tiptap.dev/)

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте логи Laravel (`storage/logs/laravel.log`)
2. Убедитесь, что все миграции выполнены
3. Проверьте настройки файловой системы
4. Убедитесь, что символическая ссылка storage создана

## 🎉 Готово!

Функционал загрузки файлов полностью интегрирован и готов к использованию. Все основные компоненты системы теперь поддерживают работу с файлами, включая:

- ✅ RichTextEditor с поддержкой файлов
- ✅ Tasks (задачи) с файлами
- ✅ Projects (проекты) с файлами  
- ✅ TaskComments (комментарии) с файлами
- ✅ Безопасность и валидация
- ✅ Тесты и документация
- ✅ Команды для обслуживания

Система готова к продакшену! 🚀
