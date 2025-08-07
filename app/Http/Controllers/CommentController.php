<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentRequest;
use App\Models\Task;
use App\Models\TaskComment;

class CommentController extends Controller
{
    public function store(CommentRequest $request, Task $task)
    {
        $task->comments()->create([
            'content' => $request->content,
            'type' => $request->type,
            'user_id' => auth()->id(),
        ]);

        return back()->with('success', 'Комментарий добавлен.');
    }

    public function update(CommentRequest $request, TaskComment $comment)
    {
        $this->authorize('update', $comment);

        $comment->update($request->validated());

        return back()->with('success', 'Комментарий обновлен.');
    }

    public function destroy(TaskComment $comment)
    {
        $this->authorize('delete', $comment);

        $comment->delete();

        return back()->with('success', 'Комментарий удален.');
    }
}
