<?php

use App\Models\Subscription;
use App\Models\SubscriptionUserLimit;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Получаем бесплатный тариф
        $freeSubscription = Subscription::where('slug', 'free')->first();
        
        if (!$freeSubscription) {
            // Если бесплатный тариф не найден, создаем его
            $freeSubscription = Subscription::create([
                'name' => 'Бесплатный',
                'slug' => 'free',
                'price' => 0,
                'description' => 'Базовый тариф для небольших команд',
                'max_projects' => 10,
                'max_members_per_project' => 5,
                'storage_limit_gb' => 5,
                'ai_requests_limit' => 5,
                'ai_requests_period' => 'monthly',
                'is_custom' => false,
                'is_active' => true,
            ]);
        }
        
        // Назначаем бесплатный тариф всем пользователям без тарифа
        $users = User::whereNull('subscription_id')->get();
        
        foreach ($users as $user) {
            // Назначаем тариф
            $user->subscription_id = $freeSubscription->id;
            $user->subscription_expires_at = null; // Бесплатный тариф не имеет срока действия
            $user->ai_requests_used = 0;
            $user->ai_requests_reset_at = now()->addMonth();
            $user->save();
            
            // Создаем запись для отслеживания использования хранилища, если её нет
            if (!SubscriptionUserLimit::where('user_id', $user->id)->exists()) {
                SubscriptionUserLimit::create([
                    'user_id' => $user->id,
                    'storage_used_bytes' => 0
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // В методе down не сбрасываем назначенные тарифы, так как это может нарушить работу системы
    }
};
