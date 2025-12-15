<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentRequest;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\CommentService;

class CommentController extends Controller
{
    public function store(CommentRequest $request, Task $task)
    {
        $commentService = app(CommentService::class);

        $comment = $commentService->createComment([
            'content' => $request->input('content'),
            'type' => $request->type,
        ], $task, auth()->user());

        return back()->with('success', 'Комментарий добавлен.');
    }

    public function update(CommentRequest $request, TaskComment $comment)
    {
        $this->authorize('update', $comment);

        $commentService = app(CommentService::class);

        $comment = $commentService->updateComment($comment, $request->validated());

        return back()->with('success', 'Комментарий обновлен.');
    }

    public function destroy(TaskComment $comment)
    {
        $this->authorize('delete', $comment);

        $commentService = app(CommentService::class);

        $commentService->deleteComment($comment);

        return back()->with('success', 'Комментарий удален.');
    }
}
