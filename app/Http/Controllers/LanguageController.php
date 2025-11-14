<?php

namespace App\Http\Controllers;

use App\Services\Seo\Services\LanguageService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LanguageController extends Controller
{
    private LanguageService $languageService;

    public function __construct(LanguageService $languageService)
    {
        $this->languageService = $languageService;
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string|max:100'
        ]);

        $query = $request->input('query', '');
        $limit = $request->input('limit', 50);

        if (empty($query)) {
            $languages = $this->languageService->getAll();
        } else {
            $languages = $this->languageService->searchByName($query, $limit);
        }

        return response()->json([
            'success' => true,
            'data' => $languages
        ]);
    }
}

