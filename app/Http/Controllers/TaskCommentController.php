<?php

namespace App\Http\Controllers;

use App\Helpers\MentionHelper;
use App\Http\Requests\TaskCommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\NotificationService;
use App\Services\TaskCommentService;
use App\Services\TaskService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaskCommentController extends Controller
{
    public function __construct(
        private TaskCommentService  $taskCommentService,
        private TaskService         $taskService,
        private NotificationService $notificationService
    )
    {
    }

    public function index(Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $comments = $this->taskCommentService->getTaskComments($task);

        return Inertia::render('TaskComments/Index', [
            'task' => $task->load(['project.users', 'project.owner']),
            'comments' => $comments,
        ]);
    }

    public function store(TaskCommentRequest $request, Task $task)
    {
        if (!$this->taskService->canUserViewTask(Auth::user(), $task)) {
            abort(403, 'Доступ запрещен');
        }

        $comment = $this->taskCommentService->createComment($request->validated(), $task, Auth::user());

        $comment->load(['task.assignee', 'task.reporter', 'task.project.users']);

        $this->notificationService->commentAdded($comment, Auth::user());

        $mentionedUsers = MentionHelper::getMentionedUsers(
            $comment->content,
            $comment->task->project->users
        );

        foreach ($mentionedUsers as $mentionedUser) {
            if ($mentionedUser->id !== Auth::id()) {
                $this->notificationService->userMentioned($comment, $mentionedUser, Auth::user());
            }
        }

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'Комментарий успешно добавлен.',
                'comment' => $comment->load('user')
            ]);
        }

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
            'task' => $comment->task->load(['project.users', 'project.owner']),
        ]);
    }

    public function update(TaskCommentRequest $request, TaskComment $comment)
    {
        if (!$this->taskCommentService->canUserManageComment(Auth::user(), $comment)) {
            abort(403, 'Доступ запрещен');
        }

        $comment = $this->taskCommentService->updateComment($comment, $request->validated());

        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'Комментарий успешно обновлен.',
                'comment' => $comment->load('user')
            ]);
        }

        return redirect()->route('tasks.show', $comment->task)
            ->with('success', 'Комментарий успешно обновлен.');
    }

    public function destroy(TaskComment $comment, Request $request)
    {
        if (!$this->taskCommentService->canUserManageComment(Auth::user(), $comment)) {
            abort(403, 'Доступ запрещен');
        }

        $task = $comment->task;
        $this->taskCommentService->deleteComment($comment);
        
        if ($request->wantsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return response()->json([
                'success' => true,
                'message' => 'Комментарий успешно удален.'
            ]);
        }

        return redirect()->route('tasks.show', $task)
            ->with('success', 'Комментарий успешно удален.');
    }
}
