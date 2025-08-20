import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Waves from '@/Components/Waves';

export default function Landing({ auth }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-page', 'Landing');
        setIsLoaded(true);
        return () => {
            document.body.removeAttribute('data-page');
        };
    }, []);

    const navClick = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <>
            <Head>
                <title>379ТМ — Таск‑менеджер класса Pro с ИИ</title>
                <meta name="description" content="Проекты, спринты, канбан‑доска, теги, дедлайны, комментарии с упоминаниями, email и Telegram‑уведомления. Плюс ИИ‑ассистент, который всё делает по вашей команде." />
                <meta name="keywords" content="таск менеджер, управление проектами, спринты, канбан, ИИ ассистент, уведомления, Telegram, email" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta property="og:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии и ИИ‑ассистент." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                <meta property="og:image" content="/og-image.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="379ТМ — Таск‑менеджер класса Pro с ИИ" />
                <meta name="twitter:description" content="Проекты, спринты, канбан, теги, дедлайны, комментарии и ИИ‑ассистент." />
                <meta name="twitter:image" content="/og-image.jpg" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "379ТМ",
                        "description": "Таск‑менеджер класса Pro с ИИ. Проекты, спринты, канбан, теги, дедлайны и уведомления.",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RUB" }
                    })}
                </script>
            </Head>

            <div className="min-h-screen bg-primary-bg text-text-primary relative overflow-hidden">
                <Waves
                    lineColor="rgba(0, 0, 0, 0.05)"
                    backgroundColor="transparent"
                    waveSpeedX={0.012}
                    waveSpeedY={0.006}
                    waveAmpX={22}
                    waveAmpY={12}
                    xGap={18}
                    yGap={48}
                    friction={0.94}
                    tension={0.006}
                    maxCursorMove={60}
                    style={{ zIndex: 1 }}
                />
                <header className={`fixed top-0 left-0 right-0 z-50 bg-primary-bg/80 backdrop-blur-xl border-b border-border-color transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <nav className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl font-semibold tracking-tight">379ТМ</div>
                                <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-accent-blue/20 text-accent-blue">beta</span>
                            </div>
                            <div className="hidden md:flex items-center gap-8 text-sm">
                                <button onClick={() => navClick('features')} className="text-text-secondary hover:text-text-primary transition-colors">Возможности</button>
                                <button onClick={() => navClick('how-it-works')} className="text-text-secondary hover:text-text-primary transition-colors">Как это работает</button>
                                <Link href={route('ai-features')} className="text-text-secondary hover:text-text-primary transition-colors">ИИ‑ассистент</Link>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">Поддержка</a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-accent-blue text-white px-4 py-2 rounded-full font-medium hover:bg-accent-blue/80 transition-colors">Открыть дашборд</Link>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href={route('login')} className="text-text-primary hover:text-text-secondary transition-colors">Вход</Link>
                                        <Link href={route('register')} className="bg-accent-blue text-white px-4 py-2 rounded-full font-medium hover:bg-accent-blue/80 transition-colors">Начать</Link>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 grid place-items-center rounded-lg border border-border-color hover:bg-secondary-bg transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
                            </button>
                        </div>
                        {isMobileMenuOpen && (
                            <div className="md:hidden mt-4 pt-4 border-t border-border-color flex flex-col gap-4">
                                <button onClick={() => { setIsMobileMenuOpen(false); navClick('features'); }} className="text-left text-text-secondary hover:text-text-primary">Возможности</button>
                                <button onClick={() => { setIsMobileMenuOpen(false); navClick('how-it-works'); }} className="text-left text-text-secondary hover:text-text-primary">Как это работает</button>
                                <Link href={route('ai-features')} className="text-text-secondary hover:text-text-primary">ИИ‑ассистент</Link>
                                <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary">Поддержка</a>
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-accent-blue text-white px-4 py-2 rounded-full text-center">Открыть дашборд</Link>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link href={route('login')} className="text-text-primary">Вход</Link>
                                        <Link href={route('register')} className="bg-accent-blue text-white px-4 py-2 rounded-full text-center">Начать</Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </header>

                <main className="relative pt-28">
                    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                        <div className={`max-w-4xl mx-auto text-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-bg/60 border border-border-color text-xs text-text-secondary mb-6">
                                <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                                с ИИ‑ассистентом
                            </div>
                            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
                                Таск‑менеджер с которым удобно
                            </h1>
                            <p className="text-xl md:text-2xl text-text-secondary mt-6">
                                Проекты, спринты, канбан‑доска, теги, дедлайны, комментарии с упоминаниями и
                                мгновенные уведомления в Email и Telegram. Плюс ИИ, который всё делает по команде.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                {auth.user ? (
                                    <Link href={route('dashboard')} className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-blue/80 transition-colors">Открыть дашборд</Link>
                                ) : (
                                    <>
                                        <Link href={route('register')} className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-blue/80 transition-colors">Начать</Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="features" className="max-w-7xl mx-auto px-6 py-8 md:py-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                // Иконки позаимствованы с /ai-features
                                { title: 'ИИ‑ассистент', desc: 'Создаёт проекты, задачи и спринты по вашей команде. Назначает исполнителей и меняет статусы.', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
                                { title: 'Спринты и планирование', desc: 'Создавайте и закрывайте спринты, контролируйте фокус и скорость команды.', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                { title: 'Канбан‑доска', desc: 'Статусы по проекту и по спринту. Двигайте задачи между колонками в один клик.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                                { title: 'Уведомления', desc: 'Email и Telegram: назначение, комментарии, перемещения между статусами, приоритеты.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { title: 'Комментарии и упоминания', desc: 'Rich‑text комментарии, упоминания участников и превью в уведомлениях.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
                                { title: 'Теги и фильтры', desc: 'Теги задач, быстрые фильтры по исполнителю, статусу, срокам и проекту.', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' },
                                { title: 'Дедлайны', desc: 'Напоминания о приближении и сигнал о просрочке — ничего не потеряется.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { title: 'Массовые операции', desc: 'Создание пачки задач, пакетные изменения статусов и приоритетов.', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                                { title: 'Командная работа', desc: 'Приглашения в проекты, роли участников и общий контекст.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
                            ].map((f, i) => (
                                <div key={i} className="group rounded-2xl border border-border-color bg-secondary-bg/40 p-6 hover:bg-secondary-bg/60 transition-colors">
                                    <div className="w-11 h-11 rounded-xl bg-accent-blue/15 text-accent-blue grid place-items-center mb-4">
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                                    </div>
                                    <div className="text-lg font-semibold mb-1">{f.title}</div>
                                    <div className="text-text-secondary">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="order-2 lg:order-1">
                                <div className="text-sm uppercase tracking-wider text-text-secondary mb-3">Как это работает</div>
                                <h2 className="text-3xl md:text-4xl font-semibold mb-6">Три шага к управлению без хаоса</h2>
                                <ul className="space-y-5 text-base">
                                    <li className="flex gap-4">
                                        <span className="mt-1 w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-xs">1</span>
                                        Создайте проект и определите статусы доски — общие для проекта или отдельные для спринта.
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="mt-1 w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-xs">2</span>
                                        Добавьте задачи с тегами и дедлайнами, назначьте исполнителей, обсудите детали в комментариях с упоминаниями.
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="mt-1 w-6 h-6 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-xs">3</span>
                                        Пусть ИИ‑ассистент делает рутину: создаёт спринты, назначает задачи и меняет статусы по вашей команде.
                                    </li>
                                </ul>
                                <div className="mt-8 flex gap-3">
                                    <Link href={route('ai-features')} className="px-5 py-3 rounded-xl border border-border-color hover:bg-secondary-bg transition-colors">Больше про ИИ</Link>
                                    {auth.user ? (
                                        <Link href={route('dashboard')} className="px-5 py-3 rounded-xl bg-accent-blue text-white hover:bg-accent-blue/80">Перейти на доску</Link>
                                    ) : (
                                        <Link href={route('register')} className="px-5 py-3 rounded-xl bg-accent-blue text-white hover:bg-accent-blue/80">Начать</Link>
                                    )}
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="rounded-2xl border border-border-color bg-secondary-bg/40 p-6">
                                    <div className="text-sm text-text-secondary mb-3">Пример диалога с ИИ</div>
                                    <div className="space-y-4">
                                        {[
                                            { me: 'Создай проект «Запуск релиза Q4».', ai: 'Готово! Проект создан.' },
                                            { me: 'Добавь спринт «Подготовка анонса» на следующую неделю.', ai: 'Спринт создан и привязан к проекту.' },
                                            { me: 'Создай 5 задач для «Контент‑плана» и назначь на меня.', ai: 'Создано 5 задач и назначено на вас.' },
                                            { me: 'Перемести «Анонс в Telegram» в статус «к выполнению».', ai: 'Задача перемещена.' }
                                        ].map((m, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-end">
                                                    <div className="max-w-[85%] rounded-xl bg-accent-blue text-white px-4 py-3 text-sm">{m.me}</div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-accent-blue/20 text-accent-blue grid place-items-center text-[10px]">ИИ</div>
                                                    <div className="max-w-[90%] rounded-xl border border-border-color bg-secondary-bg/60 px-4 py-3 text-sm">{m.ai}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="max-w-7xl mx-auto px-6 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="rounded-2xl border border-border-color bg-secondary-bg/40 p-6">
                                <div className="text-sm uppercase tracking-wider text-text-secondary mb-2">Интеграции</div>
                                <div className="text-lg font-semibold mb-2">Email и Telegram</div>
                                <div className="text-text-secondary">Уведомления о назначениях, комментариях, переносах и сроках приходят туда, где вы их точно увидите.</div>
                            </div>
                            <div className="rounded-2xl border border-border-color bg-secondary-bg/40 p-6">
                                <div className="text-sm uppercase tracking-wider text-text-secondary mb-2">Контроль сроков</div>
                                <div className="text-lg font-semibold mb-2">Напоминания о дедлайнах</div>
                                <div className="text-text-secondary">Автоматическая рассылка о приближении и просрочке сроков по задачам.</div>
                            </div>
                            <div className="rounded-2xl border border-border-color bg-secondary-bg/40 p-6">
                                <div className="text-sm uppercase tracking-wider text-text-secondary mb-2">Командная работа</div>
                                <div className="text-lg font-semibold mb-2">Участники проекта</div>
                                <div className="text-text-secondary">Приглашайте коллег, распределяйте роли и работайте в общем контексте.</div>
                            </div>
                        </div>
                    </section>

                    <section className="max-w-4xl mx-auto px-6 py-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-semibold">Готовы работать удобнее?</h2>
                        <p className="text-xl text-text-secondary mt-4">Попробуйте 379ТМ бесплатно — первый проект запустите за 2 минуты.</p>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-blue/80 transition-colors">Перейти в дашборд</Link>
                            ) : (
                                <>
                                    <Link href={route('register')} className="bg-accent-blue text-white px-8 py-4 rounded-full font-semibold hover:bg-accent-blue/80 transition-colors">Начать</Link>
                                    <Link href={route('login')} className="px-8 py-4 rounded-full font-semibold border border-border-color hover:bg-secondary-bg transition-colors">Войти</Link>
                                </>
                            )}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border-color py-10">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-text-secondary">© 2025 379ТМ</div>
                        <div className="flex items-center gap-6">
                            <Link href={route('ai-features')} className="text-text-secondary hover:text-text-primary transition-colors">ИИ‑ассистент</Link>
                            <Link href={route('faq')} className="text-text-secondary hover:text-text-primary transition-colors">FAQ</Link>
                            <a href="https://t.me/itteam379manager" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">Поддержка</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}


