import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import TaskComments from '@/Components/TaskComments';

export default function Index({ auth, task, comments }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-text-primary leading-tight">
                        Комментарии к задаче: {task.title}
                    </h2>
                    <Link
                        href={route('tasks.show', task.id)}
                        className="btn btn-secondary"
                    >
                        Вернуться к задаче
                    </Link>
                </div>
            }
        >
            <Head title={`Комментарии - ${task.title}`} />

            <div className="space-y-6">
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Обсуждение задачи
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                            Проект: {task.project?.name}
                        </p>
                    </div>

                    <div className="card-body">
                        {(() => {
                            const projectUsers = task.project
                                ? [
                                    ...(task.project.owner ? [task.project.owner] : []),
                                    ...(task.project.users || [])
                                  ].filter((user, index, array) =>
                                    array.findIndex(u => u.id === user.id) === index
                                  )
                                : [];

                            return (
                                <TaskComments
                                    task={task}
                                    comments={comments}
                                    auth={auth}
                                    users={projectUsers}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
