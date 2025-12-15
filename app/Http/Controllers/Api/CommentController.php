<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Comment\StoreCommentRequest;
use App\Http\Requests\Api\Comment\UpdateCommentRequest;
use App\Http\Resources\ApiResponse;
use App\Models\Project;
use App\Models\Task;
use App\Models\TaskComment;
use App\Services\CommentService;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    )
    {
    }

    public function index(Project $project, Task $task, Request $request): JsonResponse
    {
        $projectService = new ProjectService();
        if (!$projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $comments = $this->commentService->getTaskComments($task);

        return response()->json(
            ApiResponse::success($comments, 'Комментарии успешно загружены')
        );
    }

    public function store(StoreCommentRequest $request, Project $project, Task $task): JsonResponse
    {
        $projectService = new ProjectService();
        if (!$projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $comment = $this->commentService->createComment($request->validated(), $task, $request->user());

        return response()->json(
            ApiResponse::success($comment->load('user'), 'Комментарий успешно создан'),
            201
        );
    }

    public function show(TaskComment $comment, Request $request): JsonResponse
    {
        if (!$this->commentService->canUserViewComment($request->user(), $comment)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $comment->load('user');

        return response()->json(
            ApiResponse::success($comment, 'Комментарий успешно загружен')
        );
    }

    public function update(UpdateCommentRequest $request, TaskComment $comment): JsonResponse
    {
        if (!$this->commentService->canUserManageComment($request->user(), $comment)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $comment = $this->commentService->updateComment($comment, $request->validated());

        return response()->json(
            ApiResponse::success($comment, 'Комментарий успешно обновлен')
        );
    }

    public function destroy(TaskComment $comment, Request $request): JsonResponse
    {
        if (!$this->commentService->canUserManageComment($request->user(), $comment)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $this->commentService->deleteComment($comment);

        return response()->json(
            ApiResponse::success(null, 'Комментарий успешно удален')
        );
    }

    public function specialComments(Project $project, Task $task, Request $request): JsonResponse
    {
        $projectService = new ProjectService();
        if (!$projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $comments = $this->commentService->getSpecialComments($task);

        return response()->json(
            ApiResponse::success($comments, 'Специальные комментарии успешно загружены')
        );
    }
}
