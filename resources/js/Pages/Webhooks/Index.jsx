import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHeader from '@/Components/PageHeader';

export default function WebhooksIndex({ project, webhooks = [], auth }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState(null);
    const [showGuide, setShowGuide] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        url: '',
        events: [],
        headers: {},
        is_active: true,
        retry_count: 3,
        timeout: 30
    });

    const availableEvents = [
        { value: 'task.created', label: 'Задача создана', description: 'Отправляется при создании новой задачи' },
        { value: 'task.updated', label: 'Задача обновлена', description: 'Отправляется при изменении задачи' },
        { value: 'task.assigned', label: 'Задача назначена', description: 'Отправляется при назначении исполнителя' },
        { value: 'task.completed', label: 'Задача завершена', description: 'Отправляется при завершении задачи' },
        { value: 'project.created', label: 'Проект создан', description: 'Отправляется при создании проекта' },
        { value: 'project.updated', label: 'Проект обновлен', description: 'Отправляется при изменении проекта' },
        { value: 'sprint.created', label: 'Спринт создан', description: 'Отправляется при создании спринта' },
        { value: 'comment.created', label: 'Комментарий создан', description: 'Отправляется при добавлении комментария' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingWebhook
            ? route('webhooks.update', [project.id, editingWebhook.id])
            : route('webhooks.store', project.id);

        const method = editingWebhook ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                setShowCreateForm(false);
                setEditingWebhook(null);
                setFormData({
                    name: '',
                    description: '',
                    url: '',
                    events: [],
                    headers: {},
                    is_active: true,
                    retry_count: 3,
                    timeout: 30
                });
            },
            onError: (errors) => {
                console.error('Ошибка при сохранении webhook:', errors);
            }
        });
    };

    const handleDelete = (webhook) => {
        if (confirm('Вы уверены, что хотите удалить этот webhook?')) {
            router.delete(route('webhooks.destroy', [project.id, webhook.id]));
        }
    };

    const handleToggle = (webhook) => {
        router.post(route('webhooks.toggle', [project.id, webhook.id]));
    };

    const handleTest = (webhook) => {
        router.post(route('webhooks.test', [project.id, webhook.id]));
    };

    const startEdit = (webhook) => {
        setEditingWebhook(webhook);
        setFormData({
            name: webhook.name,
            description: webhook.description || '',
            url: webhook.url,
            events: webhook.events || [],
            headers: webhook.headers || {},
            is_active: webhook.is_active,
            retry_count: webhook.retry_count || 3,
            timeout: webhook.timeout || 30
        });
        setShowCreateForm(true);
    };

    const getStatusIcon = (webhook) => {
        if (!webhook.is_active) {
            return <span className="text-lg">⏸️</span>;
        }

        const successRate = webhook.stats?.success_rate || 0;
        if (successRate >= 90) {
            return <span className="text-lg">✅</span>;
        }
        if (successRate >= 70) {
            return <span className="text-lg">⚠️</span>;
        }
        return <span className="text-lg">❌</span>;
    };

    const getStatusText = (webhook) => {
        if (!webhook.is_active) return 'Неактивен';

        const successRate = webhook.stats?.success_rate || 0;
        if (successRate >= 90) return 'Отлично';
        if (successRate >= 70) return 'Хорошо';
        return 'Проблемы';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('projects.show', project.id)}
                        className="text-text-secondary hover:text-text-primary text-white text-lg"
                    >
                        ←
                    </Link>
                    <h2 className="font-semibold text-xl text-text-primary leading-tight">
                        Webhook'ы проекта "{project.name}"
                    </h2>
                </div>
            }
        >
            <Head title={`Webhook'ы - ${project.name}`} />

            <div className="space-y-6">
                {/* Заголовок и кнопки действий */}
                <PageHeader
                    title="Webhook'ы"
                    description="Настройте автоматические уведомления и интеграции с внешними системами"
                    actions={[
                        {
                            type: 'button',
                            variant: 'secondary',
                            text: 'Как использовать?',
                            onClick: () => setShowGuide(true),
                            mobileOrder: 2
                        },
                        {
                            type: 'button',
                            variant: 'primary',
                            text: 'Создать webhook',
                            onClick: () => setShowCreateForm(true),
                            mobileOrder: 1
                        }
                    ]}
                />

                {/* Руководство пользователя */}
                {showGuide && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="card-title">Как использовать Webhook'ы?</h3>
                            <button
                                onClick={() => setShowGuide(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors text-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6 text-sm text-text-secondary">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">🔗 Что такое Webhook?</h4>
                                <p className="mb-3">
                                    Webhook — это способ автоматической отправки данных о событиях в вашем проекте
                                    на внешние сервисы в реальном времени. Например, когда создается новая задача,
                                    webhook может отправить уведомление в Slack, Discord или другую систему.
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">⚙️ Как это работает?</h4>
                                <ol className="list-decimal list-inside space-y-1 mb-3">
                                    <li>Создайте webhook и укажите URL вашего сервиса</li>
                                    <li>Выберите события, на которые должен реагировать webhook</li>
                                    <li>При наступлении события система автоматически отправит POST-запрос на ваш URL</li>
                                    <li>Ваш сервис получит данные и может выполнить нужные действия</li>
                                </ol>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">💻 Для разработчиков</h4>
                                
                                <div className="bg-secondary-bg rounded-lg p-4 mb-4">
                                    <h5 className="font-semibold text-text-primary mb-2">📋 Формат запроса</h5>
                                    <div className="font-mono text-xs">
                                        <div className="text-accent-green">POST https://your-server.com/webhook</div>
                                        <div className="text-accent-green">Content-Type: application/json</div>
                                        <div className="text-accent-green">X-Webhook-Signature: sha256=abc123...</div>
                                        <div className="text-accent-green">X-Webhook-Event: task.created</div>
                                        <br />
                                        <div className="text-text-primary">{`{
  "event": "task.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "task": {
      "id": 123,
      "title": "Новая задача",
      "description": "Описание задачи",
      "status": "В работе",
      "assignee": "user@example.com",
      "project": "Мой проект"
    }
  }
}`}</div>
                                    </div>
                                </div>

                                <div className="bg-secondary-bg rounded-lg p-4 mb-4">
                                    <h5 className="font-semibold text-text-primary mb-2">🔐 Проверка подписи (PHP)</h5>
                                    <div className="font-mono text-xs">
                                        <div className="text-accent-green">{`<?php
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';
$secret = 'your-webhook-secret';

$expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(401);
    exit('Unauthorized');
}

$data = json_decode($payload, true);
// Обработка webhook'а
?>`}</div>
                                    </div>
                                </div>

                                <div className="bg-secondary-bg rounded-lg p-4 mb-4">
                                    <h5 className="font-semibold text-text-primary mb-2">🔐 Проверка подписи (Node.js)</h5>
                                    <div className="font-mono text-xs">
                                        <div className="text-accent-green">{`const crypto = require('crypto');

app.post('/webhook', (req, res) => {
  const payload = JSON.stringify(req.body);
  const signature = req.headers['x-webhook-signature'];
  const secret = 'your-webhook-secret';
  
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
          .update(payload)
          .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Unauthorized');
  }
  
  // Обработка webhook'а
  console.log('Webhook received:', req.body);
  res.status(200).send('OK');
});`}</div>
                                    </div>
                                </div>

                                <div className="bg-secondary-bg rounded-lg p-4">
                                    <h5 className="font-semibold text-text-primary mb-2">⚡ Настройки производительности</h5>
                                    <ul className="text-text-secondary text-sm space-y-1">
                                        <li>• <strong>Timeout:</strong> Максимальное время ожидания ответа (по умолчанию 30 сек)</li>
                                        <li>• <strong>Retry Count:</strong> Количество повторных попыток при ошибке (по умолчанию 3)</li>
                                        <li>• <strong>Queue:</strong> Webhook'и обрабатываются асинхронно в очереди</li>
                                        <li>• <strong>Rate Limiting:</strong> Автоматическое ограничение частоты запросов</li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">📊 Мониторинг и логи</h4>
                                <p className="mb-2">
                                    Все отправленные webhook'и логируются в системе. Вы можете просматривать:
                                </p>
                                <ul className="text-text-secondary text-sm space-y-1">
                                    <li>• Статус отправки (успех/ошибка)</li>
                                    <li>• Время выполнения запроса</li>
                                    <li>• Код ответа от вашего сервера</li>
                                    <li>• Количество попыток</li>
                                    <li>• Детали ошибок</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">🚀 Примеры использования</h4>
                                <div className="space-y-3">
                                    <div className="bg-secondary-bg rounded-lg p-3">
                                        <h5 className="font-semibold text-text-primary text-sm mb-1">📱 Slack уведомления</h5>
                                        <p className="text-text-secondary text-xs">Отправка уведомлений в Slack канал при создании задач</p>
                                    </div>
                                    <div className="bg-secondary-bg rounded-lg p-3">
                                        <h5 className="font-semibold text-text-primary text-sm mb-1">📊 Аналитика</h5>
                                        <p className="text-text-secondary text-xs">Сбор метрик в внешние системы аналитики</p>
                                    </div>
                                    <div className="bg-secondary-bg rounded-lg p-3">
                                        <h5 className="font-semibold text-text-primary text-sm mb-1">🔄 Синхронизация</h5>
                                        <p className="text-text-secondary text-xs">Синхронизация данных с CRM или другими системами</p>
                                    </div>
                                    <div className="bg-secondary-bg rounded-lg p-3">
                                        <h5 className="font-semibold text-text-primary text-sm mb-1">📧 Email маркетинг</h5>
                                        <p className="text-text-secondary text-xs">Автоматическая отправка email при завершении задач</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">🔒 Безопасность</h4>
                                <p className="mb-2">
                                    Каждый webhook имеет секретный ключ для проверки подлинности запросов. 
                                    Используйте его для валидации входящих данных.
                                </p>
                                <p className="text-text-secondary text-sm">
                                    Все запросы отправляются через HTTPS с подписью в заголовке X-Webhook-Signature.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card">
                        <div className="flex items-center">
                            <span className="text-2xl">🔗</span>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-secondary">Всего webhook'ов</p>
                                <p className="text-2xl font-bold text-text-primary">{webhooks.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <span className="text-2xl">✅</span>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-secondary">Активных</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {webhooks.filter(w => w.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <span className="text-2xl">⚠️</span>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-secondary">С проблемами</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {webhooks.filter(w => w.is_active && (w.stats?.success_rate || 0) < 90).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center">
                            <span className="text-2xl">⏱️</span>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-secondary">Среднее время</p>
                                <p className="text-2xl font-bold text-text-primary">
                                    {Math.round(webhooks.reduce((acc, w) => acc + (w.stats?.average_execution_time || 0), 0) / webhooks.length || 0)}мс
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Список webhook'ов */}
                <div className="space-y-4">
                    {webhooks.map((webhook) => (
                        <div key={webhook.id} className="card hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    <div className="flex-shrink-0 mt-1">
                                        {getStatusIcon(webhook)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                                            {webhook.name}
                                        </h3>
                                        <p className="text-sm text-text-secondary mb-2 break-all font-mono bg-secondary-bg px-2 py-1 rounded">
                                            {webhook.url}
                                        </p>

                                        {webhook.description && (
                                            <p className="text-sm text-text-secondary mb-3">
                                                {webhook.description}
                                            </p>
                                        )}

                                        <div className="flex items-center space-x-4 mb-3">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                webhook.is_active
                                                    ? 'bg-accent-green bg-opacity-20 text-white'
                                                    : 'bg-text-secondary bg-opacity-20 text-white'
                                            }`}>
                                                {getStatusText(webhook)}
                                            </span>
                                            <span className="text-xs text-text-secondary">
                                                {webhook.events?.length || 0} событий
                                            </span>
                                            {webhook.stats && (
                                                <span className="text-xs text-text-secondary">
                                                    {webhook.stats.success_rate}% успеха
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {webhook.events?.map((event) => (
                                                <span key={event} className="px-2 py-1 bg-accent-blue bg-opacity-20 text-accent-blue text-xs rounded font-medium">
                                                    {availableEvents.find(e => e.value === event)?.label || event}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleToggle(webhook)}
                                        className={`btn btn-sm text-white ${
                                            webhook.is_active
                                                ? "btn-warning"
                                                : "btn-success"
                                        }`}
                                    >
                                        {webhook.is_active ? "Пауза" : "Включить"}
                                    </button>

                                    <button
                                        onClick={() => startEdit(webhook)}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        Изменить
                                    </button>

                                    <button
                                        onClick={() => handleDelete(webhook)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {webhooks.length === 0 && (
                        <div className="text-center py-12">
                            <div className="mx-auto mb-4">
                                <span className="text-6xl">🔗</span>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Нет webhook'ов</h3>
                            <p className="text-text-secondary mb-6 max-w-md mx-auto">
                                Начните с создания первого webhook'а для автоматизации процессов и интеграции с внешними системами.
                            </p>
                            <div className="space-x-3">
                                <button
                                    onClick={() => setShowGuide(true)}
                                    className="btn btn-secondary"
                                >
                                    Узнать больше
                                </button>
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className="btn btn-primary"
                                >
                                    Создать webhook
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Модальное окно создания/редактирования */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-lg bg-card-bg border-border-color">
                            <div className="mt-3">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">
                                    {editingWebhook ? 'Редактировать webhook' : 'Создать webhook'}
                                </h3>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1">Название</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="input w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1">Описание</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="input w-full"
                                            rows="2"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-1">URL</label>
                                        <input
                                            type="url"
                                            value={formData.url}
                                            onChange={(e) => setFormData({...formData, url: e.target.value})}
                                            className="input w-full font-mono text-sm"
                                            placeholder="https://your-service.com/webhook"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-text-primary mb-2">События</label>
                                        <div className="space-y-2 max-h-40 overflow-y-auto border border-border-color rounded-lg p-3 bg-secondary-bg">
                                            {availableEvents.map((event) => (
                                                <label key={event.value} className="flex items-start space-x-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.events.includes(event.value)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({
                                                                    ...formData,
                                                                    events: [...formData.events, event.value]
                                                                });
                                                            } else {
                                                                setFormData({
                                                                    ...formData,
                                                                    events: formData.events.filter(ev => ev !== event.value)
                                                                });
                                                            }
                                                        }}
                                                        className="mt-0.5 rounded border-border-color text-accent-blue focus:border-accent-blue focus:ring focus:ring-accent-blue focus:ring-opacity-20"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-text-primary">{event.label}</div>
                                                        <div className="text-xs text-text-secondary">{event.description}</div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="rounded border-border-color text-accent-blue focus:border-accent-blue focus:ring focus:ring-accent-blue focus:ring-opacity-20"
                                        />
                                        <label className="ml-2 text-sm text-text-primary">Активен</label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setEditingWebhook(null);
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editingWebhook ? 'Обновить' : 'Создать'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
