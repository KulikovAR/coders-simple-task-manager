import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function PieChart({ data = [] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-card-bg border border-border-color rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: data.payload.color }}
                        />
                        <span className="text-text-primary font-medium">{data.payload.label}</span>
                    </div>
                    <div className="text-text-muted text-sm">
                        {data.payload.value} позиций ({data.payload.percentage}%)
                    </div>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div className="mt-4 space-y-2">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-text-primary font-medium">{entry.payload.label}</span>
                        <span className="text-text-muted">
                            {entry.payload.value} ({entry.payload.percentage}%)
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-72 pt-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-text-primary mb-1">0</div>
                    <div className="text-sm text-text-muted">позиций</div>
                </div>
                <div className="mt-4 text-sm text-text-muted">Нет данных для отображения</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className="w-full h-72 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
