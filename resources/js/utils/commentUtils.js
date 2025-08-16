// Утилиты для работы с комментариями
// Соответствует enum CommentType в бэкенде

export const COMMENT_TYPES = {
    GENERAL: 'general',
    TESTING_FEEDBACK: 'testing_feedback',
    REVIEW_COMMENT: 'review_comment',
    BUG_REPORT: 'bug_report',
    FEATURE_REQUEST: 'feature_request',
};

export const COMMENT_TYPE_LABELS = {
    [COMMENT_TYPES.GENERAL]: 'Общий комментарий',
    [COMMENT_TYPES.TESTING_FEEDBACK]: 'Отзыв тестирования',
    [COMMENT_TYPES.REVIEW_COMMENT]: 'Комментарий ревью',
    [COMMENT_TYPES.BUG_REPORT]: 'Отчет об ошибке',
    [COMMENT_TYPES.FEATURE_REQUEST]: 'Запрос функции',
};

export const COMMENT_TYPE_COLORS = {
    [COMMENT_TYPES.GENERAL]: '#6B7280',
    [COMMENT_TYPES.TESTING_FEEDBACK]: '#8B5CF6',
    [COMMENT_TYPES.REVIEW_COMMENT]: '#F59E0B',
    [COMMENT_TYPES.BUG_REPORT]: '#EF4444',
    [COMMENT_TYPES.FEATURE_REQUEST]: '#10B981',
};

export const COMMENT_TYPE_ICONS = {
    [COMMENT_TYPES.GENERAL]: '💬',
    [COMMENT_TYPES.TESTING_FEEDBACK]: '🧪',
    [COMMENT_TYPES.REVIEW_COMMENT]: '👁️',
    [COMMENT_TYPES.BUG_REPORT]: '🐛',
    [COMMENT_TYPES.FEATURE_REQUEST]: '💡',
};

export const COMMENT_TYPE_CLASSES = {
    [COMMENT_TYPES.GENERAL]: 'comment-general',
    [COMMENT_TYPES.TESTING_FEEDBACK]: 'comment-testing',
    [COMMENT_TYPES.REVIEW_COMMENT]: 'comment-review',
    [COMMENT_TYPES.BUG_REPORT]: 'comment-bug',
    [COMMENT_TYPES.FEATURE_REQUEST]: 'comment-feature',
};

// Шаблоны для специальных типов комментариев
export const COMMENT_TEMPLATES = {
    [COMMENT_TYPES.GENERAL]: `<p></p>`,
    [COMMENT_TYPES.TESTING_FEEDBACK]: `<h3>🧪 Отзыв тестирования</h3>

<p><strong>✅ Что работает:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>❌ Что не работает:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>🔍 Дополнительные замечания:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>📱 Устройство/браузер:</strong></p>
<ul>
<li></li>
</ul>`,
    [COMMENT_TYPES.BUG_REPORT]: `<h3>🐛 Отчет об ошибке</h3>

<p><strong>📋 Описание проблемы:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>🔄 Шаги для воспроизведения:</strong></p>
<ol>
<li></li>
<li></li>
<li></li>
</ol>

<p><strong>📱 Устройство/браузер:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>💻 Ожидаемое поведение:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>❌ Фактическое поведение:</strong></p>
<ul>
<li></li>
</ul>`,
    [COMMENT_TYPES.FEATURE_REQUEST]: `<h3>💡 Запрос функции</h3>

<p><strong>🎯 Описание функции:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>💪 Преимущества:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>🎨 Предлагаемый дизайн:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>📊 Приоритет:</strong></p>
<ul>
<li></li>
</ul>`,
    [COMMENT_TYPES.REVIEW_COMMENT]: `<h3>👁️ Комментарий ревью</h3>

<p><strong>✅ Что понравилось:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>⚠️ Замечания:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>💡 Предложения:</strong></p>
<ul>
<li></li>
</ul>

<p><strong>📝 Общий вывод:</strong></p>
<ul>
<li></li>
</ul>`,
};

// Функции для работы с комментариями
export function getCommentTypeLabel(type) {
    return COMMENT_TYPE_LABELS[type] || type;
}

export function getCommentTypeColor(type) {
    return COMMENT_TYPE_COLORS[type] || '#6B7280';
}

export function getCommentTypeIcon(type) {
    return COMMENT_TYPE_ICONS[type] || '💬';
}

export function getCommentTypeClass(type) {
    return COMMENT_TYPE_CLASSES[type] || 'comment-general';
}

export function isSpecialCommentType(type) {
    return type === COMMENT_TYPES.TESTING_FEEDBACK;
}

export function getCommentTemplate(type) {
    return COMMENT_TEMPLATES[type] || '';
}

// Получить все типы комментариев для селекта
export function getCommentTypeOptions() {
    return Object.entries(COMMENT_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
        icon: COMMENT_TYPE_ICONS[value],
    }));
}

// Получить только основные типы (без специальных)
export function getBasicCommentTypeOptions() {
    return [
        { value: COMMENT_TYPES.GENERAL, label: COMMENT_TYPE_LABELS[COMMENT_TYPES.GENERAL], icon: COMMENT_TYPE_ICONS[COMMENT_TYPES.GENERAL] },
        { value: COMMENT_TYPES.REVIEW_COMMENT, label: COMMENT_TYPE_LABELS[COMMENT_TYPES.REVIEW_COMMENT], icon: COMMENT_TYPE_ICONS[COMMENT_TYPES.REVIEW_COMMENT] },
    ];
}

// Получить специальные типы комментариев
export function getSpecialCommentTypeOptions() {
    return [
        { value: COMMENT_TYPES.TESTING_FEEDBACK, label: COMMENT_TYPE_LABELS[COMMENT_TYPES.TESTING_FEEDBACK], icon: COMMENT_TYPE_ICONS[COMMENT_TYPES.TESTING_FEEDBACK] },
        { value: COMMENT_TYPES.BUG_REPORT, label: COMMENT_TYPE_LABELS[COMMENT_TYPES.BUG_REPORT], icon: COMMENT_TYPE_ICONS[COMMENT_TYPES.BUG_REPORT] },
        { value: COMMENT_TYPES.FEATURE_REQUEST, label: COMMENT_TYPE_LABELS[COMMENT_TYPES.FEATURE_REQUEST], icon: COMMENT_TYPE_ICONS[COMMENT_TYPES.FEATURE_REQUEST] },
    ];
} 