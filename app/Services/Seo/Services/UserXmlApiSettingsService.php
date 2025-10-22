<?php

namespace App\Services\Seo\Services;

use App\Models\UserXmlApiSettings;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserXmlApiSettingsService
{
    public function getSettings(): ?UserXmlApiSettings
    {
        $user = Auth::user();
        
        if (!$user) {
            return null;
        }
        
        return $user->xmlApiSettings;
    }

    public function createOrUpdateSettings(array $data): UserXmlApiSettings
    {
        $user = Auth::user();
        
        if (!$user) {
            throw new \Exception('User not authenticated');
        }
        
        return UserXmlApiSettings::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );
    }

    public function getGoogleApiData(): array
    {
        $settings = $this->getSettings();
        
        if (!$settings) {
            return [
                'baseUrl' => '',
                'userId' => '',
                'apiKey' => ''
            ];
        }

        return [
            'baseUrl' => $settings->xml_base_url ?? '',
            'userId' => $settings->xml_user_id ?? '',
            'apiKey' => $settings->xml_api_key ?? ''
        ];
    }

    public function getWordstatApiData(): array
    {
        $settings = $this->getSettings();
        
        if (!$settings) {
            return [
                'baseUrl' => '',
                'userId' => '',
                'apiKey' => ''
            ];
        }

        return [
            'baseUrl' => $settings->xml_wordstat_base_url ?? '',
            'userId' => $settings->xml_wordstat_user_id ?? '',
            'apiKey' => $settings->xml_wordstat_api_key ?? ''
        ];
    }

    public function getSettingsForUser(int $userId): ?UserXmlApiSettings
    {
        return UserXmlApiSettings::where('user_id', $userId)->first();
    }

    public function getGoogleApiDataForUser(int $userId): array
    {
        $settings = $this->getSettingsForUser($userId);
        
        if (!$settings) {
            return [
                'baseUrl' => '',
                'userId' => '',
                'apiKey' => ''
            ];
        }

        return [
            'baseUrl' => $settings->xml_base_url ?? '',
            'userId' => $settings->xml_user_id ?? '',
            'apiKey' => $settings->xml_api_key ?? ''
        ];
    }

    public function getWordstatApiDataForUser(int $userId): array
    {
        $settings = $this->getSettingsForUser($userId);
        
        if (!$settings) {
            return [
                'baseUrl' => '',
                'userId' => '',
                'apiKey' => ''
            ];
        }

        return [
            'baseUrl' => $settings->xml_wordstat_base_url ?? '',
            'userId' => $settings->xml_wordstat_user_id ?? '',
            'apiKey' => $settings->xml_wordstat_api_key ?? ''
        ];
    }
}
