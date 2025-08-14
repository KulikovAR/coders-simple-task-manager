<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TelegramController extends Controller
{
    public function webhook(Request $request): Response
    {
        $secret = (string) config('telegram.webhook_secret');
        if ($secret !== '') {
            $incoming = (string) $request->header('X-Telegram-Bot-Api-Secret-Token', '');
            if (!hash_equals($secret, $incoming)) {
                return response()->noContent(403);
            }
        }

        $update = $request->all();

        try {
            $message = $update['message'] ?? $update['edited_message'] ?? null;
            if (!$message) {
                return response()->noContent();
            }

            $chat = $message['chat'] ?? [];
            $chatId = $chat['id'] ?? null;
            $text = trim((string) ($message['text'] ?? ''));

            /** @var TelegramService $tg */
            $tg = app(TelegramService::class);

            if (!$chatId) {
                return response()->noContent();
            }

            // Приветственное сообщение с chatId
            if (in_array($text, ['/start', 'start', 'Start'], true)) {
                $tg->sendMessage($chatId, "Ваш chatId: <b>{$chatId}</b>\n\nПерейдите в профиль на сайте и вставьте этот chatId в поле Telegram.");
                return response()->noContent();
            }

            // Обработка команды /id
            if (in_array($text, ['/id', 'id', 'ID'], true)) {
                $tg->sendMessage($chatId, "Ваш chatId: <b>{$chatId}</b>");
                return response()->noContent();
            }

            // Если пользователь прислал email — попробуем связать автоматически
            if (filter_var($text, FILTER_VALIDATE_EMAIL)) {
                $user = User::where('email', $text)->first();
                if ($user) {
                    $user->telegram_chat_id = (string) $chatId;
                    $user->save();
                    $tg->sendMessage($chatId, 'Telegram успешно подключен к вашему аккаунту.');
                } else {
                    $tg->sendMessage($chatId, 'Пользователь с таким email не найден. Введите /id, чтобы получить chatId и вставьте его в профиль.');
                }
            } else {
                // Эхо-подсказка
                $tg->sendMessage($chatId, 'Я бот-уведомлятор. Отправьте /start, /id, либо ваш email для автопривязки.');
            }

            return response()->noContent();
        } catch (\Throwable $e) {
            Log::error('Telegram webhook error', ['error' => $e->getMessage()]);
            return response()->noContent();
        }
    }
}


