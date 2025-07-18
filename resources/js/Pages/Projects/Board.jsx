import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { getSprintStatusLabel, getSprintStatusClass, getSprintStatusIcon, formatSprintDates } from '@/utils/sprintUtils';

export default function Board({ auth, project, tasks, taskStatuses, sprints = [], members = [] }) {
    const [draggedTask, setDraggedTask] = useState(null);
    const [selectedSprintId, setSelectedSprintId] = useState('all');
    const [assigneeId, setAssigneeId] = useState('');
    const [myTasks, setMyTasks] = useState(false);

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

    // Фильтрация задач по спринту и исполнителю
    const filteredTasks = tasks.filter(task => {
        const sprintOk = selectedSprintId === 'all' || task.sprint_id == selectedSprintId;
        const assigneeOk = assigneeId ? String(task.assignee_id) === String(assigneeId) : true;
        const myOk = myTasks ? String(task.assignee_id) === String(auth.user.id) : true;
        return sprintOk && assigneeOk && myOk;
    });

    const getFilteredStatusTasks = (statusId) => {
        return filteredTasks.filter(task => task.status_id === statusId);
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

                {/* Фильтр по спринтам */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-white">Фильтр по спринтам</h3>
                        <Link
                            href={route('sprints.create', project.id)}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Создать спринт
                        </Link>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedSprintId('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedSprintId === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            Все задачи
                        </button>
                        {sprints.map((sprint) => (
                            <button
                                key={sprint.id}
                                onClick={() => setSelectedSprintId(sprint.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                                    selectedSprintId == sprint.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <span>{getSprintStatusIcon(sprint.status)}</span>
                                <span>{sprint.name}</span>
                                <span className="text-xs opacity-75">
                                    ({formatSprintDates(sprint)})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Фильтры по исполнителю и мои задачи */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div>
                            <label className="form-label text-white">Исполнитель</label>
                            <select
                                value={assigneeId}
                                onChange={e => setAssigneeId(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Все исполнители</option>
                                {members.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} {user.email ? `(${user.email})` : ''}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center space-x-2 mt-6">
                            <input
                                type="checkbox"
                                id="my_tasks"
                                checked={myTasks}
                                onChange={e => setMyTasks(e.target.checked)}
                                className="form-checkbox"
                            />
                            <label htmlFor="my_tasks" className="text-sm text-white">Мои задачи</label>
                        </div>
                    </div>
                </div>

                {/* Kanban доска */}
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-medium text-white">
                            Доска задач
                            {selectedSprintId !== 'all' && (
                                <span className="text-sm text-gray-400 ml-2">
                                    (фильтр: {sprints.find(s => s.id == selectedSprintId)?.name})
                                </span>
                            )}
                        </h3>
                        <Link
                            href={route('tasks.create', { project_id: project.id })}
                            className="text-white hover:text-gray-300 text-sm font-medium"
                        >
                            + Добавить задачу
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {taskStatuses.map((status) => {
                            const statusTasks = getFilteredStatusTasks(status.id);
                            
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
                                                {task.code && (
                                                    <div className="text-xs font-mono text-blue-400 mb-2 font-bold">{task.code}</div>
                                                )}
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
                                                
                                                {/* Информация о спринте */}
                                                {task.sprint && (
                                                    <div className="mt-2 pt-2 border-t border-gray-600">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-gray-400">Спринт:</span>
                                                            <Link
                                                                href={route('sprints.show', [project.id, task.sprint.id])}
                                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {task.sprint.name}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
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