import { useSeoRecognition } from '@/hooks/useSeoRecognition';
import { useEffect } from 'react';

export default function RecognitionStatus({ siteId, onComplete }) {
    const { recognitionStatus, isPolling, startRecognition } = useSeoRecognition(siteId);

    useEffect(() => {
        const handleRecognitionCompleted = (event) => {
            if (event.detail.siteId === siteId && onComplete) {
                onComplete();
            }
        };

        window.addEventListener('seo-recognition-completed', handleRecognitionCompleted);
        
        return () => {
            window.removeEventListener('seo-recognition-completed', handleRecognitionCompleted);
        };
    }, [siteId, onComplete]);

    const handleStartRecognition = async () => {
        const result = await startRecognition();
        if (result.success) {
            console.log(result.message);
        } else {
            alert(result.message);
        }
    };


    if (recognitionStatus.status === 'none') {
        return null;
    }

    if (recognitionStatus.status === 'pending' || recognitionStatus.status === 'processing') {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-8 text-center mb-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-accent-blue/20 border-t-accent-blue rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-accent-blue animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Снятие позиций</h3>
                <p className="text-text-muted">Пожалуйста, подождите...</p>
            </div>
        );
    }

    if (recognitionStatus.status === 'failed') {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-6 mb-6">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Ошибка снятия позиций</h3>
                    <p className="text-text-muted mb-4">
                        {recognitionStatus.errorMessage || 'Произошла ошибка при обработке'}
                    </p>
                    <button
                        onClick={handleStartRecognition}
                        className="bg-accent-green text-white px-4 py-2 rounded-lg hover:bg-accent-green/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    if (recognitionStatus.status === 'completed' && onComplete) {
        return (
            <div className="bg-card-bg border border-border-color rounded-xl p-6 mb-6">
                <div className="text-center">
                    <div className="text-green-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Снятие позиций завершено</h3>
                    <p className="text-text-muted mb-4">Данные успешно обновлены</p>
                    <button
                        onClick={onComplete}
                        className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors flex items-center gap-2 mx-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Обновить данные
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
