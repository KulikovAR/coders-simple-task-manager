import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ApiBalanceDisplay({ balances = [], lazyLoad = false }) {
    const [lazyBalances, setLazyBalances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchBalances = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get('/api-balance', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (response.data.success) {
                setLazyBalances(response.data.data || []);
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            setError('Ошибка загрузки баланса');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lazyLoad) {
            fetchBalances();
        }
    }, [lazyLoad]);

    const formatBalance = (balance) => {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(balance);
    };

    const currentBalances = lazyLoad ? lazyBalances : balances;

    if (loading) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg">
                <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-text-muted">Загрузка...</span>
            </div>
        );
    }

    if (error) {
        return (
            <button
                onClick={fetchBalances}
                className="flex items-center gap-2 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg hover:bg-accent-blue/5 transition-colors"
                title="Обновить баланс"
            >
                <svg className="w-4 h-4 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm text-accent-red">Ошибка</span>
            </button>
        );
    }

    if (!currentBalances || currentBalances.length === 0) {
        return null;
    }

    const getProviderLogo = (provider) => {
        switch (provider) {
            case 'xmlriver':
                return (
                    <img
                        src="/images/xml-river-logo.png"
                        alt="XML River"
                        className="h-3 w-auto"
                    />
                );
            case 'xmlstock':
                return (
                    <img
                        src="/images/xml-stock-logo.png"
                        alt="XML Stock"
                        className="h-3 w-auto"
                    />
                );
            default:
                return (
                    <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                );
        }
    };

    return (
        <div className="flex items-center gap-3">
            {currentBalances.map((balance) => (
                <div
                    key={balance.provider}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg hover:bg-accent-blue/5 transition-colors"
                    title={`${balance.provider.toUpperCase()}: ${formatBalance(balance.balance)} руб.`}
                >
                    {getProviderLogo(balance.provider)}
                    <span className="text-sm font-medium text-text-primary">
                        {formatBalance(balance.balance)}
                    </span>
                    <span className="text-xs text-text-muted">₽</span>
                </div>
            ))}
            
            {lazyLoad && (
                <button
                    onClick={fetchBalances}
                    className="flex items-center gap-1 px-2 py-1 bg-secondary-bg border border-border-color rounded hover:bg-accent-blue/5 transition-colors"
                    title="Обновить баланс"
                >
                    <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
        </div>
    );
}
