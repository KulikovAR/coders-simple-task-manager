import { useEffect } from 'react';

export default function YandexMetrika() {
    useEffect(() => {
        // Проверяем, что мы в браузере
        if (typeof window === 'undefined') return;

        // Проверяем, что скрипт еще не загружен
        const existingScript = document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]');
        if (existingScript) return;

        // Создаем и добавляем скрипт Яндекс.Метрики
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.innerHTML = `
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=103961701', 'ym');

            ym(103961701, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
        `;
        
        document.head.appendChild(script);

        // Добавляем noscript для случаев, когда JavaScript отключен
        const noscript = document.createElement('noscript');
        noscript.innerHTML = '<div><img src="https://mc.yandex.ru/watch/103961701" style="position:absolute; left:-9999px;" alt="" /></div>';
        document.body.appendChild(noscript);

        // Очистка при размонтировании компонента
        return () => {
            const scripts = document.querySelectorAll('script[src*="mc.yandex.ru/metrika/tag.js"]');
            scripts.forEach(script => script.remove());
            
            const noscripts = document.querySelectorAll('noscript');
            noscripts.forEach(noscript => {
                if (noscript.innerHTML.includes('mc.yandex.ru/watch')) {
                    noscript.remove();
                }
            });
        };
    }, []);

    return null; // Компонент не рендерит ничего видимого
}
