export default function FlashMessages({ flash = {} }) {
    if (!flash || Object.keys(flash).length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            {flash.success && (
                <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg text-accent-green">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium mb-1">Успешно!</h4>
                            <p className="text-sm">{flash.success}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.error && (
                <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg text-accent-red">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium mb-1">Ошибка</h4>
                            <p className="text-sm">{flash.error}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.warning && (
                <div className="p-4 bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg text-accent-yellow">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium mb-1">Внимание</h4>
                            <p className="text-sm">{flash.warning}</p>
                        </div>
                    </div>
                </div>
            )}

            {flash.info && (
                <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg text-accent-blue">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <h4 className="font-medium mb-1">Информация</h4>
                            <p className="text-sm">{flash.info}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
