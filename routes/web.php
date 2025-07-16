<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Проекты
    Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [App\Http\Controllers\ProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [App\Http\Controllers\ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
    Route::get('/projects/{project}/edit', [App\Http\Controllers\ProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'destroy'])->name('projects.destroy');

    // Задачи
    Route::get('/tasks', [App\Http\Controllers\TaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/create', [App\Http\Controllers\TaskController::class, 'create'])->name('tasks.create');
    Route::post('/tasks', [App\Http\Controllers\TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'show'])->name('tasks.show');
    Route::get('/tasks/{task}/edit', [App\Http\Controllers\TaskController::class, 'edit'])->name('tasks.edit');
    Route::put('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update'])->name('tasks.update');
    Route::delete('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'destroy'])->name('tasks.destroy');

    // Комментарии к задачам
    Route::post('/tasks/{task}/comments', [App\Http\Controllers\CommentController::class, 'store'])->name('tasks.comments.store');
    Route::put('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
});

require __DIR__.'/auth.php';
