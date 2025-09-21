<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    /**
     * Перенаправление на страницу аутентификации Google.
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Обработка ответа от Google после аутентификации.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            // Проверяем, существует ли пользователь с таким google_id
            $user = User::where('google_id', $googleUser->getId())->first();
            
            // Если нет, проверяем по email
            if (!$user) {
                $user = User::where('email', $googleUser->getEmail())->first();
                
                // Если пользователь с таким email существует, обновляем его google_id
                if ($user) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        // Обновляем аватар, если он есть
                        'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                    ]);
                } else {
                    // Создаем нового пользователя
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Генерируем случайный пароль
                        'email_notifications' => true,
                    ]);
                }
            }
            
            // Авторизуем пользователя
            Auth::login($user);
            
            // Перенаправляем на главную страницу
            return redirect()->route('dashboard');
            
        } catch (Exception $e) {
            // В случае ошибки перенаправляем на страницу входа с сообщением об ошибке
            return redirect()->route('login')
                ->with('error', 'Произошла ошибка при авторизации через Google. Пожалуйста, попробуйте снова.');
        }
    }
}
