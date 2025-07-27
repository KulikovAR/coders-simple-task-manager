<?php

use App\Http\Controllers\AiAgentController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
});

// Страница с информацией об ИИ-ассистенте
Route::get('/ai-features', function () {
    return Inertia::render('AiAgent/Features');
})->name('ai-features');

// Страница FAQ
Route::get('/faq', function () {
    return Inertia::render('Faq');
})->name('faq');

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Уведомления
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread', [NotificationController::class, 'getUnread'])->name('notifications.unread');
    Route::post('/notifications/{notification}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('/notifications/read', [NotificationController::class, 'destroyRead'])->name('notifications.destroy-read');

    // Проекты
    Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [App\Http\Controllers\ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [App\Http\Controllers\ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');
    Route::get('/projects/{project}/board', [App\Http\Controllers\ProjectController::class, 'board'])->name('projects.board');
    Route::get('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'getMembers'])->name('projects.members');
    Route::post('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'removeMember'])->name('projects.members.remove');

    // Спринты
    Route::get('/projects/{project}/sprints', [App\Http\Controllers\SprintController::class, 'index'])->name('sprints.index');
    Route::get('/projects/{project}/sprints/create', [App\Http\Controllers\SprintController::class, 'create'])->name('sprints.create');
    Route::post('/projects/{project}/sprints', [App\Http\Controllers\SprintController::class, 'store'])->name('sprints.store');
    Route::get('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'show'])->name('sprints.show');
    Route::get('/projects/{project}/sprints/{sprint}/edit', [App\Http\Controllers\SprintController::class, 'edit'])->name('sprints.edit');
    Route::put('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'update'])->name('sprints.update');
    Route::delete('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'destroy'])->name('sprints.destroy');

    // Задачи
    Route::get('/tasks', [App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/create', [App\Http\Controllers\TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tasks', [App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tasks/{task}/edit', [App\Http\Controllers\TaskController::class, 'edit'])->name('tasks.edit');
    Route::put('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::put('/tasks/{task}/status', [App\Http\Controllers\TaskController::class, 'updateStatus'])->name('tasks.status.update');
    Route::put('/tasks/{task}/priority', [App\Http\Controllers\TaskController::class, 'updatePriority'])->name('tasks.priority.update');
    Route::get('/projects/{project}/sprints-for-tasks', [App\Http\Controllers\TaskController::class, 'getProjectSprints'])->name('tasks.project.sprints');

    // Комментарии к задачам
    Route::get('/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'index'])->name('tasks.comments.index');
    Route::post('/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::get('/comments/{comment}/edit', [App\Http\Controllers\TaskCommentController::class, 'edit'])->name('comments.edit');
    Route::put('/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'destroy'])->name('comments.destroy');

    // ИИ-агент
    Route::get('/ai-agent', [App\Http\Controllers\AiAgentController::class, 'index'])->name('ai-agent.index');
});

// ИИ-агент API (без CSRF)
Route::middleware(['auth', 'ai.agent'])->group(function () {
    Route::post('/ai-agent/process', [App\Http\Controllers\AiAgentController::class, 'processRequest'])
        ->name('ai-agent.process');
    Route::get('/ai-agent/commands', [App\Http\Controllers\AiAgentController::class, 'getCommands'])
        ->name('ai-agent.commands');
    
    // История диалогов ИИ-агента
    Route::get('/ai-agent/conversations', [App\Http\Controllers\AiAgentController::class, 'getConversations'])
        ->name('ai-agent.conversations');
    Route::get('/ai-agent/conversations/{conversationId}/messages', [App\Http\Controllers\AiAgentController::class, 'getConversationMessages'])
        ->name('ai-agent.conversation.messages');
    Route::post('/ai-agent/conversations', [App\Http\Controllers\AiAgentController::class, 'createConversation'])
        ->name('ai-agent.conversations.create');
    Route::delete('/ai-agent/conversations/{conversationId}', [App\Http\Controllers\AiAgentController::class, 'deleteConversation'])
        ->name('ai-agent.conversations.delete');
    Route::get('/ai-agent/stats', [App\Http\Controllers\AiAgentController::class, 'getStats'])
        ->name('ai-agent.stats');
});

// --- Оплата подписки ---
Route::middleware(['auth'])->group(function () {
    Route::post('/payment/start', [\App\Http\Controllers\PaymentController::class, 'start'])->name('payment.start');
});
Route::post('/payment/webhook', [\App\Http\Controllers\PaymentController::class, 'webhook'])->name('payment.webhook');

require __DIR__.'/auth.php';
