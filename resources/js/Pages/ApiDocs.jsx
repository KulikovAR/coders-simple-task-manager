import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ApiDocs({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-text-primary leading-tight">
                    API Документация
                </h2>
            }
        >
            <Head title="API Документация" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-card-bg overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6 text-text-primary">
                            <h1 className="text-2xl font-bold mb-6">API Документация 379ТМ</h1>
                            
                            <div className="mb-8">
                                <p className="mb-4">
                                    Это заглушка для страницы документации API. В будущем здесь будет размещена полная документация 
                                    по работе с API таск-менеджера 379ТМ.
                                </p>
                                
                                <div className="bg-secondary-bg/50 border border-border-color rounded-lg p-4 mb-6">
                                    <h2 className="text-lg font-semibold mb-2">Базовая информация</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Базовый URL: <code className="bg-primary-bg px-2 py-1 rounded">https://api.379tm.com/v1</code></li>
                                        <li>Формат данных: <code className="bg-primary-bg px-2 py-1 rounded">JSON</code></li>
                                        <li>Аутентификация: <code className="bg-primary-bg px-2 py-1 rounded">Bearer Token</code></li>
                                    </ul>
                                </div>
                                
                                <div className="bg-secondary-bg/50 border border-border-color rounded-lg p-4">
                                    <h2 className="text-lg font-semibold mb-2">Доступные эндпоинты</h2>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /projects</code> - Получение списка проектов</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /projects/{'{id}'}</code> - Получение информации о проекте</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">POST /projects</code> - Создание нового проекта</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /projects/{'{id}'}/tasks</code> - Получение задач проекта</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /projects/{'{id}'}/sprints</code> - Получение спринтов проекта</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /tasks/{'{id}'}</code> - Получение информации о задаче</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">POST /tasks</code> - Создание новой задачи</li>
                                        <li><code className="bg-primary-bg px-2 py-1 rounded">GET /tasks/{'{id}'}/comments</code> - Получение комментариев задачи</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="text-center text-text-secondary">
                                <p>Полная документация API будет доступна в ближайшее время.</p>
                                <p>По вопросам интеграции обращайтесь в <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">Telegram поддержку</a>.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
