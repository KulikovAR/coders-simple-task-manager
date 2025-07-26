export default function ApplicationLogo(props) {
    return (
        <div 
            {...props}
            className="text-xl font-bold text-white flex items-center gap-2"
            style={{ fontFamily: 'Consolas, monospace' }}
        >
            <span>379ТМ</span>
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">
                beta
            </span>
        </div>
    );
}
