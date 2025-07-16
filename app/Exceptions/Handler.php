<?php

namespace App\Exceptions;

use App\Http\Resources\ApiResponse;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Обработка API ошибок
        $this->renderable(function (Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return $this->handleApiException($e, $request);
            }
        });
    }

    /**
     * Handle API exceptions
     */
    protected function handleApiException(Throwable $e, Request $request)
    {
        if ($e instanceof ValidationException) {
            return response()->json(
                ApiResponse::error('Validation failed', 422, $e->errors()),
                422
            );
        }

        if ($e instanceof NotFoundHttpException) {
            return response()->json(
                ApiResponse::error('Resource not found', 404),
                404
            );
        }

        // Для других ошибок возвращаем общее сообщение
        $statusCode = 500;
        
        if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
            $statusCode = $e->getStatusCode();
        }
        
        return response()->json(
            ApiResponse::error(
                $statusCode === 500 ? 'Internal server error' : $e->getMessage(),
                $statusCode
            ),
            $statusCode
        );
    }
} 