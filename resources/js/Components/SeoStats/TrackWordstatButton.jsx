import { useState } from 'react';
import { useWordstatRecognition } from '@/hooks/useWordstatRecognition';
import RecognitionConfirmationModal from './RecognitionConfirmationModal';

export default function TrackWordstatButton({ siteId, size = 'default', initialData = null }) {
    const { wordstatStatus, startWordstatRecognition } = useWordstatRecognition(siteId, initialData);
    const [isStarting, setIsStarting] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
        const baseClasses = 'rounded-lg transition-colors flex items-center gap-2';

        if (size === 'small') {
            return `${baseClasses} px-3 py-1.5 text-xs font-medium`;
        }

        return `${baseClasses} px-4 py-2 text-sm font-medium`;
    };

    const getIconSize = () => {
        return size === 'small' ? 'w-3 h-3' : 'w-4 h-4';
    };

    if (wordstatStatus.status === 'pending' || wordstatStatus.status === 'processing' || isStarting) {
        const progress = wordstatStatus.progressPercentage || 0;

        return (
            <button
                disabled
                className={`${getButtonClasses()} bg-gray-400 text-white cursor-not-allowed`}
                title={`${progress}%`}
            >
                <div className={`${getIconSize()} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
                {`${progress}%`}
            </button>
        );
    }

    if (wordstatStatus.status === 'failed') {
        return (
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-red-500 text-white hover:bg-red-600`}
                title="Повторить парсинг Wordstat"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Повторить
            </button>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-blue-500 text-white hover:bg-blue-600`}
                title="Запустить парсинг Wordstat"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Wordstat
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
