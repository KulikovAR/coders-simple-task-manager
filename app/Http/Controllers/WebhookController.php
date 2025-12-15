<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Webhook;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class WebhookController extends Controller
{
    private WebhookService $webhookService;

    public function __construct(WebhookService $webhookService)
    {
        $this->webhookService = $webhookService;
    }

    /**
     * Показать страницу webhook'ов
     */
    public function index(Request $request, Project $project)
    {

        $webhooks = $project->webhooks()
            ->with(['user', 'logs' => function ($query) {
                $query->latest()->limit(5);
            }])
            ->get()
            ->map(function ($webhook) {
                $stats = $this->webhookService->getWebhookStats($webhook);
                return [
                    'id' => $webhook->id,
                    'name' => $webhook->name,
                    'description' => $webhook->description,
                    'url' => $webhook->url,
                    'events' => $webhook->events,
                    'event_names' => $webhook->event_names,
                    'is_active' => $webhook->is_active,
                    'created_at' => $webhook->created_at,
                    'updated_at' => $webhook->updated_at,
                    'stats' => $stats,
                    'user' => $webhook->user->only(['id', 'name', 'email']),
                ];
            });

        return inertia('Webhooks/Index', [
            'project' => $project->only(['id', 'name', 'description']),
            'webhooks' => $webhooks,
        ]);
    }

    /**
     * Получить список webhook'ов для проекта (API)
     */
    public function apiIndex(Request $request, Project $project): JsonResponse
    {

        $webhooks = $project->webhooks()
            ->with(['user', 'logs' => function ($query) {
                $query->latest()->limit(5);
            }])
            ->get()
            ->map(function ($webhook) {
                $stats = $this->webhookService->getWebhookStats($webhook);
                return [
                    'id' => $webhook->id,
                    'name' => $webhook->name,
                    'description' => $webhook->description,
                    'url' => $webhook->url,
                    'events' => $webhook->events,
                    'event_names' => $webhook->event_names,
                    'is_active' => $webhook->is_active,
                    'created_at' => $webhook->created_at,
                    'updated_at' => $webhook->updated_at,
                    'stats' => $stats,
                    'user' => [
                        'id' => $webhook->user->id,
                        'name' => $webhook->user->name,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'webhooks' => $webhooks,
        ]);
    }

    /**
     * Создать новый webhook (веб-интерфейс)
     */
    public function store(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'url' => 'required|url|max:500',
            'events' => 'required|array|min:1',
            'events.*' => ['required', 'string', Rule::in(array_keys(Webhook::EVENTS))],
            'headers' => 'nullable|array',
            'is_active' => 'boolean',
            'retry_count' => 'integer|min:0|max:10',
            'timeout' => 'integer|min:5|max:300',
        ]);

        $webhook = $this->webhookService->createWebhook([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return redirect()->route('webhooks.index', $project)
            ->with('success', 'Webhook успешно создан');
    }

    /**
     * Создать новый webhook (API)
     */
    public function apiStore(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'url' => 'required|url|max:500',
            'events' => 'required|array|min:1',
            'events.*' => ['required', 'string', Rule::in(array_keys(Webhook::EVENTS))],
            'headers' => 'nullable|array',
            'is_active' => 'boolean',
            'retry_count' => 'integer|min:0|max:10',
            'timeout' => 'integer|min:5|max:300',
        ]);

        $webhook = $this->webhookService->createWebhook([
            'project_id' => $project->id,
            'user_id' => Auth::id(),
            ...$validated,
        ]);

        return response()->json([
            'success' => true,
            'webhook' => $webhook,
            'message' => 'Webhook успешно создан',
        ], 201);
    }

    /**
     * Получить информацию о webhook
     */
    public function show(Project $project, Webhook $webhook): JsonResponse
    {

        $stats = $this->webhookService->getWebhookStats($webhook);
        $recentLogs = $webhook->logs()->latest()->limit(10)->get();

        return response()->json([
            'success' => true,
            'webhook' => [
                'id' => $webhook->id,
                'name' => $webhook->name,
                'description' => $webhook->description,
                'url' => $webhook->url,
                'events' => $webhook->events,
                'event_names' => $webhook->event_names,
                'headers' => $webhook->headers,
                'is_active' => $webhook->is_active,
                'retry_count' => $webhook->retry_count,
                'timeout' => $webhook->timeout,
                'created_at' => $webhook->created_at,
                'updated_at' => $webhook->updated_at,
                'stats' => $stats,
                'recent_logs' => $recentLogs,
                'user' => [
                    'id' => $webhook->user->id,
                    'name' => $webhook->user->name,
                ],
            ],
        ]);
    }

    /**
     * Обновить webhook (веб-интерфейс)
     */
    public function update(Request $request, Project $project, Webhook $webhook)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'url' => 'sometimes|url|max:500',
            'events' => 'sometimes|array|min:1',
            'events.*' => ['required', 'string', Rule::in(array_keys(Webhook::EVENTS))],
            'headers' => 'nullable|array',
            'is_active' => 'boolean',
            'retry_count' => 'integer|min:0|max:10',
            'timeout' => 'integer|min:5|max:300',
        ]);

        $this->webhookService->updateWebhook($webhook, $validated);

        return redirect()->route('webhooks.index', $project)
            ->with('success', 'Webhook успешно обновлен');
    }

    /**
     * Удалить webhook (веб-интерфейс)
     */
    public function destroy(Project $project, Webhook $webhook)
    {
        $this->webhookService->deleteWebhook($webhook);

        return redirect()->route('webhooks.index', $project)
            ->with('success', 'Webhook успешно удален');
    }

    /**
     * Тестировать webhook (веб-интерфейс)
     */
    public function test(Project $project, Webhook $webhook)
    {
        $result = $this->webhookService->testWebhook($webhook);

        return redirect()->route('webhooks.index', $project)
            ->with('success', $result['message']);
    }

    /**
     * Получить логи webhook
     */
    public function logs(Request $request, Project $project, Webhook $webhook): JsonResponse
    {

        $perPage = $request->get('per_page', 20);
        $logs = $webhook->logs()
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Получить доступные события для webhook
     */
    public function events(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'events' => Webhook::EVENTS,
        ]);
    }

    /**
     * Переключить статус webhook (веб-интерфейс)
     */
    public function toggle(Project $project, Webhook $webhook)
    {
        $webhook->update(['is_active' => !$webhook->is_active]);

        $message = $webhook->is_active ? 'Webhook активирован' : 'Webhook деактивирован';

        return redirect()->route('webhooks.index', $project)
            ->with('success', $message);
    }

    /**
     * API методы
     */

    /**
     * Обновить webhook (API)
     */
    public function apiUpdate(Request $request, Project $project, Webhook $webhook): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:1000',
            'url' => 'sometimes|url|max:500',
            'events' => 'sometimes|array|min:1',
            'events.*' => ['required', 'string', Rule::in(array_keys(Webhook::EVENTS))],
            'headers' => 'nullable|array',
            'is_active' => 'boolean',
            'retry_count' => 'integer|min:0|max:10',
            'timeout' => 'integer|min:5|max:300',
        ]);

        $this->webhookService->updateWebhook($webhook, $validated);

        return response()->json([
            'success' => true,
            'webhook' => $webhook->fresh(),
            'message' => 'Webhook успешно обновлен',
        ]);
    }

    /**
     * Удалить webhook (API)
     */
    public function apiDestroy(Project $project, Webhook $webhook): JsonResponse
    {
        $this->webhookService->deleteWebhook($webhook);

        return response()->json([
            'success' => true,
            'message' => 'Webhook успешно удален',
        ]);
    }

    /**
     * Тестировать webhook (API)
     */
    public function apiTest(Project $project, Webhook $webhook): JsonResponse
    {
        $result = $this->webhookService->testWebhook($webhook);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
        ]);
    }

    /**
     * Переключить статус webhook (API)
     */
    public function apiToggle(Project $project, Webhook $webhook): JsonResponse
    {
        $webhook->update(['is_active' => !$webhook->is_active]);

        return response()->json([
            'success' => true,
            'webhook' => $webhook,
            'message' => $webhook->is_active ? 'Webhook активирован' : 'Webhook деактивирован',
        ]);
    }
}
