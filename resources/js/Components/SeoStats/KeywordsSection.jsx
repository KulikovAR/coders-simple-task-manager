import { useState, useRef } from 'react';
import ValidationError from './ValidationError';

export default function KeywordsSection({ keywords, onKeywordsChange, errors }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const parseKeywordsFromFile = (content, filename) => {
        const lines = content.split('\n');
        const keywordsList = [];

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine) {
                // Если это CSV файл, берем только первую колонку
                if (filename.toLowerCase().endsWith('.csv')) {
                    const columns = trimmedLine.split(',');
                    const keyword = columns[0].trim().replace(/"/g, '');
                    if (keyword) {
                        keywordsList.push(keyword);
                    }
                } else {
                    // Для TXT файлов просто добавляем строку
                    keywordsList.push(trimmedLine);
                }
            }
        }

        return keywordsList.join('\n');
    };

    const handleFileUpload = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const parsedKeywords = parseKeywordsFromFile(content, file.name);

            // Добавляем к существующим ключевым словам
            const currentKeywords = keywords || '';
            const newKeywords = currentKeywords
                ? `${currentKeywords}\n${parsedKeywords}`
                : parsedKeywords;

            onKeywordsChange(newKeywords);
        };

        reader.readAsText(file, 'UTF-8');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        const file = files.find(f =>
            f.name.toLowerCase().endsWith('.csv') ||
            f.name.toLowerCase().endsWith('.txt')
        );

        if (file) {
            handleFileUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Ключевые слова и фразы <span className="text-accent-red">*</span>
                </label>

                {/* Кнопка загрузки файла */}
                <div className="mb-3">
                    <button
                        type="button"
                        onClick={openFileDialog}
                        className="bg-accent-blue/10 text-accent-blue px-4 py-2 rounded-lg hover:bg-accent-blue/20 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Загрузить из файла (CSV/TXT)
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Область для перетаскивания файлов */}
                <div
                    className={`border-2 border-dashed rounded-lg p-4 mb-3 transition-colors ${
                        isDragOver
                            ? 'border-accent-blue bg-accent-blue/5'
                            : 'border-border-color hover:border-accent-blue/50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div className="text-center text-text-muted text-sm">
                        <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Перетащите CSV или TXT файл сюда
                    </div>
                </div>

                <textarea
                    value={keywords}
                    onChange={(e) => onKeywordsChange(e.target.value)}
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
                <ValidationError message={errors?.keywords} />
            </div>
        </div>
    );
}
