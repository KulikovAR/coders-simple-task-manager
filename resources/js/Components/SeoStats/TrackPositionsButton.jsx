import { useState } from 'react';
import { useSeoRecognition } from '@/hooks/useSeoRecognition';
import RecognitionConfirmationModal from './RecognitionConfirmationModal';

export default function TrackPositionsButton({ siteId, size = 'default', initialData = null }) {
    const { recognitionStatus, startRecognition } = useSeoRecognition(siteId, initialData);
    const [isStarting, setIsStarting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleStartRecognition = async () => {
        setIsStarting(true);
        try {
            const result = await startRecognition();
            if (!result.success) {
                alert(result.message || result.error || 'Ошибка запуска распознавания');
            }
        } catch (error) {
            alert('Ошибка запуска распознавания');
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
        const progress = recognitionStatus.progressPercentage || 0;

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

    if (recognitionStatus.status === 'failed') {
        return (
            <button
                onClick={() => setShowModal(true)}
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
        <>
            <button
                onClick={() => setShowModal(true)}
                className={`${getButtonClasses()} bg-accent-green text-white hover:bg-accent-green/90`}
                title="Снять позиции"
            >
                <svg className={getIconSize()} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Снять позиции
            </button>

            <RecognitionConfirmationModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleStartRecognition}
                siteId={siteId}
                type="recognition"
            />
        </>
    );
}
