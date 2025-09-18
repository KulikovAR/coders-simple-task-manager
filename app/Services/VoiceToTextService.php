<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VoiceToTextService
{
    private ?string $openaiApiKey;
    private string $openaiApiUrl;

    public function __construct()
    {
        $this->openaiApiKey = config('services.openai.api_key');
        $this->openaiApiUrl = config('services.openai.api_url', 'https://api.openai.com/v1');
    }

    /**
     * Конвертировать голосовое сообщение в текст
     */
    public function convertVoiceToText(string $voiceFileUrl, string $fileId): string
    {
        try {
            // Скачиваем файл
            $tempFilePath = $this->downloadVoiceFile($voiceFileUrl, $fileId);
            
            // Конвертируем в формат, поддерживаемый Whisper
            $convertedFilePath = $this->convertToWhisperFormat($tempFilePath);
            
            // Отправляем в OpenAI Whisper API
            $text = $this->transcribeWithWhisper($convertedFilePath);
            
            // Очищаем временные файлы
            $this->cleanupTempFiles([$tempFilePath, $convertedFilePath]);
            
            return $text;
        } catch (Exception $e) {
            Log::error('Voice to text conversion failed', [
                'file_id' => $fileId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw new Exception('Не удалось обработать голосовое сообщение: ' . $e->getMessage());
        }
    }

    /**
     * Скачать голосовой файл из Telegram
     */
    private function downloadVoiceFile(string $voiceFileUrl, string $fileId): string
    {
        $tempDir = storage_path('app/temp/voice');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $tempFilePath = $tempDir . '/' . $fileId . '.ogg';
        
        $response = Http::timeout(30)->get($voiceFileUrl);
        
        if (!$response->successful()) {
            throw new Exception('Не удалось скачать голосовой файл');
        }

        file_put_contents($tempFilePath, $response->body());
        
        return $tempFilePath;
    }

    /**
     * Конвертировать файл в формат, поддерживаемый Whisper
     */
    private function convertToWhisperFormat(string $inputPath): string
    {
        $outputPath = str_replace('.ogg', '_converted.ogg', $inputPath);
        
        // Используем ffmpeg для конвертации
        $command = sprintf(
            'ffmpeg -i %s -f segment -segment_time 30 -c copy %s 2>&1',
            escapeshellarg($inputPath),
            escapeshellarg($outputPath)
        );
        
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);
        
        if ($returnCode !== 0) {
            Log::warning('FFmpeg conversion failed', [
                'command' => $command,
                'output' => implode("\n", $output),
                'return_code' => $returnCode
            ]);
            
            // Если конвертация не удалась, используем оригинальный файл
            copy($inputPath, $outputPath);
        }
        
        return $outputPath;
    }

    /**
     * Отправить файл в OpenAI Whisper API для транскрипции
     */
    private function transcribeWithWhisper(string $filePath): string
    {
        if (empty($this->openaiApiKey)) {
            throw new Exception('OpenAI API ключ не настроен');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->openaiApiKey,
        ])->attach('file', fopen($filePath, 'r'), basename($filePath))
        ->post($this->openaiApiUrl . '/audio/transcriptions', [
            'model' => 'whisper-1',
            'language' => 'ru', // Указываем русский язык для лучшего распознавания
            'response_format' => 'text'
        ]);

        if (!$response->successful()) {
            $errorBody = $response->body();
            Log::error('OpenAI Whisper API error', [
                'status' => $response->status(),
                'body' => $errorBody
            ]);
            throw new Exception('Ошибка OpenAI Whisper API: ' . $errorBody);
        }

        $text = trim($response->body());
        
        if (empty($text)) {
            throw new Exception('Не удалось распознать речь в голосовом сообщении');
        }

        Log::info('Voice transcription successful', [
            'text_length' => strlen($text),
            'text_preview' => Str::limit($text, 100)
        ]);

        return $text;
    }

    /**
     * Очистить временные файлы
     */
    private function cleanupTempFiles(array $filePaths): void
    {
        foreach ($filePaths as $filePath) {
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
    }

    /**
     * Проверить, поддерживается ли формат файла
     */
    public function isSupportedFormat(string $mimeType): bool
    {
        $supportedTypes = [
            'audio/ogg',
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/webm'
        ];

        return in_array($mimeType, $supportedTypes);
    }
}
