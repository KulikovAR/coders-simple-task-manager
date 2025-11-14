import { useState, useEffect } from 'react';

export default function ScheduleSection({ siteData, setSiteData, errors }) {
    const [scheduleType, setScheduleType] = useState(siteData.schedule?.type || 'manual');
    const [time, setTime] = useState(siteData.schedule?.time || '09:00');
    const [selectedDays, setSelectedDays] = useState(siteData.schedule?.days || []);
    const [selectedMonthDays, setSelectedMonthDays] = useState(siteData.schedule?.monthDays || []);

    useEffect(() => {
        console.log('ScheduleSection: siteData.schedule changed:', siteData.schedule);
        if (siteData.schedule) {
            setScheduleType(siteData.schedule.type || 'manual');
            setTime(siteData.schedule.time || '09:00');
            setSelectedDays(siteData.schedule.days || []);
            setSelectedMonthDays(siteData.schedule.monthDays || []);
        } else {
            setScheduleType('manual');
            setTime('09:00');
            setSelectedDays([]);
            setSelectedMonthDays([]);
        }
    }, [siteData.schedule]);

    const weekDays = [
        { id: 1, name: 'Пн', label: 'Понедельник' },
        { id: 2, name: 'Вт', label: 'Вторник' },
        { id: 3, name: 'Ср', label: 'Среда' },
        { id: 4, name: 'Чт', label: 'Четверг' },
        { id: 5, name: 'Пт', label: 'Пятница' },
        { id: 6, name: 'Сб', label: 'Суббота' },
        { id: 7, name: 'Вс', label: 'Воскресенье' }
    ];

    const monthDays = Array.from({ length: 28 }, (_, i) => i + 1);

    const handleScheduleTypeChange = (type) => {
        console.log('ScheduleSection: changing schedule type to:', type);
        setScheduleType(type);
        let newSchedule = null;
        
        if (type === 'weekly') {
            newSchedule = { type: 'weekly', time, days: selectedDays };
        } else if (type === 'monthly') {
            newSchedule = { type: 'monthly', time, monthDays: selectedMonthDays };
        }
        
        console.log('ScheduleSection: setting new schedule:', newSchedule);
        setSiteData('schedule', newSchedule);
    };

    const handleTimeChange = (newTime) => {
        setTime(newTime);
        if (scheduleType !== 'manual') {
            const newSchedule = { ...siteData.schedule, time: newTime };
            setSiteData('schedule', newSchedule);
        }
    };

    const handleDayToggle = (dayId) => {
        const newDays = selectedDays.includes(dayId)
            ? selectedDays.filter(id => id !== dayId)
            : [...selectedDays, dayId];
        
        setSelectedDays(newDays);
        setSiteData('schedule', { type: 'weekly', time, days: newDays });
    };

    const handleMonthDayToggle = (day) => {
        let newMonthDays;
        
        if (selectedMonthDays.includes('*')) {
            // Если выбрано "Все", то убираем "*" и добавляем конкретный день
            newMonthDays = [day];
        } else {
            // Обычная логика добавления/удаления дня
            newMonthDays = selectedMonthDays.includes(day)
                ? selectedMonthDays.filter(d => d !== day)
                : [...selectedMonthDays, day];
        }
        
        setSelectedMonthDays(newMonthDays);
        setSiteData('schedule', { type: 'monthly', time, monthDays: newMonthDays });
    };

    const handleSelectAllMonthDays = () => {
        setSelectedMonthDays(['*']);
        setSiteData('schedule', { type: 'monthly', time, monthDays: ['*'] });
    };

    return (
        <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Расписание автозапуска
            </h4>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                    Тип расписания
                </label>
                <select
                    value={scheduleType}
                    onChange={(e) => handleScheduleTypeChange(e.target.value)}
                    className="w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors"
                >
                    <option value="manual">По требованию</option>
                    <option value="weekly">День недели</option>
                    <option value="monthly">День месяца</option>
                </select>
                <p className="text-xs text-text-muted mt-2">
                    Выберите когда автоматически запускать парсинг позиций
                </p>
                {errors?.schedule && <p className="text-accent-red text-sm mt-1">{errors.schedule}</p>}
            </div>

            {scheduleType !== 'manual' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                        Время запуска
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full px-4 py-3 border border-border-color rounded-lg bg-secondary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue transition-colors"
                    />
                </div>
            )}

            {scheduleType === 'weekly' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                        Дни недели
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => (
                            <button
                                key={day.id}
                                type="button"
                                onClick={() => handleDayToggle(day.id)}
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                    selectedDays.includes(day.id)
                                        ? 'bg-accent-blue text-white'
                                        : 'bg-secondary-bg text-text-primary border border-border-color hover:bg-accent-blue/10'
                                }`}
                                title={day.label}
                            >
                                {day.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {scheduleType === 'monthly' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-3">
                        Дни месяца
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAllMonthDays}
                            className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                selectedMonthDays.includes('*')
                                    ? 'bg-accent-green text-white'
                                    : 'bg-secondary-bg text-text-primary border border-border-color hover:bg-accent-green/10'
                            }`}
                            title="Выбрать все дни месяца"
                        >
                            Все
                        </button>
                        {monthDays.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleMonthDayToggle(day)}
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                    selectedMonthDays.includes(day) && !selectedMonthDays.includes('*')
                                        ? 'bg-accent-blue text-white'
                                        : 'bg-secondary-bg text-text-primary border border-border-color hover:bg-accent-blue/10'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
