export default function KeywordsSection({ keywords, onKeywordsChange, errors }) {
    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Поисковые запросы
            </h4>
            
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Ключевые слова и фразы
                </label>
                <textarea
                    value={keywords}
                    onChange={(e) => onKeywordsChange(e.target.value)}
                    className="w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-purple/20 focus:border-accent-purple transition-colors resize-none"
                    rows="6"
                    placeholder="Введите ключевые слова и фразы, каждое с новой строки:&#10;купить телефон&#10;лучший смартфон&#10;мобильные телефоны"
                    required
                />
                <p className="text-xs text-text-muted mt-2">
                    Каждое ключевое слово или фразу вводите с новой строки
                </p>
                {errors?.keywords && <p className="text-accent-red text-sm mt-1">{errors.keywords}</p>}
            </div>
        </div>
    );
}
