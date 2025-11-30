import React from "react";

const getBgColor = (pos) => {
    if (pos === null) return 'bg-gray-200';
    if (pos === 0) return 'bg-gray-400';
    if (pos <= 3) return 'bg-green-500';
    if (pos <= 10) return 'bg-yellow-500';
    return 'bg-red-500';
};

const PositionCell = React.memo(({ position, change, isToday, url, onTooltipShow, onTooltipHide }) => {
    const isClickable = !!url;

    const handleClick = (e) => {
        if (isClickable) {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleMouse = (e) => {
        if (!url) return;
        const rect = e.currentTarget.getBoundingClientRect();
        onTooltipShow(url, rect);
    };

    return (
        <td className="w-12 h-12 px-1 py-1 text-center min-w-[100px] relative">
            <div
                onClick={handleClick}
                onMouseEnter={handleMouse}
                onMouseMove={handleMouse}
                onMouseLeave={onTooltipHide}
                className={`w-full h-full flex flex-col items-center justify-center ${getBgColor(position)} ${isToday ? 'ring-2 ring-accent-blue ring-offset-1' : ''} ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-out' : ''}`}
            >
                <span className={`text-sm font-bold ${position === null || position === 0 ? 'text-gray-600' : 'text-white'} ${isToday ? 'text-lg' : ''}`}>
                    {position === null || position === 0 ? '-' : position}
                </span>
                {change !== null && position !== 0 && position !== null && (
                    <span className={`text-xs font-medium ${change > 0 ? 'text-green-200' : change < 0 ? 'text-red-200' : 'text-gray-200'}`}>
                        {change > 0 ? '↑' : change < 0 ? '↓' : '='} {Math.abs(change)}
                    </span>
                )}
            </div>
        </td>
    );
});

export default PositionCell;