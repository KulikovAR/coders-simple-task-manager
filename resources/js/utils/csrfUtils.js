/**
 * Утилиты для работы с CSRF токенами
 */

/**
 * Получает актуальный CSRF токен из meta тега
 * @returns {string|null} CSRF токен или null если не найден
 */
export function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.content : null;
}

/**
 * Проверяет, действителен ли CSRF токен
 * @returns {boolean} true если токен существует
 */
export function isCsrfTokenValid() {
    const token = getCsrfToken();
    return token && token.length > 0;
}

/**
 * Обновляет CSRF токен, делая запрос к серверу
 * @returns {Promise<string|null>} Новый токен или null если не удалось получить
 */
export async function refreshCsrfToken() {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                // Обновляем meta тег
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.content = data.token;
                }
                return data.token;
            }
        }
    } catch (error) {
        console.error('Ошибка при обновлении CSRF токена:', error);
    }
    
    return null;
}

/**
 * Создает заголовки для fetch запроса с CSRF токеном
 * @param {Object} additionalHeaders - Дополнительные заголовки
 * @returns {Object} Объект с заголовками
 */
export function createCsrfHeaders(additionalHeaders = {}) {
    const csrfToken = getCsrfToken();
    
    if (!csrfToken) {
        console.error('CSRF токен не найден');
        return null;
    }

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrfToken,
        ...additionalHeaders,
    };
}

/**
 * Обрабатывает ошибку CSRF токена
 * @param {Response} response - Ответ сервера
 * @param {Function} onCsrfError - Callback для обработки ошибки CSRF
 * @returns {boolean} true если ошибка была обработана
 */
export function handleCsrfError(response, onCsrfError = null) {
    if (response.status === 419) {
        console.log('CSRF токен истек');
        
        if (onCsrfError) {
            onCsrfError();
        } else {
            // По умолчанию обновляем страницу
            alert('Сессия истекла. Пожалуйста, обновите страницу и попробуйте снова.');
            window.location.reload();
        }
        
        return true;
    }
    
    return false;
}

/**
 * Безопасный fetch с автоматической обработкой CSRF
 * @param {string} url - URL для запроса
 * @param {Object} options - Опции fetch
 * @param {Function} onCsrfError - Callback для обработки ошибки CSRF
 * @returns {Promise<Response>} Ответ сервера
 */
export async function safeFetch(url, options = {}, onCsrfError = null) {
    const csrfToken = getCsrfToken();
    
    if (!csrfToken) {
        throw new Error('CSRF токен не найден');
    }

    const fetchOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': csrfToken,
            ...options.headers,
        },
        credentials: 'same-origin',
    };

    const response = await fetch(url, fetchOptions);
    
    // Проверяем ошибку CSRF
    if (handleCsrfError(response, onCsrfError)) {
        return response;
    }
    
    return response;
}
