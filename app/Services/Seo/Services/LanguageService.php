<?php

namespace App\Services\Seo\Services;

use App\Enums\LanguageType;

class LanguageService
{
    public function searchByName(string $query, int $limit = 20): array
    {
        $query = mb_strtolower(trim($query));
        $items = [];
        foreach (LanguageType::cases() as $case) {
            $name = $case->label();
            if (mb_stripos($name, $query) !== false) {
                $items[] = [
                    'code' => $case->value,
                    'name' => $name,
                ];
            }
        }
        
        usort($items, function ($a, $b) use ($query) {
            $posA = mb_stripos($a['name'], $query);
            $posB = mb_stripos($b['name'], $query);
            if ($posA === $posB) {
                return strcmp($a['name'], $b['name']);
            }
            return $posA <=> $posB;
        });
        
        return array_slice($items, 0, $limit);
    }
    
    public function getAll(): array
    {
        $result = [];
        foreach (LanguageType::cases() as $case) {
            $result[] = [
                'code' => $case->value,
                'name' => $case->label(),
            ];
        }
        
        return $result;
    }
    
    public function findByCode(string $code): ?array
    {
        foreach (LanguageType::cases() as $case) {
            if ($case->value === $code) {
                return [
                    'code' => $case->value,
                    'name' => $case->label(),
                ];
            }
        }
        return null;
    }
}
