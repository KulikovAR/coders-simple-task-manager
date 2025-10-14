export default function ApplicationLogoSeo(props) {
    return (
        <div
            {...props}
            className="text-xl font-bold text-text-primary flex items-center gap-2"
            style={{ fontFamily: 'Consolas, monospace' }}
        >
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:ital,wght@0,400..700&display=swap');
            </style>
            <svg width="100" height="20" viewBox="0 0 406 98" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 379 часть */}
                <path d="M13.999 14.0091V0.0101531H55.9959V14.0091H69.9949V42.0071H55.9959V56.0061H69.9949V84.0041H55.9959V98.003H13.999V84.0041H0V70.0051H13.999V84.0041H55.9959V56.0061H27.998V42.0071H55.9959V14.0091H13.999V28.0081H0V14.0091H13.999ZM83.9939 14.0091V0.0101531H153.989V28.0081H139.99V56.0061H125.991V98.003H111.992V56.0061H125.991V28.0081H139.99V14.0091H83.9939ZM181.987 14.0091V0.0101531H223.984V14.0091H237.983V84.0041H223.984V98.003H181.987V84.0041H223.984V70.0051H181.987V56.0061H167.988V14.0091H181.987ZM223.984 56.0061V14.0091H181.987V56.0061H223.984Z" fill="currentColor"/>
                {/* SEO текст - точно такие же пропорции как 379TM */}
                <text x="252" y="80" fill="currentColor" 
                      style={{ 
                          fontFamily: 'Pixelify Sans, Consolas, "Courier New", monospace', 
                          fontSize: '70px', 
                          fontWeight: '700',
                          letterSpacing: '-1px'
                      }}>SEO</text>
            </svg>

        </div>
    );
}

