export default function PrimaryButton({
    className = '',
    disabled,
    children,
    glitch = false,
    ...props
}) {
    return (
        <button
            {...props}
            className={`btn btn-primary ${glitch ? 'btn-glitch' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
