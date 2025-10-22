<?php

use App\Http\Controllers\AiAgentController;
use App\Http\Controllers\AiTextOptimizationController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GanttController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SprintController;
use App\Http\Controllers\TaskCommentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TaskStatusController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TelegramController;

Route::get('/', function () {
    return Inertia::render('Landing', [
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

// API документация (заглушка для футера)
Route::get('/api-docs', function () {
    return Inertia::render('ApiDocs');
})->name('api-docs');

    // Демо-страница RichTextEditor
    Route::get('/demo/rich-editor', function () {
        return Inertia::render('Demo/RichEditorDemo');
    })->name('demo.rich-editor');

    // Демо-страница ИИ RichTextEditor
    Route::get('/demo/ai-rich-editor', function () {
        return Inertia::render('Demo/AiRichEditorDemo');
    })->name('demo.ai-rich-editor');

    // Демо-страница загрузки файлов
    Route::get('/demo/file-upload', function () {
        return Inertia::render('Demo/FileUploadDemo');
    })->name('demo.file-upload');

    // Тестовая страница FileExtension
    Route::get('/demo/file-extension-test', function () {
        return Inertia::render('Demo/FileExtensionTest');
    })->name('demo.file-extension-test');

    // Тестовая страница загрузки файлов
    Route::get('/demo/file-upload-test', function () {
        return Inertia::render('Demo/FileUploadTest');
    })->name('demo.file-upload-test');

    // Загрузка файлов для RichTextEditor
    Route::middleware('auth')->group(function () {
        Route::post('/file-upload', [App\Http\Controllers\FileUploadController::class, 'store'])->name('file-upload.store');
        Route::get('/file-upload/{attachment}/download', [App\Http\Controllers\FileUploadController::class, 'download'])->name('file-upload.download');
        Route::get('/file-upload/{attachment}/view', [App\Http\Controllers\FileUploadController::class, 'view'])->name('file-upload.view');
        Route::delete('/file-upload/{attachment}', [App\Http\Controllers\FileUploadController::class, 'destroy'])->name('file-upload.destroy');
        Route::get('/file-upload/user-stats', [App\Http\Controllers\FileUploadController::class, 'userStats'])->name('file-upload.user-stats');
    });

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
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
    Route::get('/projects/{project}/board/task/{code}', [App\Http\Controllers\TaskController::class, 'showInBoardModal'])->name('projects.board.task');
    Route::get('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'getMembers'])->name('projects.members');
    Route::post('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'addMember'])->name('projects.members.add');
    Route::delete('/projects/{project}/members', [App\Http\Controllers\ProjectController::class, 'removeMember'])->name('projects.members.remove');

    // Гантт диаграммы
    Route::get('/projects/{project}/gantt', [GanttController::class, 'show'])->name('projects.gantt');
    Route::put('/tasks/{task}/gantt', [GanttController::class, 'updateTask'])->name('tasks.gantt.update');
    Route::post('/gantt/dependencies', [GanttController::class, 'createDependency'])->name('gantt.dependencies.create');
    Route::delete('/gantt/dependencies/{dependency}', [GanttController::class, 'deleteDependency'])->name('gantt.dependencies.delete');
    Route::post('/projects/{project}/gantt/calculate-dates', [GanttController::class, 'calculateDates'])->name('projects.gantt.calculate-dates');

    // Спринты
    Route::get('/projects/{project}/sprints', [App\Http\Controllers\SprintController::class, 'index'])->name('sprints.index');
    Route::get('/projects/{project}/sprints/create', [App\Http\Controllers\SprintController::class, 'create'])->name('sprints.create');
    Route::post('/projects/{project}/sprints', [App\Http\Controllers\SprintController::class, 'store'])->name('sprints.store');
    Route::get('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'show'])->name('sprints.show');
    Route::get('/projects/{project}/sprints/{sprint}/edit', [App\Http\Controllers\SprintController::class, 'edit'])->name('sprints.edit');
    Route::put('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'update'])->name('sprints.update');
    Route::delete('/projects/{project}/sprints/{sprint}', [App\Http\Controllers\SprintController::class, 'destroy'])->name('sprints.destroy');

    // Статусы задач
    Route::get('/projects/{project}/statuses', [TaskStatusController::class, 'projectIndex'])->name('projects.statuses');
    Route::put('/projects/{project}/statuses', [TaskStatusController::class, 'updateProject'])->name('projects.statuses.update');
    Route::get('/projects/{project}/sprints/{sprint}/statuses', [TaskStatusController::class, 'sprintIndex'])->name('sprints.statuses');
    Route::post('/projects/{project}/sprints/{sprint}/statuses', [TaskStatusController::class, 'createSprintStatuses'])->name('sprints.statuses.create');
    Route::put('/projects/{project}/sprints/{sprint}/statuses', [TaskStatusController::class, 'updateSprint'])->name('sprints.statuses.update');
    Route::delete('/projects/{project}/sprints/{sprint}/statuses', [TaskStatusController::class, 'deleteSprintStatuses'])->name('sprints.statuses.delete');
    Route::get('/projects/{project}/statuses/api', [TaskStatusController::class, 'getStatuses'])->name('projects.statuses.api');
    Route::get('/projects/{project}/sprints/{sprint}/statuses/api', [TaskStatusController::class, 'getStatuses'])->name('sprints.statuses.api');

    // Новый универсальный роут для получения контекстных статусов
    Route::get('/projects/{project}/contextual-statuses', [TaskStatusController::class, 'getContextualStatuses'])->name('projects.contextual-statuses');

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
    Route::get('/projects/{project}/statuses-for-tasks', [App\Http\Controllers\TaskController::class, 'getProjectStatuses'])->name('tasks.project.statuses');
    
    // Задачи по коду
    Route::get('/tasks/code/{code}', [App\Http\Controllers\TaskController::class, 'showByCode'])->name('tasks.show.by-code');

    // Комментарии к задачам
    Route::get('/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'index'])->name('tasks.comments.index');
    Route::post('/tasks/{task}/comments', [App\Http\Controllers\TaskCommentController::class, 'store'])->name('tasks.comments.store');
    Route::get('/comments/{comment}/edit', [App\Http\Controllers\TaskCommentController::class, 'edit'])->name('comments.edit');
    Route::put('/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [App\Http\Controllers\TaskCommentController::class, 'destroy'])->name('comments.destroy');

    // Чек-листы задач
    Route::get('/tasks/{task}/checklists', [App\Http\Controllers\TaskChecklistController::class, 'index'])->name('tasks.checklists.index');
    Route::post('/tasks/{task}/checklists', [App\Http\Controllers\TaskChecklistController::class, 'store'])->name('tasks.checklists.store');
    Route::put('/tasks/{task}/checklists/reorder', [App\Http\Controllers\TaskChecklistController::class, 'reorder'])->name('tasks.checklists.reorder');
    Route::put('/tasks/{task}/checklists/{checklist}', [App\Http\Controllers\TaskChecklistController::class, 'update'])->name('tasks.checklists.update');
    Route::delete('/tasks/{task}/checklists/{checklist}', [App\Http\Controllers\TaskChecklistController::class, 'destroy'])->name('tasks.checklists.destroy');
    Route::put('/tasks/{task}/checklists/{checklist}/toggle', [App\Http\Controllers\TaskChecklistController::class, 'toggleStatus'])->name('tasks.checklists.toggle');

    // ИИ-агент
    Route::get('/ai-agent', [App\Http\Controllers\AiAgentController::class, 'index'])->name('ai-agent.index');
    
    // Оптимизация текста с помощью ИИ
    Route::post('/ai-text-optimize', [AiTextOptimizationController::class, 'optimizeText'])->name('ai-text-optimize');

    // Webhook'и
    Route::get('/projects/{project}/webhooks', [App\Http\Controllers\WebhookController::class, 'index'])->name('webhooks.index');
    Route::post('/projects/{project}/webhooks', [App\Http\Controllers\WebhookController::class, 'store'])->name('webhooks.store');
    Route::put('/projects/{project}/webhooks/{webhook}', [App\Http\Controllers\WebhookController::class, 'update'])->name('webhooks.update');
    Route::delete('/projects/{project}/webhooks/{webhook}', [App\Http\Controllers\WebhookController::class, 'destroy'])->name('webhooks.destroy');
    Route::post('/projects/{project}/webhooks/{webhook}/test', [App\Http\Controllers\WebhookController::class, 'test'])->name('webhooks.test');
    Route::post('/projects/{project}/webhooks/{webhook}/toggle', [App\Http\Controllers\WebhookController::class, 'toggle'])->name('webhooks.toggle');

    // SEO Статистика
    Route::get('/seo-stats', [App\Http\Controllers\SeoStatsController::class, 'dashboard'])->name('seo-stats.dashboard');
    Route::get('/seo-stats/projects', [App\Http\Controllers\SeoStatsController::class, 'index'])->name('seo-stats.index');
    Route::get('/seo-stats/{site}/reports', [App\Http\Controllers\SeoStatsController::class, 'reports'])->name('seo-stats.reports');
    Route::post('/seo-stats/sites', [App\Http\Controllers\SeoStatsController::class, 'storeSite'])->name('seo-stats.store-site');
    Route::put('/seo-stats/sites/{site}', [App\Http\Controllers\SeoStatsController::class, 'updateSite'])->name('seo-stats.update-site');
    Route::get('/seo-stats/sites/{site}/data', [App\Http\Controllers\SeoStatsController::class, 'getProjectData'])->name('seo-stats.project-data');
    Route::post('/seo-stats/keywords', [App\Http\Controllers\SeoStatsController::class, 'storeKeyword'])->name('seo-stats.store-keyword');
    Route::delete('/seo-stats/keywords/{keyword}', [App\Http\Controllers\SeoStatsController::class, 'destroyKeyword'])->name('seo-stats.destroy-keyword');
    Route::post('/seo-stats/{site}/track-positions', [App\Http\Controllers\SeoStatsController::class, 'trackPositions'])->name('seo-stats.track-positions');
    Route::post('/seo-stats/{site}/track-wordstat', [App\Http\Controllers\SeoStatsController::class, 'trackWordstatPositions'])->name('seo-stats.track-wordstat');
    Route::get('/seo-stats/{site}/wordstat-recognition-status', [App\Http\Controllers\SeoStatsController::class, 'getWordstatRecognitionStatus'])->name('seo-stats.wordstat-recognition-status');
    Route::get('/seo-stats/wordstat-tasks/{task}/status', [App\Http\Controllers\SeoStatsController::class, 'getWordstatTaskStatus'])->name('seo-stats.wordstat-task-status');
    Route::get('/seo-stats/{site}/recognition-status', [App\Http\Controllers\SeoStatsController::class, 'getRecognitionStatus'])->name('seo-stats.recognition-status');
    Route::get('/seo-stats/tasks/{task}/status', [App\Http\Controllers\SeoStatsController::class, 'getTaskStatus'])->name('seo-stats.task-status');
    
    // XML API настройки пользователя
    Route::get('/user/xml-api-settings', [App\Http\Controllers\UserXmlApiSettingsController::class, 'getSettings'])->name('user.xml-api-settings.get');
    Route::put('/user/xml-api-settings', [App\Http\Controllers\UserXmlApiSettingsController::class, 'updateSettings'])->name('user.xml-api-settings.update');
    
    // Отчеты
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
    Route::post('/reports/export', [App\Http\Controllers\ReportController::class, 'export'])
        ->middleware('ajax')
        ->name('reports.export');
    Route::get('/reports/{report}/download', [App\Http\Controllers\ReportController::class, 'download'])->name('reports.download');
    Route::get('/reports/{report}/show', [App\Http\Controllers\ReportController::class, 'show'])->name('reports.show');
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

// Telegram webhook перенесён в routes/api.php

require __DIR__.'/auth.php';