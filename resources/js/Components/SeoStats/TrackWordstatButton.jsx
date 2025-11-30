import { useState, useRef, useEffect } from 'react';
import { useWordstatRecognition } from '@/hooks/useWordstatRecognition';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import RecognitionConfirmationModal from './RecognitionConfirmationModal';
import Tooltip from '@/Components/SeoStats/Tooltip';

export default function TrackWordstatButton({ siteId, size = 'default', initialData = null }) {
    const { wordstatStatus, startWordstatRecognition } = useWordstatRecognition(siteId, initialData);
    const [isStarting, setIsStarting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const tooltipRef = useRef(null);

    useEffect(() => {
        tooltipRef.current = new Tooltip();
        return () => tooltipRef.current?.hide();
    }, []);

    const showHighloadWarning = () => {
        if (wordstatStatus.xmlServer === 'stock' && wordstatStatus.stockHighload) {
            return 'Сервис XMLStock временно нагружен';
        }
        if (wordstatStatus.xmlServer === 'river' && wordstatStatus.riverHighload) {
            return 'Сервис XMLRiver временно нагружен';
        }
        return null;
    };

    const highloadMessage = showHighloadWarning();

    const handleStartWordstatRecognition = async () => {
        setIsStarting(true);
        try {
            const result = await startWordstatRecognition();
            if (!result.success) {
                alert(result.message || result.error || 'Ошибка запуска парсинга Wordstat');
            }
        } catch (error) {
            alert('Ошибка запуска парсинга Wordstat');
        } finally {
            setIsStarting(false);
        }
    };

    const getButtonClasses = () => {
        const baseClasses = 'rounded-lg transition-colors flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-border-color';

        return baseClasses;
    };

    const getIconSize = () => {
        return size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
    };

    if (wordstatStatus.status === 'pending' || wordstatStatus.status === 'processing' || isStarting) {
        const progress = wordstatStatus.progressPercentage || 0;

        return (
            <button
                disabled
                className={`${getButtonClasses()} bg-transparent text-text-muted cursor-not-allowed relative opacity-50`}
                title={`${progress}%`}
            >
                <div className={`${getIconSize()} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                {`${progress}%`}

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>
        );
    }

    if (wordstatStatus.status === 'failed') {
        return (
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-transparent text-red-500 hover:bg-red-50 border-red-500 relative`}
                title="Повторить парсинг Wordstat"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Повторить

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-transparent text-text-primary hover:bg-secondary-bg relative`}
                title="Запустить парсинг Wordstat"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Wordstat

                {highloadMessage && (
                    <ExclamationTriangleIcon
                        className="w-4 h-4 text-yellow-400 absolute -top-2 -right-2 cursor-pointer"
                        onMouseEnter={(e) => tooltipRef.current.show({
                            x: e.clientX,
                            y: e.clientY,
                            url: highloadMessage
                        })}
                        onMouseLeave={() => tooltipRef.current.hide()}
                    />
                )}
            </button>

            <RecognitionConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleStartWordstatRecognition}
                siteId={siteId}
                type="wordstat"
            />
        </>
    );
}
