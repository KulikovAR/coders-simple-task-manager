import { useState } from 'react';
import { useSeoRecognition } from '@/hooks/useSeoRecognition';

export default function TrackPositionsButton({ siteId, size = 'default' }) {
    const { recognitionStatus, startRecognition } = useSeoRecognition(siteId);
    const [isStarting, setIsStarting] = useState(false);

    const handleStartRecognition = async () => {
        setIsStarting(true);
        try {
            const result = await startRecognition();
            if (!result.success) {
                alert(result.message);
            }
        } finally {
            setIsStarting(false);
        }
    };

    const getButtonClasses = () => {
        const baseClasses = 'rounded-lg transition-colors flex items-center gap-2';
        
        if (size === 'small') {
            return `${baseClasses} px-3 py-1.5 text-xs font-medium`;
        }
        
        return `${baseClasses} px-4 py-2 text-sm font-medium`;
    };

    const getIconSize = () => {
        return size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
    };

    if (recognitionStatus.status === 'pending' || recognitionStatus.status === 'processing' || isStarting) {
        return (
            <button
                disabled
                className={`${getButtonClasses()} bg-gray-400 text-gray-200 cursor-not-allowed`}
                title="Снятие позиций в процессе..."
            >
                <div className={`${getIconSize()} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                {isStarting ? 'Запуск...' : (recognitionStatus.status === 'pending' ? 'Ожидание...' : 'Снятие позиций...')}
            </button>
        );
    }

    if (recognitionStatus.status === 'failed') {
        return (
            <button
                onClick={handleStartRecognition}
                className={`${getButtonClasses()} bg-red-500 text-white hover:bg-red-600`}
                title="Повторить снятие позиций"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Повторить
            </button>
        );
    }

    return (
        <button
            onClick={handleStartRecognition}
            className={`${getButtonClasses()} bg-accent-green text-white hover:bg-accent-green/90`}
            title="Снять позиции"
        >
            <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Снять позиции
        </button>
    );
}
