import { useState, useRef } from 'react';
import ValidationError from './ValidationError';

export default function KeywordsSection({ keywordGroups = [], onKeywordGroupsChange, errors }) {
    const [isDragOver, setIsDragOver] = useState({});
    const fileInputRefs = useRef({});

    const parseKeywordsFromFile = (content, filename) => {
        const lines = content.split('\n');
        const keywordsList = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                if (filename.toLowerCase().endsWith('.csv')) {
                    const columns = trimmedLine.split(',');
                    const keyword = columns[0].trim().replace(/"/g, '');
                    if (keyword) {
                        keywordsList.push(keyword);
                    }
                } else {
                    keywordsList.push(trimmedLine);
                }
            }
        }

        return keywordsList.join('\n');
    };

    const handleFileUpload = (file, groupIndex) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const parsedKeywords = parseKeywordsFromFile(content, file.name);

            const updatedGroups = [...keywordGroups];
            const currentKeywords = updatedGroups[groupIndex]?.keywords || '';
            updatedGroups[groupIndex].keywords = currentKeywords
                ? `${currentKeywords}\n${parsedKeywords}`
                : parsedKeywords;

            onKeywordGroupsChange?.(updatedGroups);
        };

        reader.readAsText(file, 'UTF-8');
    };

    const handleFileSelect = (e, groupIndex) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file, groupIndex);
        }
    };

    const handleDrop = (e, groupIndex) => {
        e.preventDefault();
        setIsDragOver(prev => ({ ...prev, [groupIndex]: false }));

        const files = Array.from(e.dataTransfer.files);
        const file = files.find(f =>
            f.name.toLowerCase().endsWith('.csv') ||
            f.name.toLowerCase().endsWith('.txt')
        );

        if (file) {
            handleFileUpload(file, groupIndex);
        }
    };

    const handleDragOver = (e, groupIndex) => {
        e.preventDefault();
        setIsDragOver(prev => ({ ...prev, [groupIndex]: true }));
    };

    const handleDragLeave = (e, groupIndex) => {
        e.preventDefault();
        setIsDragOver(prev => ({ ...prev, [groupIndex]: false }));
    };

    const openFileDialog = (groupIndex) => {
        fileInputRefs.current[groupIndex]?.click();
    };

    const addGroup = () => {
        const updatedGroups = [...keywordGroups, { name: '', keywords: '' }];
        onKeywordGroupsChange?.(updatedGroups);
    };

    const removeGroup = (index) => {
        const updatedGroups = keywordGroups.filter((_, i) => i !== index);
        onKeywordGroupsChange?.(updatedGroups);
    };

    const updateGroupName = (index, name) => {
        const updatedGroups = [...keywordGroups];
        updatedGroups[index].name = name;
        onKeywordGroupsChange?.(updatedGroups);
    };

    const updateGroupKeywords = (index, keywords) => {
        const updatedGroups = [...keywordGroups];
        updatedGroups[index].keywords = keywords;
        onKeywordGroupsChange?.(updatedGroups);
    };

    if (keywordGroups.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-text-primary">
                        Группы ключевых слов
                    </label>
                    <button
                        type="button"
                        onClick={addGroup}
                        className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Добавить группу
                    </button>
                </div>
                <div className="text-center py-8 border-2 border-dashed border-border-color rounded-lg">
                    <p className="text-text-muted mb-4">Нет добавленных групп</p>
                    <button
                        type="button"
                        onClick={addGroup}
                        className="bg-accent-blue/10 text-accent-blue px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition-colors text-sm font-medium"
                    >
                        Добавить первую группу
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-text-primary">
                    Группы ключевых слов
                </label>
                <button
                    type="button"
                    onClick={addGroup}
                    className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors text-sm font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Добавить группу
                </button>
            </div>

            {keywordGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="border border-border-color rounded-lg p-4 space-y-4 bg-secondary-bg/30">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-text-primary">
                            Группа {groupIndex + 1}
                        </h4>
                        {keywordGroups.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeGroup(groupIndex)}
                                className="text-accent-red hover:text-accent-red/80 transition-colors p-1"
                                title="Удалить группу"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Название группы
                        </label>
                        <input
                            type="text"
                            value={group.name || ''}
                            onChange={(e) => updateGroupName(groupIndex, e.target.value)}
                            placeholder="Введите название группы (опционально)"
                            className="w-full px-4 py-2 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple/20 focus:border-accent-purple transition-colors"
                        />
                        <p className="text-xs text-text-muted mt-2">
                            Если группа не существует, она будет создана автоматически
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Ключевые слова и фразы <span className="text-accent-red">*</span>
                        </label>

                        <div className="mb-3">
                            <button
                                type="button"
                                onClick={() => openFileDialog(groupIndex)}
                                className="bg-accent-blue/10 text-accent-blue px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Загрузить из файла (CSV/TXT)
                            </button>
                            <input
                                ref={el => fileInputRefs.current[groupIndex] = el}
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) => handleFileSelect(e, groupIndex)}
                                className="hidden"
                            />
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-lg p-4 mb-3 transition-colors ${
                                isDragOver[groupIndex]
                                    ? 'border-accent-blue bg-accent-blue/5'
                                    : 'border-border-color hover:border-accent-blue/50'
                            }`}
                            onDrop={(e) => handleDrop(e, groupIndex)}
                            onDragOver={(e) => handleDragOver(e, groupIndex)}
                            onDragLeave={(e) => handleDragLeave(e, groupIndex)}
                        >
                            <div className="text-center text-text-muted text-sm">
                                <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Перетащите CSV или TXT файл сюда
                            </div>
                        </div>

                        <textarea
                            value={group.keywords || ''}
                            onChange={(e) => updateGroupKeywords(groupIndex, e.target.value)}
                            className={`w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple/20 focus:border-accent-purple transition-colors resize-none ${
                                errors?.keywords ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/20' : ''
                            }`}
                            rows="6"
                            placeholder="Введите ключевые слова и фразы, каждое с новой строки:&#10;купить телефон&#10;лучший смартфон&#10;мобильные телефоны"
                            required
                        />
                        <p className="text-xs text-text-muted mt-2">
                            Каждое ключевое слово или фразу вводите с новой строки. Поддерживаются файлы CSV и TXT
                        </p>
                    </div>
                </div>
            ))}

            <ValidationError message={errors?.keywords} />
        </div>
    );
}
