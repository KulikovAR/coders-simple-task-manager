<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SprintController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\WebhookController;
use App\Http\Resources\ApiResponse;
use App\Http\Controllers\TelegramController;
use App\Http\Controllers\AiTextOptimizationController;
use App\Http\Controllers\Api\DaDataController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth')->get('/user', function (Request $request) {
    return $request->user();
});

// API роуты для проектов
Route::middleware('auth')->group(function () {
    Route::apiResource('projects', ProjectController::class)->names([
        'index' => 'api.projects.index',
        'store' => 'api.projects.store',
        'show' => 'api.projects.show',
        'update' => 'api.projects.update',
        'destroy' => 'api.projects.destroy',
    ]);
    Route::post('projects/{project}/members', [ProjectController::class, 'addMember'])->name('api.projects.members.add');
    Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])->name('api.projects.members.remove');
    
    // API роуты для спринтов
    Route::apiResource('projects.sprints', SprintController::class)->names([
        'index' => 'api.projects.sprints.index',
        'store' => 'api.projects.sprints.store',
        'show' => 'api.projects.sprints.show',
        'update' => 'api.projects.sprints.update',
        'destroy' => 'api.projects.sprints.destroy',
    ]);
    
    // API роуты для задач
    Route::apiResource('projects.tasks', TaskController::class)->names([
        'index' => 'api.projects.tasks.index',
        'store' => 'api.projects.tasks.store',
        'show' => 'api.projects.tasks.show',
        'update' => 'api.projects.tasks.update',
        'destroy' => 'api.projects.tasks.destroy',
    ]);
    Route::put('tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('api.tasks.status.update');
    Route::put('tasks/{task}/assign', [TaskController::class, 'assign'])->name('api.tasks.assign');
    Route::get('projects/{project}/board', [TaskController::class, 'board'])->name('api.projects.board');
    
    // API роуты для комментариев
    Route::get('projects/{project}/tasks/{task}/comments/special', [CommentController::class, 'specialComments'])->name('api.projects.tasks.comments.special');
    Route::apiResource('projects.tasks.comments', CommentController::class)->names([
        'index' => 'api.projects.tasks.comments.index',
        'store' => 'api.projects.tasks.comments.store',
        'show' => 'api.projects.tasks.comments.show',
        'update' => 'api.projects.tasks.comments.update',
        'destroy' => 'api.projects.tasks.comments.destroy',
    ]);
    
    // API роуты для webhook'ов
    Route::get('projects/{project}/webhooks', [WebhookController::class, 'apiIndex'])->name('api.projects.webhooks.index');
    Route::post('projects/{project}/webhooks', [WebhookController::class, 'apiStore'])->name('api.projects.webhooks.store');
    Route::get('projects/{project}/webhooks/{webhook}', [WebhookController::class, 'show'])->name('api.projects.webhooks.show');
    Route::put('projects/{project}/webhooks/{webhook}', [WebhookController::class, 'apiUpdate'])->name('api.projects.webhooks.update');
    Route::delete('projects/{project}/webhooks/{webhook}', [WebhookController::class, 'apiDestroy'])->name('api.projects.webhooks.destroy');
    Route::post('projects/{project}/webhooks/{webhook}/test', [WebhookController::class, 'apiTest'])->name('api.projects.webhooks.test');
    Route::get('projects/{project}/webhooks/{webhook}/logs', [WebhookController::class, 'logs'])->name('api.projects.webhooks.logs');
    Route::post('projects/{project}/webhooks/{webhook}/toggle', [WebhookController::class, 'apiToggle'])->name('api.projects.webhooks.toggle');
    Route::get('webhooks/events', [WebhookController::class, 'events'])->name('api.webhooks.events');
});

// Публичные API роуты
Route::get('/health', function () {
    return response()->json(
        ApiResponse::success(null, 'CSTM API is running')
    );
}); 

// Telegram bot webhook (публичный, без CSRF). Проверка по заголовку X-Telegram-Bot-Api-Secret-Token
Route::post('/telegram/webhook', [TelegramController::class, 'webhook'])->name('telegram.webhook');

// DaData API роуты (публичные)
Route::get('/dadata/countries/popular', [DaDataController::class, 'getPopularCountries'])->name('api.dadata.countries.popular');
Route::post('/dadata/countries/search', [DaDataController::class, 'searchCountries'])->name('api.dadata.countries.search');