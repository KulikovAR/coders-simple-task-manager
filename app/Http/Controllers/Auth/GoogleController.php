<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
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
     * @return RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $user = User::where('google_id', $googleUser->getId())->first();

            if ($user) {
                if (!$user->hasVerifiedEmail()) {
                    $user->update(
                        [
                            'email_verified_at' => now(),
                            'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                        ]);
                }
            } else {
                $user = User::where('email', $googleUser->getEmail())->first();

                if ($user) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                        'email_verified_at' => now(),
                    ]);
                } else {
                    $user = User::create([
                        'name' => $googleUser->getName(),
                        'email' => $googleUser->getEmail(),
                        'google_id' => $googleUser->getId(),
                        'avatar' => $googleUser->getAvatar(),
                        'password' => bcrypt(Str::random(16)),
                        'email_notifications' => true,
                        'email_verified_at' => now(),
                    ]);
                }
            }

            Auth::login($user);


            return redirect()->route('dashboard');
        } catch (Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Произошла ошибка при авторизации через Google. Пожалуйста, попробуйте снова.');
        }
    }
}
