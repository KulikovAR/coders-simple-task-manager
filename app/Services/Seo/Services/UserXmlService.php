<?php

namespace App\Services\Seo\Services;

use Illuminate\Support\Facades\Auth;

class UserXmlService
{
    /**
     * Возвращает данные о XML сервере текущего пользователя
     *
     * @return array|null
     * [
     *   'server' => 'stock'|'river'|null,
     *   'api_key' => string|null,
     *   'user_id' => string|null,
     *   'base_url' => string|null
     * ]
     */
    public function getCurrentUserXmlServer(): ?array
    {
        $user = Auth::user();
        if (!$user || !$user->xmlApiSettings) {
            return null;
        }

        $settings = $user->xmlApiSettings;
        $server = null;

        if (str_contains($settings->xml_base_url, 'xmlstock.com')) {
            $server = 'stock';
        } elseif (str_contains($settings->xml_base_url, 'xmlriver.com')) {
            $server = 'river';
        }

        return [
            'server' => $server,
        ];
    }

    /**
     * Возвращает данные о сервере для Wordstat для текущего пользователя
     *
     * @return array|null
     * [
     *   'server' => 'stock'|'river'|null,
     *   'api_key' => string|null,
     *   'user_id' => string|null,
     *   'base_url' => string|null
     * ]
     */
    public function getCurrentUserWordstatXmlServer(): ?array
    {
        $user = Auth::user();
        if (!$user || !$user->xmlApiSettings) {
            return null;
        }

        $settings = $user->xmlApiSettings;
        $server = null;

        if (str_contains($settings->xml_wordstat_base_url, 'xmlstock.com')) {
            $server = 'stock';
        } elseif (str_contains($settings->xml_wordstat_base_url, 'xmlriver.com')) {
            $server = 'river';
        }

        return [
            'server' => $server,
        ];
    }
}