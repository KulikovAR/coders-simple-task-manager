import { useState } from 'react';

export default function CollapsibleSection({ 
    title, 
    icon, 
    children, 
    defaultOpen = false,
    className = "",
    headerClassName = "",
    hasErrors = false,
    isValid = false
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const getStatusIcon = () => {
        if (hasErrors) {
            return (
                <svg className="w-4 h-4 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
        }
        if (isValid) {
            return (
                <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            );
        }
        return null;
    };

    return (
        <div className={`border border-border-color rounded-lg ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary-bg transition-colors rounded-t-lg ${
                    isOpen ? 'rounded-b-none border-b border-border-color' : 'rounded-lg'
                } ${headerClassName}`}
            >
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="flex-shrink-0">
                            {icon}
                        </div>
                    )}
                    <h4 className="text-lg font-semibold text-text-primary">
                        {title}
                    </h4>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <svg 
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            
            {isOpen && (
                <div className="px-4 py-4 bg-card-bg rounded-b-lg">
                    {children}
                </div>
            )}
        </div>
    );
}