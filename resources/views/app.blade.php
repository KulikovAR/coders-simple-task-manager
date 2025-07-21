<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', '379ТМ - Система управления задачами с ИИ-ассистентом') }}</title>

        <!-- SEO Meta Tags -->
        <meta name="description" content="Современная система управления задачами с уникальным ИИ-ассистентом. Управляйте проектами, спринтами и задачами на естественном языке. Создано для разработчиков.">
        <meta name="keywords" content="управление задачами, таск менеджер, ИИ ассистент, управление проектами, спринты, разработка, команда, продуктивность, Laravel, React">
        <meta name="author" content="379ТМ">
        <meta name="robots" content="index, follow">
        <meta name="language" content="ru">
        <meta name="revisit-after" content="7 days">
        
        <!-- Open Graph -->
        <meta property="og:title" content="379ТМ - Система управления задачами с ИИ-ассистентом">
        <meta property="og:description" content="Современная система управления задачами с уникальным ИИ-ассистентом. Управляйте проектами на естественном языке.">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ request()->url() }}">
        <meta property="og:image" content="{{ asset('og-image.jpg') }}">
        <meta property="og:site_name" content="379ТМ">
        <meta property="og:locale" content="ru_RU">
        
        <!-- Twitter Card -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="379ТМ - Система управления задачами с ИИ-ассистентом">
        <meta name="twitter:description" content="Современная система управления задачами с уникальным ИИ-ассистентом для разработчиков">
        <meta name="twitter:image" content="{{ asset('og-image.jpg') }}">
        
        <!-- Дополнительные SEO мета-теги -->
        <meta name="theme-color" content="#000000">
        <meta name="msapplication-TileColor" content="#000000">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <meta name="apple-mobile-web-app-title" content="379ТМ">
        
        <!-- Canonical URL -->
        <link rel="canonical" href="{{ request()->url() }}">
        
        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon-16x16.png') }}">
        
        <!-- Web App Manifest -->
        <link rel="manifest" href="{{ asset('manifest.json') }}">
        
        <!-- Preconnect для оптимизации -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        
        <!-- Структурированные данные -->
        <script type="application/ld+json">
        @php
        $structuredData = [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => '379ТМ',
            'description' => 'Система управления задачами с ИИ-ассистентом для разработчиков',
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web',
            'url' => request()->url(),
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'RUB',
                'availability' => 'https://schema.org/InStock'
            ],
            'author' => [
                '@type' => 'Organization',
                'name' => '379ТМ',
                'url' => request()->url()
            ],
            'aggregateRating' => [
                '@type' => 'AggregateRating',
                'ratingValue' => '4.8',
                'ratingCount' => '150'
            ],
            'featureList' => [
                'ИИ-ассистент с естественным языком',
                'Управление проектами и задачами',
                'Спринты и Agile методология',
                'Командная работа',
                'API для интеграций'
            ]
        ];
        @endphp
        {{ json_encode($structuredData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) }}
        </script>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
