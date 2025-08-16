# RichTextEditor - Умный текстовый редактор

## 🚀 Возможности

Новый `RichTextEditor` на основе TipTap предоставляет следующие возможности:

### ✨ Форматирование текста
- **Жирный текст** - `Ctrl+B` или кнопка в панели инструментов
- **Курсив** - `Ctrl+I` или кнопка в панели инструментов  
- **Код** - `Ctrl+Shift+C` или кнопка в панели инструментов
- **Цитаты** - кнопка в панели инструментов
- **Списки** - маркированные и нумерованные списки

### 🔗 Ссылки и изображения
- **Добавление ссылок** - кнопка 🔗 в панели инструментов
- **Вставка изображений по URL** - кнопка 🖼️ в панели инструментов
- **Загрузка файлов** - кнопка 📎 в панели инструментов

### 📁 Drag & Drop
- **Перетаскивание изображений** - просто перетащите файл в область редактора
- **Поддержка форматов** - PNG, JPG, GIF, SVG

### 👥 Упоминания пользователей
- **Автодополнение** - начните писать `@` и выберите пользователя
- **Поиск по имени/email** - автоматический поиск при вводе

### ⌨️ Горячие клавиши
- `Ctrl+Z` - отменить
- `Ctrl+Y` - повторить
- `Ctrl+B` - жирный
- `Ctrl+I` - курсив
- `Ctrl+Shift+C` - код

## 📦 Установка

Пакеты уже установлены в проекте:
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-mention
```

## 🔧 Использование

### Базовое использование
```jsx
import RichTextEditor from '@/Components/RichTextEditor';

function MyComponent() {
    const [content, setContent] = useState('');
    
    return (
        <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Начните писать..."
        />
    );
}
```

### С поддержкой упоминаний
```jsx
<RichTextEditor
    value={content}
    onChange={setContent}
    users={users} // Массив пользователей для упоминаний
    onMentionSelect={(user) => console.log('Упомянут:', user)}
    placeholder="Введите текст с @упоминаниями..."
/>
```

### С кастомными стилями
```jsx
<RichTextEditor
    value={content}
    onChange={setContent}
    className="border-2 border-blue-500 rounded-xl"
/>
```

## 🎨 Кастомизация

### Добавление новых расширений
```jsx
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';

const editor = useEditor({
    extensions: [
        StarterKit,
        Table,
        TableRow,
        TableCell,
        // ... другие расширения
    ],
    // ... остальные настройки
});
```

### Кастомизация панели инструментов
Редактор автоматически показывает/скрывает кнопки в зависимости от активных расширений. 
Вы можете добавить новые кнопки или изменить существующие в компоненте.

## 🔒 Безопасность

### Отображение HTML
Для безопасного отображения HTML контента используйте компонент `HtmlRenderer`:

```jsx
import HtmlRenderer from '@/Components/HtmlRenderer';

<HtmlRenderer content={comment.content} />
```

### Валидация на бэкенде
Все HTML контент проходит через TipTap, который автоматически очищает потенциально опасные теги.

## 📱 Адаптивность

Редактор автоматически адаптируется под размер экрана:
- Панель инструментов сворачивается на мобильных устройствах
- Кнопки оптимизированы для touch-устройств
- Drag & drop работает на всех платформах

## 🚀 Миграция с MentionTextarea

### Замена в существующих компонентах

**Было:**
```jsx
import MentionTextarea from '@/Components/MentionTextarea';

<MentionTextarea
    value={content}
    onChange={setContent}
    users={users}
    rows={4}
/>
```

**Стало:**
```jsx
import RichTextEditor from '@/Components/RichTextEditor';

<RichTextEditor
    value={content}
    onChange={setContent}
    users={users}
/>
```

### Обратная совместимость
- `RichTextEditor` принимает те же пропсы, что и `MentionTextarea`
- HTML контент можно отображать через `HtmlRenderer`
- Упоминания работают так же, как и раньше

## 🎯 Примеры использования

### 1. Комментарии к задачам
```jsx
// resources/js/Components/TaskCommentsWithRichEditor.jsx
<RichTextEditor
    value={data.content}
    onChange={(newValue) => setData('content', newValue)}
    onMentionSelect={handleMentionSelect}
    users={users}
    placeholder="Введите комментарий... (используйте @ для упоминания пользователей, поддерживается форматирование, изображения и ссылки)"
/>
```

### 2. Описание проекта
```jsx
<RichTextEditor
    value={project.description}
    onChange={setProjectDescription}
    placeholder="Опишите ваш проект..."
/>
```

### 3. Результат выполнения задачи
```jsx
<RichTextEditor
    value={task.result}
    onChange={setTaskResult}
    placeholder="Опишите результат выполнения задачи..."
/>
```

## 🔧 Технические детали

### Архитектура
- **TipTap** - основа редактора
- **ProseMirror** - движок для работы с документами
- **React Hooks** - управление состоянием
- **Tailwind CSS** - стилизация

### Производительность
- Ленивая загрузка расширений
- Оптимизированные обновления DOM
- Минимальные перерендеры

### Расширяемость
- Модульная архитектура
- Легкое добавление новых функций
- Поддержка плагинов TipTap

## 🐛 Решение проблем

### Редактор не загружается
1. Проверьте, что все пакеты установлены
2. Убедитесь, что компонент обернут в React компонент
3. Проверьте консоль браузера на ошибки

### Упоминания не работают
1. Проверьте, что массив `users` передается корректно
2. Убедитесь, что у пользователей есть поля `name` и `email`
3. Проверьте, что `onMentionSelect` callback определен

### Изображения не отображаются
1. Проверьте URL изображения
2. Убедитесь, что изображение доступно по указанному URL
3. Проверьте CORS политики для внешних изображений

## 📚 Полезные ссылки

- [TipTap документация](https://tiptap.dev/)
- [ProseMirror документация](https://prosemirror.net/)
- [React Hooks документация](https://react.dev/reference/react/hooks)
