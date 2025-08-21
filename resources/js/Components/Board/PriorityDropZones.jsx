export default function PriorityDropZones({
    dragOverPriority,
    handlePriorityDragOver,
    handlePriorityDragLeave,
    handlePriorityDrop
}) {
    const priorityZones = [
        {
            priority: 'high',
            label: 'Высокий',
            bgColor: 'bg-accent-red/10',
            borderColor: 'border-accent-red/50',
            hoverBg: 'hover:bg-accent-red/20',
            activeBg: 'bg-accent-red/20',
            activeBorderColor: 'border-accent-red',
            textColor: 'text-accent-red',
            shadowColor: 'shadow-glow-red',
            icon: '🔥'
        },
        {
            priority: 'medium',
            label: 'Средний',
            bgColor: 'bg-accent-yellow/10',
            borderColor: 'border-accent-yellow/50',
            hoverBg: 'hover:bg-accent-yellow/20',
            activeBg: 'bg-accent-yellow/20',
            activeBorderColor: 'border-accent-yellow',
            textColor: 'text-accent-yellow',
            shadowColor: 'shadow-glow-yellow',
            icon: '⚡'
        },
        {
            priority: 'low',
            label: 'Низкий',
            bgColor: 'bg-accent-green/10',
            borderColor: 'border-accent-green/50',
            hoverBg: 'hover:bg-accent-green/20',
            activeBg: 'bg-accent-green/20',
            activeBorderColor: 'border-accent-green',
            textColor: 'text-accent-green',
            shadowColor: 'shadow-glow-green',
            icon: '🌱'
        }
    ];

    return (
        <div className="space-y-3 mb-4 flex-shrink-0">
            <div className="text-caption text-text-muted font-medium mb-3 text-center">Выберите приоритет:</div>
            {priorityZones.map(({ 
                priority, 
                label, 
                bgColor, 
                borderColor, 
                hoverBg, 
                activeBg, 
                activeBorderColor, 
                textColor, 
                shadowColor,
                icon 
            }) => (
                <div
                    key={priority}
                    className={`priority-zone border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${
                        dragOverPriority === priority
                            ? `${activeBg} ${activeBorderColor} ${shadowColor} active`
                            : `${bgColor} ${borderColor} ${hoverBg}`
                    }`}
                    onDragOver={(e) => handlePriorityDragOver(e, priority)}
                    onDragLeave={handlePriorityDragLeave}
                    onDrop={(e) => handlePriorityDrop(e, priority)}
                >
                    <div className={`text-xl font-bold mb-2 ${textColor}`}>
                        {icon}
                    </div>
                    <div className={`text-body-small font-semibold ${textColor}`}>{label}</div>
                    <div className="text-caption text-text-muted mt-1">приоритет</div>
                </div>
            ))}
        </div>
    );
}
