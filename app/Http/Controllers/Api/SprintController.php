<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Sprint\StoreSprintRequest;
use App\Http\Requests\Api\Sprint\UpdateSprintRequest;
use App\Http\Resources\ApiResponse;
use App\Models\Project;
use App\Models\Sprint;
use App\Services\ProjectService;
use App\Services\SprintService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SprintController extends Controller
{
    public function __construct(
        private SprintService $sprintService,
        private ProjectService $projectService
    ) {}

    public function index(Project $project, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $sprints = $this->sprintService->getProjectSprints($project);
        
        return response()->json(
            ApiResponse::success($sprints, 'Спринты успешно загружены')
        );
    }

    public function store(StoreSprintRequest $request, Project $project): JsonResponse
    {
        if (!$this->projectService->canUserManageProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $sprint = $this->sprintService->createSprint($request->validated(), $project);
        
        return response()->json(
            ApiResponse::success($sprint, 'Спринт успешно создан'),
            201
        );
    }

    public function show(Project $project, Sprint $sprint, Request $request): JsonResponse
    {
        if (!$this->projectService->canUserAccessProject($request->user(), $project)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $sprint->load(['tasks.assignee', 'tasks.reporter', 'tasks.status']);
        
        return response()->json(
            ApiResponse::success($sprint, 'Спринт успешно загружен')
        );
    }

    public function update(UpdateSprintRequest $request, Project $project, Sprint $sprint): JsonResponse
    {
        if (!$this->sprintService->canUserManageSprint($request->user(), $sprint)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $sprint = $this->sprintService->updateSprint($sprint, $request->validated());
        
        return response()->json(
            ApiResponse::success($sprint, 'Спринт успешно обновлен')
        );
    }

    public function destroy(Project $project, Sprint $sprint, Request $request): JsonResponse
    {
        if (!$this->sprintService->canUserManageSprint($request->user(), $sprint)) {
            return response()->json(
                ApiResponse::error('Доступ запрещен', 403),
                403
            );
        }

        $this->sprintService->deleteSprint($sprint);
        
        return response()->json(
            ApiResponse::success(null, 'Спринт успешно удален')
        );
    }
}
