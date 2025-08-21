import { useState, useRef, useEffect } from 'react';

export default function TagsInput({ value = '', onChange, placeholder = 'Введите теги...', className = '' }) {
    const [tags, setTags] = useState(value.split(' ').filter(Boolean));
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        // Обновляем теги при изменении внешнего значения
        const newTags = value.split(' ').filter(Boolean);
        if (JSON.stringify(newTags) !== JSON.stringify(tags)) {
            setTags(newTags);
        }
    }, [value]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        // Если введен пробел, добавляем новый тег
        if (newValue.endsWith(' ')) {
            const tag = newValue.trim();
            if (tag && !tags.includes(tag)) {
                const newTags = [...tags, tag];
                setTags(newTags);
                onChange(newTags.join(' '));
            }
            setInputValue('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Удаляем последний тег при нажатии Backspace
            const newTags = tags.slice(0, -1);
            setTags(newTags);
            onChange(newTags.join(' '));
        } else if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const tag = inputValue.trim();
            if (!tags.includes(tag)) {
                const newTags = [...tags, tag];
                setTags(newTags);
                onChange(newTags.join(' '));
            }
            setInputValue('');
        }
    };

    const removeTag = (indexToRemove) => {
        const newTags = tags.filter((_, index) => index !== indexToRemove);
        setTags(newTags);
        onChange(newTags.join(' '));
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div
            ref={containerRef}
            onClick={handleContainerClick}
            className={`form-input flex flex-wrap gap-2 min-h-[2.5rem] cursor-text ${className}`}
        >
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-accent-blue/10 text-accent-blue border border-accent-blue/20"
                >
                    #{tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            removeTag(index);
                        }}
                        className="ml-1 text-accent-blue/60 hover:text-accent-blue"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ''}
                className="flex-1 min-w-[100px] bg-transparent border-none p-0 focus:ring-0 text-sm"
            />
        </div>
    );
}
