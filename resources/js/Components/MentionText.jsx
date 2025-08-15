import { useMemo } from 'react';

export default function MentionText({ text, users = [], className = '' }) {
    // Парсинг текста и поиск упоминаний
    const parsedContent = useMemo(() => {
        if (!text) return [];
        
        // Регулярное выражение для поиска email после @
        const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = mentionRegex.exec(text)) !== null) {
            // Добавляем текст до упоминания
            if (match.index > lastIndex) {
                parts.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }

            // Ищем пользователя по email
            const email = match[1];
            const user = users.find(u => u.email === email);
            
            parts.push({
                type: 'mention',
                content: match[0], // @email
                email: email,
                user: user
            });

            lastIndex = match.index + match[0].length;
        }

        // Добавляем оставшийся текст
        if (lastIndex < text.length) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }

        return parts;
    }, [text, users]);

    // Функция для получения имени пользователя
    const getUserDisplayName = (user, email) => {
        if (user) {
            return user.name;
        }
        // Если пользователь не найден, показываем email без домена
        return email.split('@')[0];
    };

    return (
        <span className={className}>
            {parsedContent.map((part, index) => {
                if (part.type === 'mention') {
                    return (
                        <span
                            key={index}
                            className="inline-flex items-center bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded text-sm font-medium"
                            title={part.user ? `${part.user.name} (${part.email})` : part.email}
                        >
                            @{getUserDisplayName(part.user, part.email)}
                        </span>
                    );
                } else {
                    // Обрабатываем переносы строк в обычном тексте
                    return part.content.split('\n').map((line, lineIndex, lines) => (
                        <span key={`${index}-${lineIndex}`}>
                            {line}
                            {lineIndex < lines.length - 1 && <br />}
                        </span>
                    ));
                }
            })}
        </span>
    );
}
