import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    PlusIcon,
    TrashIcon,
    PlayIcon,
    PauseIcon,
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const WebhookManager = ({ project, webhooks = [], events = [] }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState(null);
    const [selectedWebhook, setSelectedWebhook] = useState(null);
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = editingWebhook
            ? route('api.projects.webhooks.update', { project: project.id, webhook: editingWebhook.id })
            : route('api.projects.webhooks.store', { project: project.id });

        const method = editingWebhook ? 'put' : 'post';

        router.visit(url, {
            method,
            data: formData,
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
            }
        });
    };

    const handleDelete = (webhook) => {
        if (confirm('Вы уверены, что хотите удалить этот webhook?')) {
            router.delete(route('api.projects.webhooks.destroy', {
                project: project.id,
                webhook: webhook.id
            }));
        }
    };

    const handleTest = (webhook) => {
        router.post(route('api.projects.webhooks.test', {
            project: project.id,
            webhook: webhook.id
        }), {}, {
            onSuccess: (page) => {
                alert('Webhook протестирован успешно!');
            },
            onError: (errors) => {
                alert('Ошибка тестирования webhook: ' + (errors.message || 'Неизвестная ошибка'));
            }
        });
    };

    const handleToggle = (webhook) => {
        router.post(route('api.projects.webhooks.toggle', {
            project: project.id,
            webhook: webhook.id
        }));
    };

    const handleEdit = (webhook) => {
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
            return <PauseIcon className="h-5 w-5 text-gray-400" />;
        }

        const successRate = webhook.stats?.success_rate || 0;
        if (successRate >= 90) {
            return <CheckCircleIcon className="h-5 w-5 text-white" />;
        } else if (successRate >= 70) {
            return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
        } else {
            return <XCircleIcon className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusText = (webhook) => {
        if (!webhook.is_active) {
            return 'Неактивен';
        }

        const successRate = webhook.stats?.success_rate || 0;
        if (successRate >= 90) {
            return 'Отлично';
        } else if (successRate >= 70) {
            return 'Хорошо';
        } else {
            return 'Проблемы';
        }
    };

    return (
        <div className="space-y-6">
            {/* Заголовок и кнопка создания */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Webhook интеграции
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Настройте автоматические уведомления и интеграции с внешними сервисами
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="h-5 w-5" />
                    Создать webhook
                </button>
            </div>

            {/* Форма создания/редактирования */}
            {showCreateForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {editingWebhook ? 'Редактировать webhook' : 'Создать новый webhook'}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Название
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="https://example.com/webhook"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Описание
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                События для отслеживания
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {Object.entries(events).map(([key, label]) => (
                                    <label key={key} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.events.includes(key)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        events: [...formData.events, key]
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        events: formData.events.filter(event => event !== key)
                                                    });
                                                }
                                            }}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Количество повторов
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={formData.retry_count}
                                    onChange={(e) => setFormData({...formData, retry_count: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Таймаут (сек)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="300"
                                    value={formData.timeout}
                                    onChange={(e) => setFormData({...formData, timeout: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>

                            <div className="flex items-center">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Активен
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setEditingWebhook(null);
                                }}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                {editingWebhook ? 'Обновить' : 'Создать'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Список webhook'ов */}
            <div className="space-y-4">
                {webhooks.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Нет webhook'ов
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Создайте свой первый webhook для интеграции с внешними сервисами
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Создать webhook
                        </button>
                    </div>
                ) : (
                    webhooks.map((webhook) => (
                        <div key={webhook.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        {getStatusIcon(webhook)}
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {webhook.name}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            webhook.is_active
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                        }`}>
                                            {getStatusText(webhook)}
                                        </span>
                                    </div>

                                    {webhook.description && (
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                            {webhook.description}
                                        </p>
                                    )}

                                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                        <p><strong>URL:</strong> {webhook.url}</p>
                                        <p><strong>События:</strong> {webhook.event_names.join(', ')}</p>
                                    </div>

                                    {webhook.stats && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Всего запросов:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                    {webhook.stats.total_requests}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Успешных:</span>
                                                <span className="ml-1 font-medium text-green-600">
                                                    {webhook.stats.successful_requests}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Успешность:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                    {webhook.stats.success_rate}%
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Среднее время:</span>
                                                <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                    {webhook.stats.average_execution_time}мс
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <button
                                        onClick={() => handleTest(webhook)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                        title="Тестировать"
                                    >
                                        <PlayIcon className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => handleToggle(webhook)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            webhook.is_active
                                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900'
                                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900'
                                        }`}
                                        title={webhook.is_active ? 'Деактивировать' : 'Активировать'}
                                    >
                                        {webhook.is_active ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                                    </button>

                                    <button
                                        onClick={() => handleEdit(webhook)}
                                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Редактировать"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(webhook)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                        title="Удалить"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WebhookManager;
