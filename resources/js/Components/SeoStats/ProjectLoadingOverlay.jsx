export default function ProjectLoadingOverlay({ 
    isVisible, 
    title = "Загрузка данных проекта", 
    subtitle = "Пожалуйста, подождите..." 
}) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-card-bg border border-border-color rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center">
                    {/* Анимированный логотип */}
                    <div className="relative mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        {/* Вращающиеся кольца */}
                        <div className="absolute -inset-2 border-2 border-accent-blue/20 rounded-2xl animate-spin"></div>
                        <div className="absolute -inset-1 border-2 border-transparent border-t-accent-purple rounded-2xl animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}












