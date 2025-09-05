<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AiTextOptimizationController extends Controller
{
    private SubscriptionService $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Оптимизировать текст с помощью ИИ
     */
    public function optimizeText(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:5000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Неверные данные запроса',
                'errors' => $validator->errors()
            ], 400);
        }

        $text = $request->input('text');
        $user = $request->user();

        // Проверяем лимиты подписки для использования ИИ
        if (!$this->subscriptionService->canUseAi($user)) {
            $subscriptionInfo = $this->subscriptionService->getUserSubscriptionInfo($user);
            
            return response()->json([
                'success' => false,
                'message' => 'Исчерпан лимит запросов к ИИ',
                'subscription_info' => $subscriptionInfo,
                'error_type' => 'ai_limit_exceeded'
            ], 429);
        }

        try {
            // Промпт для оптимизации текста с поддержкой HTML форматирования
            $prompt = "Оптимизируй следующий текст: исправь грамматические ошибки, улучши стиль написания, сделай его более профессиональным и читаемым. Используй HTML теги для форматирования: <p> для абзацев, <strong> для важного текста, <em> для выделения, <ul><li> для списков, <h3> для подзаголовков. Верни только оптимизированный текст в HTML формате без дополнительных комментариев:\n\n{$text}";

            // Отправляем запрос в том же формате, что и FlexibleAiAgentService
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('services.ai.token'),
                    'Content-Type' => 'application/json',
                ])
                ->post(config('services.ai.url'), [
                    'model' => config('services.ai.model', 'gpt-3.5-turbo'),
                    'input' => $prompt,
                    'session_id' => 'text-optimization-' . $request->user()->id,
                    'new_session' => true,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Используем тот же метод извлечения контента, что и в FlexibleAiAgentService
                $optimizedText = $this->extractContent($data);

                if (empty($optimizedText)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'ИИ не вернул оптимизированный текст'
                    ], 500);
                }

                // Очищаем ответ от возможных префиксов
                $optimizedText = $this->cleanAiResponse($optimizedText);

                // Обрабатываем использование ИИ (увеличиваем счетчик)
                $this->subscriptionService->processAiUsage($user);

                return response()->json([
                    'success' => true,
                    'original_text' => $text,
                    'optimized_text' => $optimizedText
                ]);
            } else {
                Log::error('AI Service Error', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка при обращении к ИИ сервису'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('AI Text Optimization Error', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'text_length' => strlen($text)
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Произошла ошибка при оптимизации текста'
            ], 500);
        }
    }

    /**
     * Извлечь контент из ответа ИИ (копия из FlexibleAiAgentService)
     */
    private function extractContent(array $aiResponse): string
    {
        // Проверяем формат OpenAI API
        if (isset($aiResponse['choices']) && is_array($aiResponse['choices'])) {
            return $aiResponse['choices'][0]['message']['content'] ?? '';
        }

        // Fallback для других форматов
        return $aiResponse['output'] ?? $aiResponse['response'] ?? '';
    }

    /**
     * Очистить ответ ИИ от лишних префиксов и форматирования
     */
    private function cleanAiResponse(string $response): string
    {
        $text = trim($response);
        
        // Убираем кавычки если текст обернут в них
        if (preg_match('/^["\'](.*)["\']$/s', $text, $matches)) {
            $text = $matches[1];
        }

        // Убираем возможные префиксы
        $text = preg_replace('/^(оптимизированный текст|результат|ответ|вот оптимизированный текст):\s*/i', '', $text);
        
        return trim($text);
    }
}
