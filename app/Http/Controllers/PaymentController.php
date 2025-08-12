<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Payment;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function start(Request $request)
    {
        $user = Auth::user();
        $amount = 2000.00;
        $payment = Payment::create([
            'user_id' => $user->id,
            'amount' => $amount,
            'status' => 'pending',
        ]);

        $yookassaData = [
            'amount' => [
                'value' => number_format($amount, 2, '.', ''),
                'currency' => 'RUB',
            ],
            'confirmation' => [
                'type' => 'redirect',
                'return_url' => url('/dashboard'),
            ],
            'capture' => true,
            'description' => 'Подписка на ИИ-ассистента',
            'metadata' => [
                'payment_id' => $payment->id,
                'user_id' => $user->id,
            ],
        ];

        $response = Http::withBasicAuth(env('YOOKASSA_SHOP_ID'), env('YOOKASSA_SECRET_KEY'))
            ->post('https://api.yookassa.ru/v3/payments', $yookassaData);

        if ($response->failed()) {
            $payment->status = 'failed';
            $payment->save();
            return response()->json(['success' => false, 'message' => 'Ошибка создания платежа'], 500);
        }

        $data = $response->json();
        $payment->payment_id = $data['id'] ?? null;
        $payment->data = $data;
        $payment->save();

        return response()->json([
            'success' => true,
            'confirmation_url' => $data['confirmation']['confirmation_url'] ?? null,
        ]);
    }

    public function webhook(Request $request)
    {
        $event = $request->input('event');
        $object = $request->input('object');
        if (!$object || !isset($object['id'])) {
            return response()->json(['success' => false, 'message' => 'Некорректные данные'], 400);
        }
        $payment = Payment::where('payment_id', $object['id'])->first();
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Платеж не найден'], 404);
        }
        $payment->status = $object['status'] ?? 'unknown';
        $payment->data = $object;
        if ($object['status'] === 'succeeded') {
            $payment->expires_at = now()->addMonth();
            $payment->user->update([
                'paid' => true,
                'expires_at' => $payment->expires_at,
            ]);
        }
        $payment->save();
        return response()->json(['success' => true]);
    }
}
