<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Http\Requests\TaskCommentRequest;
use App\Services\NotificationService;
use App\Services\TaskCommentService;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskCommentController extends Controller
{
    public function __construct(
        private TaskCommentService $taskCommentService,
        private TaskService $taskService,
        private NotificationService $notificationService
    ) {}

    public function index(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $comments = $this->taskCommentService->getTaskComments($task);
        
        return Inertia::render('TaskComments/Index', [
            'task' => $task->load('project'),
            'comments' => $comments,
        ]);
    }

    public function store(TaskCommentRequest $request, Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $comment = $this->taskCommentService->createComment($request->validated(), $task, Auth::user());

        // Загружаем связанные данные для уведомлений
        $comment->load(['task.assignee', 'task.reporter']);

        // Уведомляем о новом комментарии
        $this->notificationService->commentAdded($comment, Auth::user());

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Комментарий успешно добавлен.');
    }

    public function edit(TaskComment $comment)
    {
        if (!$this->taskCommentService->canUserManageComment(Auth::user(), $comment)) {
            abort(403, 'Доступ запрещен');
        }

        return Inertia::render('TaskComments/Form', [
            'comment' => $comment,
            'task' => $comment->task->load('project'),
        ]);
    }

    public function update(TaskCommentRequest $request, TaskComment $comment)
    {
        if (!$this->taskCommentService->canUserManageComment(Auth::user(), $comment)) {
            abort(403, 'Доступ запрещен');
        }

        $comment = $this->taskCommentService->updateComment($comment, $request->validated());

        return redirect()->route('tasks.show', $comment->task)
            ->with('success', 'Комментарий успешно обновлен.');
    }

    public function destroy(TaskComment $comment)
    {
        if (!$this->taskCommentService->canUserManageComment(Auth::user(), $comment)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $comment->task;
        $this->taskCommentService->deleteComment($comment);

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Комментарий успешно удален.');
    }
} 