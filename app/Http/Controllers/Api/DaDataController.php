<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DaDataService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DaDataController extends Controller
{
    private DaDataService $daDataService;

    public function __construct(DaDataService $daDataService)
    {
        $this->daDataService = $daDataService;
    }

    /**
     * Поиск стран
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchCountries(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:1|max:100'
        ]);

        $query = $request->input('query');
        $countries = $this->daDataService->searchCountries($query);

        return response()->json([
            'success' => true,
            'data' => $countries
        ]);
    }

    /**
     * Получить популярные страны
     *
     * @return JsonResponse
     */
    public function getPopularCountries(): JsonResponse
    {
        $countries = $this->daDataService->getPopularCountries();

        return response()->json([
            'success' => true,
            'data' => $countries
        ]);
    }
}
