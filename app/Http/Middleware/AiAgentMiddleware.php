<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AiAgentMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Проверяем аутентификацию
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Необходима авторизация'
            ], 401);
        }

        $user = Auth::user();

        // Rate limiting для API запросов
        $key = 'ai_agent_api_' . $user->id;
        if (RateLimiter::tooManyAttempts($key, 20)) { // 20 запросов в минуту для API
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'success' => false,
                'message' => "Слишком много запросов. Попробуйте через {$seconds} секунд."
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Проверяем права доступа (опционально)
        if (config('ai-agent.security.require_email_verification', false) && !$user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Необходимо подтвердить email'
            ], 403);
        }

        return $next($request);
    }
} 