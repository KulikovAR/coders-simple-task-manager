<?php

return [
    'bot_token' => env('TELEGRAM_BOT_TOKEN'),
    'bot_username' => env('TELEGRAM_BOT_USERNAME'),
    // Полный URL до вебхука (не обязательно). Если не задан, используйте маршрут /telegram/webhook/{token}
    'webhook_url' => env('TELEGRAM_WEBHOOK_URL'),
    // Секрет для заголовка X-Telegram-Bot-Api-Secret-Token (для проверки подлинности вебхука)
    'webhook_secret' => env('TELEGRAM_WEBHOOK_SECRET'),
];


