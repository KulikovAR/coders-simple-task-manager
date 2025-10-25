import { useState } from 'react';
import axios from 'axios';

export default function RecognitionConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    siteId, 
    type = 'recognition' // 'recognition' или 'wordstat'
}) {
    const [costData, setCostData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCost = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const endpoint = type === 'wordstat' 
                ? `/seo-stats/${siteId}/wordstat-cost`
                : `/seo-stats/${siteId}/recognition-cost`;
                
            const response = await axios.get(endpoint);
            
            if (response.data.success) {
                setCostData(response.data.cost_calculation);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('Ошибка загрузки данных о стоимости');
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        if (isOpen && !costData && !loading) {
            fetchCost();
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const formatCost = (cost) => {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(cost);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-card-bg border border-border-color rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                        {type === 'wordstat' ? 'Подтверждение парсинга Wordstat' : 'Подтверждение распознавания'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {handleOpen()}

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-text-muted">Расчет стоимости...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <div className="text-accent-red mb-4">{error}</div>
                        <button
                            onClick={fetchCost}
                            className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                        >
                            Повторить
                        </button>
                    </div>
                )}

                {costData && costData.success && (
                    <div className="space-y-4">
                        <div className="bg-secondary-bg border border-border-color rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">
                                    {type === 'wordstat' ? 'Стоимость Wordstat:' : 'Стоимость распознавания:'}
                                </span>
                                <span className={`text-lg font-semibold ${costData.has_enough_balance ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {formatCost(costData.total_cost)} ₽
                                </span>
                            </div>
                            
                            {type === 'recognition' && (
                                <div className="text-xs text-text-muted bg-card-bg p-2 rounded">
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Максимальная стоимость запроса, может быть меньше
                                </div>
                            )}

                            {type === 'wordstat' && (
                                <div className="text-xs text-text-muted bg-card-bg p-2 rounded">
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Максимальная стоимость запроса, может быть меньше
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">
                                    {type === 'wordstat' ? 'Баланс xmlriver:' : 'Баланс:'}
                                </span>
                                <span className={`text-sm font-medium ${costData.has_enough_balance ? 'text-accent-green' : 'text-accent-red'}`}>
                                    {formatCost(costData.balance)} ₽
                                </span>
                            </div>

                            {!costData.has_enough_balance && (
                                <div className="text-xs text-accent-red bg-accent-red/10 p-2 rounded border border-accent-red/20">
                                    <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Недостаточно средств на балансе
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-border-color text-text-primary rounded-lg hover:bg-secondary-bg transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!costData.has_enough_balance}
                                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                                    costData.has_enough_balance
                                        ? 'bg-accent-green text-white hover:bg-accent-green/90'
                                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {type === 'wordstat' ? 'Запустить парсинг' : 'Запустить распознавание'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
