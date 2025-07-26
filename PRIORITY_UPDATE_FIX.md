# Исправление смены приоритета задач

## 🐛 Проблема
Смена приоритета через drag & drop не работала, потому что использовался неправильный маршрут и отсутствовали необходимые методы в бэкенде.

## ✅ Решение

### 1. Добавлен новый маршрут
```php
// routes/web.php
Route::put('/tasks/{task}/priority', [App\Http\Controllers\TaskController::class, 'updatePriority'])->name('tasks.priority.update');
```

### 2. Добавлен метод контроллера
```php
// app/Http/Controllers/TaskController.php
public function updatePriority(Request $request, Task $task)
{
    if (!$this->taskService->canUserManageTask(Auth::user(), $task)) {
        abort(403, 'Доступ запрещен');
    }

    $request->validate([
        'priority' => 'required|in:low,medium,high',
    ]);

    $oldPriority = $task->priority;
    $newPriority = $request->priority;

    $task = $this->taskService->updateTaskPriority($task, $newPriority);

    // Уведомляем об изменении приоритета
    if ($oldPriority !== $newPriority) {
        $this->notificationService->taskPriorityChanged($task, $oldPriority, $newPriority, Auth::user());
    }

    if ($request->wantsJson()) {
        return response()->json(['success' => true, 'task' => $task]);
    }

    return redirect()->back()->with('success', 'Приоритет задачи успешно обновлен.');
}
```

### 3. Добавлен метод в TaskService
```php
// app/Services/TaskService.php
public function updateTaskPriority(Task $task, string $priority): Task
{
    $task->update(['priority' => $priority]);
    return $task->load(['assignee', 'reporter', 'status', 'sprint', 'project']);
}
```

### 4. Добавлено уведомление об изменении приоритета
```php
// app/Models/Notification.php
const TYPE_TASK_PRIORITY_CHANGED = 'task_priority_changed';

// В методе getMessage()
self::TYPE_TASK_PRIORITY_CHANGED => 'Приоритет задачи ":task_title" изменен на ":priority"',
```

```php
// app/Services/NotificationService.php
public function taskPriorityChanged(Task $task, string $oldPriority, string $newPriority, ?User $fromUser = null): void
{
    // Уведомляем исполнителя и создателя задачи об изменении приоритета
    // ...
}
```

### 5. Исправлен фронтенд
```javascript
// resources/js/Pages/Projects/Board.jsx
const handlePriorityDrop = (e, priority) => {
    // ...
    router.put(route('tasks.priority.update', draggedTask.id), {
        priority: priority
    }, {
        // ...
    });
};
```

## 🎯 Результат

Теперь смена приоритета работает точно так же, как смена статуса:

✅ **Правильный маршрут**: используется специальный endpoint `/tasks/{task}/priority`  
✅ **Валидация**: проверяется корректность приоритета (low, medium, high)  
✅ **Уведомления**: отправляются уведомления об изменении приоритета  
✅ **Локальное обновление**: интерфейс обновляется без перезагрузки  
✅ **Обработка ошибок**: корректная обработка ошибок и сброс состояния  

## 🚀 Как использовать

1. Перетащите задачу в том же статусе
2. Появятся цветные зоны приоритетов (зеленый, желтый, красный)
3. Отпустите задачу на нужной зоне
4. Приоритет изменится мгновенно с уведомлением

Теперь drag & drop для приоритетов работает полностью! 🎉 