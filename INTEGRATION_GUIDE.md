# 🚀 Интеграция RichTextEditor

## Быстрая замена MentionTextarea

### 1. Импорт
```jsx
// Было
import MentionTextarea from '@/Components/MentionTextarea';

// Стало
import RichTextEditor from '@/Components/RichTextEditor';
```

### 2. Замена компонента
```jsx
// Было
<MentionTextarea
    value={content}
    onChange={setContent}
    users={users}
    rows={4}
    className="w-full border rounded"
/>

// Стало
<RichTextEditor
    value={content}
    onChange={setContent}
    users={users}
    className="w-full"
/>
```

### 3. Отображение HTML контента
```jsx
// Для отображения отформатированного текста
import HtmlRenderer from '@/Components/HtmlRenderer';

<HtmlRenderer content={comment.content} />
```

## 📍 Где заменить

### Комментарии к задачам
- `resources/js/Components/TaskComments.jsx` → `TaskCommentsWithRichEditor.jsx`
- `resources/js/Pages/TaskComments/Form.jsx`

### Формы задач
- `resources/js/Components/TaskForm.jsx` (поля description, result)

### Описание проектов
- `resources/js/Pages/Projects/Form.jsx`

### Описание спринтов
- `resources/js/Pages/Sprints/Form.jsx`

### AI агент
- `resources/js/Pages/AiAgent/Index.jsx`

## 🔧 Настройка бэкенда

### 1. Валидация HTML
```php
// В Request классе
public function rules()
{
    return [
        'content' => 'required|string|max:10000', // HTML контент
    ];
}
```

### 2. Очистка HTML (опционально)
```php
// В Service классе
use Illuminate\Support\Str;

public function sanitizeHtml($html)
{
    // Разрешенные теги
    $allowedTags = [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img'
    ];
    
    return strip_tags($html, $allowedTags);
}
```

### 3. Обновление миграций (если нужно)
```php
// Увеличить размер поля content
Schema::table('task_comments', function (Blueprint $table) {
    $table->text('content')->change(); // Увеличить с VARCHAR до TEXT
});
```

## 🎨 Кастомизация стилей

### 1. Переопределение CSS переменных
```css
/* В app.css */
:root {
    --tiptap-border-color: theme('colors.border-color');
    --tiptap-accent-blue: theme('colors.accent-blue');
    --tiptap-card-bg: theme('colors.card-bg');
}
```

### 2. Кастомизация панели инструментов
```jsx
// В RichTextEditor.jsx добавить новые кнопки
<button
    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    className={`p-2 rounded hover:bg-accent-blue/10 ${
        editor.isActive('heading', { level: 2 }) ? 'bg-accent-blue/20 text-accent-blue' : 'text-text-primary'
    }`}
>
    H2
</button>
```

## 📱 Адаптивность

### 1. Мобильная панель инструментов
```jsx
// Автоматически адаптируется под размер экрана
<div className="flex flex-wrap items-center gap-1 p-2">
    {/* Кнопки автоматически переносятся */}
</div>
```

### 2. Touch-оптимизация
```jsx
// Drag & drop работает на всех устройствах
<div
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="min-h-[200px] p-3"
>
```

## 🚀 Производительность

### 1. Ленивая загрузка
```jsx
// Расширения загружаются только при необходимости
const editor = useEditor({
    extensions: [
        StarterKit, // Базовые функции
        // Дополнительные расширения загружаются по требованию
    ],
});
```

### 2. Оптимизация обновлений
```jsx
// onChange вызывается только при реальных изменениях
onUpdate: ({ editor }) => {
    const html = editor.getHTML();
    onChange(html); // Вызывается только при изменении контента
},
```

## 🔒 Безопасность

### 1. XSS защита
- TipTap автоматически очищает опасные теги
- HTML контент проходит через ProseMirror
- Поддерживается только безопасный HTML

### 2. Валидация на бэкенде
```php
// Проверка размера контента
if (strlen($request->content) > 10000) {
    throw new ValidationException('Содержание слишком длинное');
}
```

## 📊 Мониторинг

### 1. Логирование использования
```jsx
const handleMentionSelect = (user) => {
    // Логируем упоминания
    console.log('User mentioned:', user);
    
    // Отправляем аналитику
    analytics.track('user_mentioned', { 
        mentioned_user: user.id,
        context: 'comment'
    });
};
```

### 2. Отслеживание ошибок
```jsx
// В RichTextEditor
useEffect(() => {
    if (editor) {
        editor.on('error', (error) => {
            console.error('Editor error:', error);
            // Отправляем в систему мониторинга
        });
    }
}, [editor]);
```

## 🎯 Следующие шаги

1. **Заменить MentionTextarea** в основных компонентах
2. **Протестировать** функциональность на демо-странице
3. **Обновить бэкенд** для поддержки HTML контента
4. **Добавить валидацию** и очистку HTML
5. **Настроить мониторинг** использования
6. **Оптимизировать** производительность при необходимости

## 📞 Поддержка

- Демо-страница: `/demo/rich-editor`
- Документация: `RICH_TEXT_EDITOR_README.md`
- Примеры: `resources/js/Components/TaskCommentsWithRichEditor.jsx`
