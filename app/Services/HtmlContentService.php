<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use DOMDocument;
use DOMElement;
use Exception;

class HtmlContentService
{
    /**
     * Максимальный размер изображения в байтах (5MB)
     */
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    /**
     * Разрешенные типы изображений
     */
    const ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];

    /**
     * Разрешенные HTML теги
     */
    const ALLOWED_HTML_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'img',
        'div', 'span'
    ];

    /**
     * Разрешенные HTML атрибуты
     */
    const ALLOWED_HTML_ATTRIBUTES = [
        'href', 'src', 'alt', 'title', 'class', 'style',
        'width', 'height', 'target', 'rel'
    ];

    /**
     * Обрабатывает HTML контент: очищает, загружает изображения и возвращает безопасный HTML
     */
    public function processContent(string $htmlContent, array $options = []): array
    {
        try {
            // Очищаем HTML от потенциально опасных тегов и атрибутов
            $cleanHtml = $this->sanitizeHtml($htmlContent);

            // Извлекаем изображения из HTML
            $images = $this->extractImagesFromHtml($cleanHtml);

            // Обрабатываем изображения (загружаем в хранилище)
            $processedImages = $this->processImages($images, $options);

                    // Обновляем HTML с новыми путями к изображениям
        $finalHtml = $this->updateImagePaths($cleanHtml, $processedImages);
        
        // Логируем для отладки
        Log::info('HTML content processed', [
            'original_length' => strlen($htmlContent),
            'final_length' => strlen($finalHtml),
            'images_count' => count($processedImages),
            'has_base64' => strpos($finalHtml, 'data:image') !== false
        ]);

            return [
                'html' => $finalHtml,
                'images' => $processedImages,
                'original_html' => $htmlContent,
                'processed_at' => now()
            ];
        } catch (Exception $e) {
            Log::error('Error processing HTML content: ' . $e->getMessage());
            
            return [
                'html' => $this->sanitizeHtml($htmlContent),
                'images' => [],
                'original_html' => $htmlContent,
                'error' => 'Ошибка обработки контента: ' . $e->getMessage(),
                'processed_at' => now()
            ];
        }
    }

    /**
     * Очищает HTML от потенциально опасных элементов
     */
    public function sanitizeHtml(string $html): string
    {
        if (empty($html)) {
            return '';
        }

        // Создаем DOM документ
        $dom = new DOMDocument();
        
        // Подавляем предупреждения о невалидном HTML
        libxml_use_internal_errors(true);
        
        // Загружаем HTML
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        
        // Очищаем ошибки
        libxml_clear_errors();

        // Очищаем DOM от нежелательных элементов
        $this->cleanDom($dom);

        // Получаем очищенный HTML
        $cleanHtml = $dom->saveHTML();
        
        // Убираем лишние теги и кодировку
        $cleanHtml = preg_replace('/<\?xml[^>]*>/', '', $cleanHtml);
        $cleanHtml = preg_replace('/<!DOCTYPE[^>]*>/', '', $cleanHtml);
        $cleanHtml = trim($cleanHtml);

        return $cleanHtml;
    }

    /**
     * Очищает DOM от нежелательных элементов
     */
    private function cleanDom(DOMDocument $dom): void
    {
        $xpath = new \DOMXPath($dom);
        
        // Удаляем все скрипты
        $scripts = $xpath->query('//script');
        foreach ($scripts as $script) {
            $script->parentNode->removeChild($script);
        }

        // Удаляем все iframe
        $iframes = $xpath->query('//iframe');
        foreach ($iframes as $iframe) {
            $iframe->parentNode->removeChild($iframe);
        }

        // Удаляем все объекты
        $objects = $xpath->query('//object');
        foreach ($objects as $object) {
            $object->parentNode->removeChild($object);
        }

        // Удаляем все embed
        $embeds = $xpath->query('//embed');
        foreach ($embeds as $embed) {
            $embed->parentNode->removeChild($embed);
        }

        // Удаляем все формы
        $forms = $xpath->query('//form');
        foreach ($forms as $form) {
            $form->parentNode->removeChild($form);
        }

        // Удаляем все input
        $inputs = $xpath->query('//input');
        foreach ($inputs as $input) {
            $input->parentNode->removeChild($input);
        }

        // Удаляем все button
        $buttons = $xpath->query('//button');
        foreach ($buttons as $button) {
            $button->parentNode->removeChild($button);
        }

        // Очищаем атрибуты у оставшихся элементов
        $this->cleanAttributes($dom);
    }

    /**
     * Очищает атрибуты у элементов
     */
    private function cleanAttributes(DOMDocument $dom): void
    {
        $xpath = new \DOMXPath($dom);
        $elements = $xpath->query('//*');

        foreach ($elements as $element) {
            /** @var \DOMElement $element */
            $attributes = $element->attributes;
            if ($attributes) {
                $attributesToRemove = [];
                
                foreach ($attributes as $attribute) {
                    /** @var \DOMAttr $attribute */
                    $attrName = $attribute->name;
                    $attrValue = $attribute->value;
                    
                    // Удаляем опасные атрибуты
                    if (in_array($attrName, ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'])) {
                        $attributesToRemove[] = $attrName;
                        continue;
                    }
                    
                    // Удаляем javascript: ссылки
                    if ($attrName === 'href' && strpos($attrValue, 'javascript:') === 0) {
                        $attributesToRemove[] = $attrName;
                        continue;
                    }
                    
                    // Удаляем data: ссылки (кроме изображений)
                    if ($attrName === 'src' && strpos($attrValue, 'data:') === 0 && !$this->isValidDataUrl($attrValue)) {
                        $attributesToRemove[] = $attrName;
                        continue;
                    }
                    
                    // Оставляем только разрешенные атрибуты
                    if (!in_array($attrName, self::ALLOWED_HTML_ATTRIBUTES)) {
                        $attributesToRemove[] = $attrName;
                    }
                }
                
                // Удаляем нежелательные атрибуты
                foreach ($attributesToRemove as $attrName) {
                    $element->removeAttribute($attrName);
                }
            }
        }
    }

    /**
     * Проверяет валидность data URL для изображений
     */
    private function isValidDataUrl(string $dataUrl): bool
    {
        if (preg_match('/^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/', $dataUrl)) {
            $base64Data = substr($dataUrl, strpos($dataUrl, ',') + 1);
            return base64_decode($base64Data, true) !== false;
        }
        return false;
    }

    /**
     * Извлекает изображения из HTML
     */
    private function extractImagesFromHtml(string $html): array
    {
        $images = [];
        
        if (empty($html)) {
            return $images;
        }

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $imgElements = $xpath->query('//img');

        foreach ($imgElements as $img) {
            /** @var \DOMElement $img */
            $src = $img->getAttribute('src');
            if ($src) {
                $images[] = [
                    'src' => $src,
                    'alt' => $img->getAttribute('alt') ?? '',
                    'title' => $img->getAttribute('title') ?? '',
                    'width' => $img->getAttribute('width') ?? '',
                    'height' => $img->getAttribute('height') ?? '',
                    'element' => $img
                ];
            }
        }

        return $images;
    }

    /**
     * Обрабатывает изображения: загружает в хранилище и возвращает информацию
     */
    private function processImages(array $images, array $options = []): array
    {
        $processedImages = [];
        $storagePath = $options['storage_path'] ?? 'html-content-images';
        $disk = $options['disk'] ?? 'public';

        foreach ($images as $image) {
            $src = $image['src'];
            
            try {
                if (strpos($src, 'data:') === 0) {
                    // Обрабатываем base64 изображения
                    $processedImage = $this->processBase64Image($src, $storagePath, $disk);
                } elseif (strpos($src, 'http') === 0) {
                    // Обрабатываем внешние изображения (скачиваем)
                    $processedImage = $this->processExternalImage($src, $storagePath, $disk);
                } else {
                    // Оставляем локальные изображения как есть
                    $processedImage = $image;
                }
                
                if ($processedImage) {
                    $processedImages[] = $processedImage;
                }
            } catch (Exception $e) {
                Log::warning('Failed to process image: ' . $src . ' - ' . $e->getMessage());
                // Оставляем оригинальное изображение
                $processedImages[] = $image;
            }
        }

        return $processedImages;
    }

    /**
     * Обрабатывает base64 изображения
     */
    private function processBase64Image(string $dataUrl, string $storagePath, string $disk): ?array
    {
        if (!preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
            return null;
        }

        $imageType = $matches[1];
        $base64Data = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $imageData = base64_decode($base64Data, true);

        if ($imageData === false) {
            return null;
        }

        // Проверяем размер
        if (strlen($imageData) > self::MAX_IMAGE_SIZE) {
            throw new Exception('Изображение слишком большое. Максимальный размер: ' . (self::MAX_IMAGE_SIZE / 1024 / 1024) . 'MB');
        }

        // Генерируем уникальное имя файла
        $filename = Str::uuid() . '.' . $imageType;
        $filePath = $storagePath . '/' . $filename;

        // Сохраняем файл
        if (Storage::disk($disk)->put($filePath, $imageData)) {
            return [
                'original_src' => $dataUrl,
                'new_src' => Storage::disk($disk)->url($filePath),
                'filename' => $filename,
                'file_path' => $filePath,
                'size' => strlen($imageData),
                'type' => 'image/' . $imageType,
                'processed' => true
            ];
        }

        return null;
    }

    /**
     * Обрабатывает внешние изображения (скачивает их)
     */
    private function processExternalImage(string $url, string $storagePath, string $disk): ?array
    {
        try {
            $imageData = file_get_contents($url);
            
            if ($imageData === false) {
                return null;
            }

            // Проверяем размер
            if (strlen($imageData) > self::MAX_IMAGE_SIZE) {
                throw new Exception('Изображение слишком большое. Максимальный размер: ' . (self::MAX_IMAGE_SIZE / 1024 / 1024) . 'MB');
            }

            // Определяем тип изображения
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->buffer($imageData);
            
            if (!in_array($mimeType, self::ALLOWED_IMAGE_TYPES)) {
                throw new Exception('Неподдерживаемый тип изображения: ' . $mimeType);
            }

            // Получаем расширение
            $extension = $this->getExtensionFromMimeType($mimeType);
            
            // Генерируем уникальное имя файла
            $filename = Str::uuid() . '.' . $extension;
            $filePath = $storagePath . '/' . $filename;

            // Сохраняем файл
            if (Storage::disk($disk)->put($filePath, $imageData)) {
                return [
                    'original_src' => $url,
                    'new_src' => Storage::disk($disk)->url($filePath),
                    'filename' => $filename,
                    'file_path' => $filePath,
                    'size' => strlen($imageData),
                    'type' => $mimeType,
                    'processed' => true
                ];
            }

            return null;
        } catch (Exception $e) {
            Log::warning('Failed to download external image: ' . $url . ' - ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Получает расширение файла по MIME типу
     */
    private function getExtensionFromMimeType(string $mimeType): string
    {
        $extensions = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp',
            'image/svg+xml' => 'svg'
        ];

        return $extensions[$mimeType] ?? 'jpg';
    }

    /**
     * Обновляет пути к изображениям в HTML
     */
    private function updateImagePaths(string $html, array $processedImages): string
    {
        if (empty($processedImages)) {
            return $html;
        }

        foreach ($processedImages as $image) {
            if (isset($image['original_src']) && isset($image['new_src'])) {
                $html = str_replace($image['original_src'], $image['new_src'], $html);
            }
        }

        return $html;
    }

    /**
     * Безопасно обновляет существующий HTML контент
     * Сохраняет уже загруженные изображения и обрабатывает новые
     */
    public function updateContent(string $newHtml, string $existingHtml, array $options = []): array
    {
        try {
            // Очищаем новый HTML
            $cleanNewHtml = $this->sanitizeHtml($newHtml);
            
            // Извлекаем изображения из нового HTML
            $newImages = $this->extractImagesFromHtml($cleanNewHtml);
            
            // Извлекаем изображения из существующего HTML
            $existingImages = $this->extractImagesFromHtml($existingHtml);
            
            // Определяем, какие изображения уже существуют
            $existingImageUrls = array_column($existingImages, 'new_src');
            
            // Обрабатываем только новые изображения
            $processedImages = [];
            foreach ($newImages as $image) {
                if (in_array($image['src'], $existingImageUrls)) {
                    // Изображение уже существует, используем его
                    $processedImages[] = $image;
                } else {
                    // Новое изображение, обрабатываем его
                    $processedImage = $this->processImages([$image], $options);
                    if (!empty($processedImage)) {
                        $processedImages = array_merge($processedImages, $processedImage);
                    }
                }
            }
            
            // Обновляем HTML с новыми путями к изображениям
            $finalHtml = $this->updateImagePaths($cleanNewHtml, $processedImages);
            
            return [
                'html' => $finalHtml,
                'images' => $processedImages,
                'existing_images' => $existingImages,
                'updated_at' => now()
            ];
        } catch (Exception $e) {
            Log::error('Error updating HTML content: ' . $e->getMessage());
            
            return [
                'html' => $this->sanitizeHtml($newHtml),
                'images' => [],
                'error' => 'Ошибка обновления контента: ' . $e->getMessage(),
                'updated_at' => now()
            ];
        }
    }

    /**
     * Удаляет неиспользуемые изображения
     */
    public function cleanupUnusedImages(string $oldHtml, string $newHtml, array $options = []): array
    {
        $disk = $options['disk'] ?? 'public';
        $deletedImages = [];
        
        try {
            // Извлекаем изображения из старого и нового HTML
            $oldImages = $this->extractImagesFromHtml($oldHtml);
            $newImages = $this->extractImagesFromHtml($newHtml);
            
            // Определяем, какие изображения больше не используются
            $oldImageUrls = array_column($oldImages, 'new_src');
            $newImageUrls = array_column($newImages, 'new_src');
            
            $unusedImages = array_diff($oldImageUrls, $newImageUrls);
            
            // Удаляем неиспользуемые изображения
            foreach ($unusedImages as $imageUrl) {
                if (strpos($imageUrl, '/storage/') === 0) {
                    $filePath = str_replace('/storage/', '', $imageUrl);
                    if (Storage::disk($disk)->exists($filePath)) {
                        Storage::disk($disk)->delete($filePath);
                        $deletedImages[] = $filePath;
                    }
                }
            }
            
            return [
                'deleted_images' => $deletedImages,
                'deleted_count' => count($deletedImages)
            ];
        } catch (Exception $e) {
            Log::error('Error cleaning up unused images: ' . $e->getMessage());
            return [
                'deleted_images' => [],
                'deleted_count' => 0,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Получает статистику по HTML контенту
     */
    public function getContentStats(string $html): array
    {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        
        return [
            'characters' => strlen(strip_tags($html)),
            'words' => str_word_count(strip_tags($html)),
            'paragraphs' => $xpath->query('//p')->length,
            'headings' => $xpath->query('//h1 | //h2 | //h3 | //h4 | //h5 | //h6')->length,
            'lists' => $xpath->query('//ul | //ol')->length,
            'images' => $xpath->query('//img')->length,
            'links' => $xpath->query('//a')->length,
            'code_blocks' => $xpath->query('//code | //pre')->length,
            'blockquotes' => $xpath->query('//blockquote')->length,
        ];
    }
}
