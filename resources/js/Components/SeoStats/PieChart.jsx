import { useMemo } from 'react';

export default function PieChart({ data = [], size = 120, strokeWidth = 8 }) {
    const chartData = useMemo(() => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (total === 0) {
            return data.map(item => ({
                ...item,
                percentage: 0,
                strokeDasharray: '0 100'
            }));
        }

        let cumulativePercentage = 0;
        
        return data.map(item => {
            const percentage = (item.value / total) * 100;
            const strokeDasharray = `${percentage} ${100 - percentage}`;
            const strokeDashoffset = -cumulativePercentage;
            
            cumulativePercentage += percentage;
            
            return {
                ...item,
                percentage: Math.round(percentage * 10) / 10,
                strokeDasharray,
                strokeDashoffset
            };
        });
    }, [data]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Фоновый круг */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-border-color"
                    />
                    
                    {/* Сегменты диаграммы */}
                    {chartData.map((item, index) => (
                        <circle
                            key={index}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke={item.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${(item.percentage / 100) * circumference} ${circumference}`}
                            strokeDashoffset={0}
                            className="transition-all duration-500 ease-in-out"
                            style={{
                                strokeDashoffset: `${(chartData.slice(0, index).reduce((sum, prev) => sum + prev.percentage, 0) / 100) * circumference}`
                            }}
                        />
                    ))}
                </svg>
                
                {/* Центральный текст */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">
                            {data.reduce((sum, item) => sum + item.value, 0)}
                        </div>
                        <div className="text-xs text-text-muted">позиций</div>
                    </div>
                </div>
            </div>
            
            {/* Легенда */}
            <div className="mt-4 space-y-2">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-text-primary font-medium">{item.label}</span>
                        <span className="text-text-muted">
                            {item.value} ({item.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
