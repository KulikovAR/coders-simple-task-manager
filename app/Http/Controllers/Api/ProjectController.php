<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Project\StoreProjectRequest;
use App\Http\Requests\Api\Project\UpdateProjectRequest;
use App\Http\Resources\ApiResponse;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $projects = $this->projectService->getUserProjects($request->user());
        
        return response()->json(
            ApiResponse::success($projects, 'Проекты успешно загружены')
        );
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->validated(), $request->user());
        
        return response()->json(
            ApiResponse::success($project, 'Проект успешно создан'),
            201
        );
    }

    public function show(Project $project, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $project->load(['owner', 'members.user', 'taskStatuses']);
        
        return response()->json(
            ApiResponse::success($project, 'Проект успешно загружен')
        );
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $project = $this->projectService->updateProject($project, $request->validated());
        
        return response()->json(
            ApiResponse::success($project, 'Проект успешно обновлен')
        );
    }

    public function destroy(Project $project, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $this->projectService->deleteProject($project);
        
        return response()->json(
            ApiResponse::success(null, 'Проект успешно удален')
        );
    }

    public function addMember(Request $request, Project $project): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'sometimes|in:member,viewer',
        ]);

        $user = User::findOrFail($request->user_id);
        $member = $this->projectService->addMember($project, $user, $request->role ?? 'member');
        
        return response()->json(
            ApiResponse::success($member->load('user'), 'Участник успешно добавлен'),
            201
        );
    }

    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $this->projectService->removeMember($project, $user);
        
        return response()->json(
            ApiResponse::success(null, 'Участник успешно удален')
        );
    }
}
