export default function MobileStatusOverlay({
    isOpen,
    statusOverlayTask,
    taskStatuses,
    getStatusIndicatorColor,
    handleStatusSelect,
    onClose
}) {
    if (!isOpen || !statusOverlayTask) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-4 select-none animate-fade-in"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
        >
            <div
                className="w-full max-w-lg bg-card-bg border border-border-color rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 select-none animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-text-primary font-semibold text-lg">Переместить задачу</h3>
                    <button className="text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-secondary-bg" onClick={onClose}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="text-sm text-text-secondary mb-5 font-medium border-l-2 pl-3" style={{ borderColor: getStatusIndicatorColor(statusOverlayTask.status_id) }}>
                    {statusOverlayTask.title}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {taskStatuses.map((status) => (
                        <button
                            key={status.id}
                            className={`border rounded-xl p-4 text-left transition-all ${
                                parseInt(statusOverlayTask.status_id) === parseInt(status.id)
                                ? 'border-accent-blue bg-accent-blue/10 shadow-glow-blue'
                                : 'border-border-color hover:border-accent-blue/50 hover:bg-secondary-bg'
                            }`}
                            onClick={() => handleStatusSelect(status.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: getStatusIndicatorColor(status.id) }}
                                ></div>
                                <div className="text-sm text-text-primary font-medium">{status.name}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
