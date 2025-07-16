import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Board({ auth, project, tasks, taskStatuses }) {
    const [draggedTask, setDraggedTask] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-gray-600 text-white';
            case 'completed':
                return 'bg-gray-700 text-white';
            case 'on_hold':
                return 'bg-gray-500 text-white';
            case 'cancelled':
                return 'bg-gray-800 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'active':
                return 'Активный';
            case 'completed':
                return 'Завершен';
            case 'on_hold':
                return 'Приостановлен';
            case 'cancelled':
                return 'Отменен';
            default:
                return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low':
                return 'text-gray-400';
            case 'medium':
                return 'text-white';
            case 'high':
                return 'text-white';
            default:
                return 'text-gray-400';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'low':
                return 'Низкий';
            case 'medium':
                return 'Средний';
            case 'high':
                return 'Высокий';
            default:
                return priority;
        }
    };

    const handleDragStart = (e, task) => {
        setDraggedTask(task);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, statusId) => {
        e.preventDefault();
        
        if (draggedTask && draggedTask.status_id !== statusId) {
            router.put(route('tasks.status.update', draggedTask.id), {
                status_id: statusId
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setDraggedTask(null);
                }
            });
        }
    };

    const handleDragEnd = () => {
        setDraggedTask(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-white leading-tight">Доска задач</h2>}
        >
            <Head title={`${project.name} - Доска`} />

            <div className="space-y-6">
                {/* Заголовок и действия */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {getStatusText(project.status)}
                            </span>
                            <span>Создан: {new Date(project.created_at).toLocaleDateString('ru-RU')}</span>
                            {project.deadline && (
                                <span>Дедлайн: {new Date(project.deadline).toLocaleDateString('ru-RU')}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('projects.show', project.id)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Список
                        </Link>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Добавить задачу
                        </Link>
                    </div>
                </div>

                {/* Описание */}
                {project.description && (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                        <h3 className="text-lg font-medium text-white mb-3">Описание</h3>
                        <p className="text-gray-400 whitespace-pre-wrap">{project.description}</p>
                    </div>
                )}

                {/* Kanban доска */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">Доска задач</h3>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Добавить задачу
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {taskStatuses.map((status) => {
                            const statusTasks = tasks.filter(task => task.status_id === status.id);
                            
                            return (
                                <div
                                    key={status.id}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, status.id)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-white font-medium">{status.name}</h4>
                                        <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {statusTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-gray-700 border border-gray-600 rounded-lg p-3 cursor-move hover:bg-gray-600 transition-colors"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task)}
                                                onDragEnd={handleDragEnd}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="text-white font-medium text-sm">
                                                        <Link 
                                                            href={route('tasks.show', task.id)} 
                                                            className="hover:text-gray-300"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {task.title}
                                                        </Link>
                                                    </h5>
                                                </div>
                                                
                                                {task.description && (
                                                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                                
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className={`${getPriorityColor(task.priority)}`}>
                                                        {getPriorityText(task.priority)}
                                                    </span>
                                                    {task.assignee && (
                                                        <span className="text-gray-400">
                                                            {task.assignee.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 