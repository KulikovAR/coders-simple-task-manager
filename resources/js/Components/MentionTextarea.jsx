import { useState, useRef, useEffect } from 'react';

export default function MentionTextarea({
    value,
    onChange,
    onMentionSelect,
    users = [],
    placeholder = '',
    className = '',
    rows = 4,
    ...props
}) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(0);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStart, setMentionStart] = useState(-1);
    const textareaRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Поиск пользователей по имени или email
    const searchUsers = (query) => {
        // Если запрос пустой (только @), показываем всех пользователей
        if (!query) {
            return users.slice(0, 5);
        }
        
        return users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase()) ||
            user.email.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Ограничиваем до 5 результатов
    };

    // Обработка ввода текста
    const handleTextChange = (e) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart;
        
        onChange(newValue);
        
        // Поиск символа @ перед курсором
        const textBeforeCursor = newValue.slice(0, cursorPosition);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        
        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
            
            // Проверяем, что после @ нет пробелов
            if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
                const query = textAfterAt;
                const matchedUsers = searchUsers(query);
                
                if (matchedUsers.length > 0) {
                    setMentionQuery(query);
                    setMentionStart(lastAtIndex);
                    setSuggestions(matchedUsers);
                    setShowSuggestions(true);
                    setSelectedSuggestion(0);
                } else if (query.length >= 0) {
                    // Показываем пустой список если есть запрос но нет результатов (включая пустой запрос)
                    setMentionQuery(query);
                    setMentionStart(lastAtIndex);
                    setSuggestions([]);
                    setShowSuggestions(true);
                    setSelectedSuggestion(0);
                } else {
                    setShowSuggestions(false);
                }
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    // Обработка нажатий клавиш
    const handleKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestion(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestion(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                if (suggestions[selectedSuggestion]) {
                    selectUser(suggestions[selectedSuggestion]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    };

    // Выбор пользователя из списка
    const selectUser = (user) => {
        const beforeMention = value.slice(0, mentionStart);
        const afterMention = value.slice(mentionStart + 1 + mentionQuery.length);
        const newValue = `${beforeMention}@${user.email}${afterMention}`;
        
        onChange(newValue);
        setShowSuggestions(false);
        
        // Устанавливаем курсор после упоминания
        setTimeout(() => {
            const newCursorPos = mentionStart + 1 + user.email.length;
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
            textareaRef.current?.focus();
        }, 0);

        // Вызываем колбэк для родительского компонента
        if (onMentionSelect) {
            onMentionSelect(user);
        }
    };

    // Закрытие списка при клике вне области
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                textareaRef.current && !textareaRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Скролл к выбранному элементу
    useEffect(() => {
        if (showSuggestions && suggestionsRef.current) {
            const selectedElement = suggestionsRef.current.children[selectedSuggestion];
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedSuggestion, showSuggestions]);

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={className}
                rows={rows}
                {...props}
            />
            
            {showSuggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-card-bg border border-border-color rounded-lg shadow-lg max-h-48 overflow-y-auto"
                    style={{ top: '100%' }}
                >
                    {suggestions.length > 0 ? (
                        suggestions.map((user, index) => (
                            <div
                                key={user.id}
                                className={`px-3 py-2 cursor-pointer flex items-center space-x-3 ${
                                    index === selectedSuggestion
                                        ? 'bg-accent-blue/10 text-accent-blue'
                                        : 'text-text-primary hover:bg-secondary-bg'
                                }`}
                                onClick={() => selectUser(user)}
                            >
                                <div className="w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm font-semibold text-accent-blue">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-text-muted truncate">
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-2 text-sm text-text-muted">
                            Пользователи не найдены
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
