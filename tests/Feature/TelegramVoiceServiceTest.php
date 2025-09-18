<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\TelegramVoiceService;
use App\Services\VoiceToTextService;
use App\Services\TelegramService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramVoiceServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_voice_message_detection()
    {
        $voiceService = app(TelegramVoiceService::class);

        // Тест с голосовым сообщением
        $voiceMessage = [
            'message_id' => 123,
            'from' => ['id' => 456, 'first_name' => 'Test'],
            'chat' => ['id' => 789, 'type' => 'private'],
            'voice' => [
                'file_id' => 'test_file_id',
                'duration' => 30,
                'mime_type' => 'audio/ogg'
            ]
        ];

        $this->assertTrue($voiceService->isVoiceMessage($voiceMessage));

        // Тест с обычным сообщением
        $textMessage = [
            'message_id' => 124,
            'from' => ['id' => 456, 'first_name' => 'Test'],
            'chat' => ['id' => 789, 'type' => 'private'],
            'text' => 'Hello world'
        ];

        $this->assertFalse($voiceService->isVoiceMessage($textMessage));
    }

    public function test_get_voice_info()
    {
        $voiceService = app(TelegramVoiceService::class);

        $voiceMessage = [
            'message_id' => 123,
            'from' => ['id' => 456, 'first_name' => 'Test'],
            'chat' => ['id' => 789, 'type' => 'private'],
            'voice' => [
                'file_id' => 'test_file_id',
                'duration' => 30,
                'mime_type' => 'audio/ogg',
                'file_size' => 1024
            ]
        ];

        $voiceInfo = $voiceService->getVoiceInfo($voiceMessage);

        $this->assertNotNull($voiceInfo);
        $this->assertEquals('test_file_id', $voiceInfo['file_id']);
        $this->assertEquals(30, $voiceInfo['duration']);
        $this->assertEquals('audio/ogg', $voiceInfo['mime_type']);
        $this->assertEquals(1024, $voiceInfo['file_size']);
    }

    public function test_voice_info_with_non_voice_message()
    {
        $voiceService = app(TelegramVoiceService::class);

        $textMessage = [
            'message_id' => 124,
            'from' => ['id' => 456, 'first_name' => 'Test'],
            'chat' => ['id' => 789, 'type' => 'private'],
            'text' => 'Hello world'
        ];

        $voiceInfo = $voiceService->getVoiceInfo($textMessage);

        $this->assertNull($voiceInfo);
    }

    public function test_voice_to_text_service_supported_formats()
    {
        $voiceService = app(VoiceToTextService::class);

        $supportedFormats = [
            'audio/ogg',
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/webm'
        ];

        foreach ($supportedFormats as $format) {
            $this->assertTrue($voiceService->isSupportedFormat($format));
        }

        $unsupportedFormats = [
            'audio/flac',
            'video/mp4',
            'text/plain'
        ];

        foreach ($unsupportedFormats as $format) {
            $this->assertFalse($voiceService->isSupportedFormat($format));
        }
    }
}
