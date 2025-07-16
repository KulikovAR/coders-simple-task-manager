<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiResponse extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'success' => true,
            'data' => $this->resource,
            'message' => $this->message ?? 'Success',
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Create a success response.
     */
    public static function success($data = null, string $message = 'Success', int $status = 200): array
    {
        return [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];
    }

    /**
     * Create an error response.
     */
    public static function error(string $message = 'Error', int $status = 400, $errors = null): array
    {
        return [
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => now()->toISOString(),
        ];
    }
} 