/**
 * Константы для названий тарифных планов
 */
export const SUBSCRIPTION_PLANS = {
    FREE: 'Бесплатный',
    TEAM: 'Команда',
    TEAM_AI: 'Команда + ИИ',
    EXCLUSIVE: 'Эксклюзив'
};

/**
 * Константы для периодов обновления лимитов ИИ
 */
export const AI_REQUEST_PERIODS = {
    DAILY: 'daily',
    MONTHLY: 'monthly'
};

/**
 * Лимиты запросов к ИИ по тарифам
 */
export const AI_REQUEST_LIMITS = {
    [SUBSCRIPTION_PLANS.FREE]: 5,
    [SUBSCRIPTION_PLANS.TEAM]: 5,
    [SUBSCRIPTION_PLANS.TEAM_AI]: 50,
    [SUBSCRIPTION_PLANS.EXCLUSIVE]: 100
};

/**
 * Периоды обновления лимитов ИИ по тарифам
 */
export const AI_REQUEST_PERIODS_BY_PLAN = {
    [SUBSCRIPTION_PLANS.FREE]: AI_REQUEST_PERIODS.MONTHLY,
    [SUBSCRIPTION_PLANS.TEAM]: AI_REQUEST_PERIODS.MONTHLY,
    [SUBSCRIPTION_PLANS.TEAM_AI]: AI_REQUEST_PERIODS.DAILY,
    [SUBSCRIPTION_PLANS.EXCLUSIVE]: AI_REQUEST_PERIODS.DAILY
};
