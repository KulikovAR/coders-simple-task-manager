import { useState, useEffect, useCallback, useRef } from 'react';

export function useSeoRecognition(siteId, initialData = null) {
    const [recognitionStatus, setRecognitionStatus] = useState(() => {
        if (initialData) {
            return {
                status: initialData.status,
                taskId: initialData.task_id,
                progressPercentage: initialData.progress_percentage || 0,
                totalKeywords: initialData.total_keywords || 0,
                processedKeywords: initialData.processed_keywords || 0,
                errorMessage: initialData.error_message,
                startedAt: initialData.started_at,
                completedAt: initialData.completed_at,
            };
        }
        return {
            status: 'none',
            taskId: null,
            progressPercentage: 0,
            totalKeywords: 0,
            processedKeywords: 0,
            errorMessage: null,
            startedAt: null,
            completedAt: null,
        };
    });
    const [isPolling, setIsPolling] = useState(() => {
        return initialData && (initialData.status === 'pending' || initialData.status === 'processing');
    });
    const previousStatusRef = useRef(initialData?.status || 'none');

    const checkStatus = useCallback(async () => {
        try {
            const response = await fetch(route('seo-stats.recognition-status', siteId), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            if (response.ok) {
                const data = await response.json();
                const previousStatus = previousStatusRef.current;
                
                setRecognitionStatus(data);
                
                if (data.status === 'none' || data.status === 'completed' || data.status === 'failed') {
                    setIsPolling(false);
                    
                    if (previousStatus === 'processing' && data.status === 'none') {
                        window.dispatchEvent(new CustomEvent('seo-recognition-completed', {
                            detail: { siteId }
                        }));
                    }
                }
                
                previousStatusRef.current = data.status;
            }
        } catch (error) {
            console.error('Error checking recognition status:', error);
            setIsPolling(false);
        }
    }, [siteId]);

    const startRecognition = useCallback(async () => {
        try {
            const response = await fetch(route('seo-stats.track-positions', siteId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            });

            const data = await response.json();

            if (data.success) {
                const newStatus = {
                    status: 'pending',
                    taskId: data.task_id,
                    progressPercentage: 0,
                    totalKeywords: 0,
                    processedKeywords: 0,
                    errorMessage: null,
                    startedAt: new Date().toISOString(),
                    completedAt: null,
                };
                setRecognitionStatus(newStatus);
                setIsPolling(true);
                return { success: true, message: data.message };
            } else {
                return { success: false, message: data.error || 'Ошибка запуска распознавания' };
            }
        } catch (error) {
            console.error('Error starting recognition:', error);
            return { success: false, message: 'Ошибка запуска распознавания' };
        }
    }, [siteId]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    useEffect(() => {
        if (isPolling) {
            const interval = setInterval(checkStatus, 1000);
            return () => clearInterval(interval);
        }
    }, [isPolling, checkStatus]);

    useEffect(() => {
        if (recognitionStatus.status === 'pending' || recognitionStatus.status === 'processing') {
            setIsPolling(true);
        }
    }, [recognitionStatus.status]);

    return {
        recognitionStatus,
        isPolling,
        startRecognition,
        checkStatus,
    };
}