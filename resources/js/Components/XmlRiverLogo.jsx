export default function XmlRiverLogo(props) {
    return (
        <div
            {...props}
            className="flex items-center gap-3"
        >
            {/* XML River Logo */}
            <div className="flex items-center gap-2">
                <img 
                    src="/images/xml-river-logo.png" 
                    alt="XML River" 
                    className="h-8 w-auto"
                />
            </div>
            
            {/* X Symbol */}
            <div className="flex items-center justify-center w-6 h-6 bg-accent-blue/20 rounded-full">
                <svg 
                    className="w-4 h-4 text-accent-blue" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M6 18L18 6M6 6l12 12" 
                    />
                </svg>
            </div>
            
            {/* 379SEO Logo */}
            <div className="flex items-center gap-2">
                <svg width="60" height="20" viewBox="0 0 490 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.999 14.0091V0.0101531H55.9959V14.0091H69.9949V42.0071H55.9959V56.0061H69.9949V84.0041H55.9959V98.003H13.999V84.0041H0V70.0051H13.999V84.0041H55.9959V56.0061H27.998V42.0071H55.9959V14.0091H13.999V28.0081H0V14.0091H13.999ZM83.9939 14.0091V0.0101531H153.989V28.0081H139.99V56.0061H125.991V98.003H111.992V56.0061H125.991V28.0081H139.99V14.0091H83.9939ZM181.987 14.0091V0.0101531H223.984V14.0091H237.983V84.0041H223.984V98.003H181.987V84.0041H223.984V70.0051H181.987V56.0061H167.988V14.0091H181.987ZM223.984 56.0061V14.0091H181.987V56.0061H223.984ZM265.981 14.0091V0.0101531H307.978V14.0091H321.977V28.0081H307.978V14.0091H265.981V42.0071H307.978V56.0061H321.977V84.0041H307.978V98.003H265.981V84.0041H251.982V70.0051H265.981V84.0041H307.978V56.0061H265.981V42.0071H251.982V14.0091H265.981ZM335.976 98.003V0.0101531H405.971V14.0091H349.975V42.0071H377.973V56.0061H349.975V84.0041H405.971V98.003H335.976ZM433.968 14.0091V0.0101531H475.965V14.0091H489.964V84.0041H475.965V98.003H433.968V84.0041H419.97V14.0091H433.968ZM475.965 84.0041V14.0091H433.968V84.0041H475.965Z" fill="currentColor"/>
                </svg>
            </div>
        </div>
    );
}
