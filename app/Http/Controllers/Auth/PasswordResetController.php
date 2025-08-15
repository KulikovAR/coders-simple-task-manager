<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class PasswordResetController extends Controller
{
    /**
     * Показать форму запроса сброса пароля
     */
    public function showForgotPasswordForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    /**
     * Отправить ссылку для сброса пароля
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return back()->with(['status' => trans('auth.passwords.sent')]);
        } else {
            return back()->withErrors(['email' => trans('auth.passwords.' . $status)]);
        }
    }

    /**
     * Показать форму сброса пароля
     */
    public function showResetForm(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->email,
        ]);
    }

    /**
     * Сбросить пароль
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return redirect()->route('login')->with('status', trans('auth.passwords.reset'));
        } else {
            return back()->withErrors(['email' => [trans('auth.passwords.' . $status)]]);
        }
    }
}
