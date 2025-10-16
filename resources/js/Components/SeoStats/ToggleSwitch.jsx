export default function ToggleSwitch({ 
    checked = false, 
    onChange, 
    disabled = false,
    label = '',
    description = '',
    icon = null
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="p-2 bg-accent-blue/10 rounded-lg">
                        {icon}
                    </div>
                )}
                <div>
                    {label && (
                        <h5 className="font-medium text-text-primary">{label}</h5>
                    )}
                    {description && (
                        <p className="text-sm text-text-muted">{description}</p>
                    )}
                </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange?.(e.target.checked)}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className={`
                    w-11 h-6 rounded-full transition-all duration-200 ease-in-out
                    ${checked 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                    }
                    ${disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-md'
                    }
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20
                `}>
                    <div className={`
                        absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm
                        transition-transform duration-200 ease-in-out
                        ${checked 
                            ? 'bg-blue-200 translate-x-5' 
                            : 'bg-blue-200 translate-x-0'
                        }
                    `} />
                </div>
            </label>
        </div>
    );
}
