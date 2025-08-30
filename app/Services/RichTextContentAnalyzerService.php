<?php

namespace App\Services;

use App\Models\FileAttachment;
use Illuminate\Support\Facades\Log;
use DOMDocument;
use DOMXPath;

class RichTextContentAnalyzerService
{
    /**
     * Анализирует HTML контент и извлекает ID файлов
     */
    public function extractFileIdsFromContent(string $htmlContent): array
    {
        if (empty($htmlContent)) {
            return [];
        }

        $fileIds = [];

        try {
            // Создаем DOM документ
            $dom = new DOMDocument();
            
            // Подавляем предупреждения о HTML5 тегах
            libxml_use_internal_errors(true);
            
            // Загружаем HTML контент
            $dom->loadHTML('<?xml encoding="UTF-8">' . $htmlContent, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            
            // Очищаем ошибки
            libxml_clear_errors();

            // Создаем XPath объект
            $xpath = new DOMXPath($dom);

            // Ищем все элементы с data-file-id атрибутом
            $fileNodes = $xpath->query('//*[@data-file-id]');
            
            foreach ($fileNodes as $node) {
                if ($node instanceof \DOMElement) {
                    $fileId = $node->getAttribute('data-file-id');
                    if ($fileId && !in_array($fileId, $fileIds)) {
                        $fileIds[] = $fileId;
                    }
                }
            }

            // Также ищем файлы в data-атрибутах
            $dataFileNodes = $xpath->query('//*[contains(@class, "file-attachment-node")]');
            foreach ($dataFileNodes as $node) {
                if ($node instanceof \DOMElement) {
                    $fileId = $node->getAttribute('data-file-id');
                    if ($fileId && !in_array($fileId, $fileIds)) {
                        $fileIds[] = $fileId;
                    }
                }
            }

        } catch (\Exception $e) {
            Log::warning('Ошибка при анализе HTML контента', [
                'error' => $e->getMessage(),
                'content_length' => strlen($htmlContent)
            ]);
        }

        return $fileIds;
    }

    /**
     * Находит файлы, которые больше не используются в контенте
     */
    public function findUnusedFiles(string $attachableType, $attachableId, array $contentFileIds): array
    {
        // Получаем все файлы, привязанные к данному объекту
        $attachedFiles = FileAttachment::where('attachable_type', $attachableType)
            ->where('attachable_id', $attachableId)
            ->get();

        $unusedFiles = [];

        foreach ($attachedFiles as $file) {
            // Если ID файла не найден в контенте, считаем его неиспользуемым
            if (!in_array($file->id, $contentFileIds)) {
                $unusedFiles[] = $file;
            }
        }

        return $unusedFiles;
    }

    /**
     * Анализирует все модели с RichTextEditor контентом и находит неиспользуемые файлы
     */
    public function analyzeAllRichTextContent(): array
    {
        $unusedFiles = [];
        
        // Анализируем TaskComment
        $this->analyzeTaskComments($unusedFiles);
        
        // Анализируем Task
        $this->analyzeTasks($unusedFiles);
        
        // Анализируем Project
        $this->analyzeProjects($unusedFiles);
        
        // Анализируем Sprint
        $this->analyzeSprints($unusedFiles);

        return $unusedFiles;
    }

    /**
     * Анализирует комментарии к задачам
     */
    private function analyzeTaskComments(array &$unusedFiles): void
    {
        $taskComments = \App\Models\TaskComment::whereNotNull('content')
            ->where('content', '!=', '')
            ->get();

        foreach ($taskComments as $comment) {
            $contentFileIds = $this->extractFileIdsFromContent($comment->content);
            $unused = $this->findUnusedFiles(
                \App\Models\TaskComment::class,
                $comment->id,
                $contentFileIds
            );
            
            $unusedFiles = array_merge($unusedFiles, $unused);
        }
    }

    /**
     * Анализирует задачи
     */
    private function analyzeTasks(array &$unusedFiles): void
    {
        $tasks = \App\Models\Task::whereNotNull('description')
            ->where('description', '!=', '')
            ->get();

        foreach ($tasks as $task) {
            $contentFileIds = $this->extractFileIdsFromContent($task->description);
            $unused = $this->findUnusedFiles(
                \App\Models\Task::class,
                $task->id,
                $contentFileIds
            );
            
            $unusedFiles = array_merge($unusedFiles, $unused);
        }

        // Анализируем результат задачи
        $tasksWithResult = \App\Models\Task::whereNotNull('result')
            ->where('result', '!=', '')
            ->get();

        foreach ($tasksWithResult as $task) {
            $contentFileIds = $this->extractFileIdsFromContent($task->result);
            $unused = $this->findUnusedFiles(
                \App\Models\Task::class,
                $task->id,
                $contentFileIds
            );
            
            $unusedFiles = array_merge($unusedFiles, $unused);
        }
    }

    /**
     * Анализирует проекты
     */
    private function analyzeProjects(array &$unusedFiles): void
    {
        $projects = \App\Models\Project::whereNotNull('description')
            ->where('description', '!=', '')
            ->get();

        foreach ($projects as $project) {
            $contentFileIds = $this->extractFileIdsFromContent($project->description);
            $unused = $this->findUnusedFiles(
                \App\Models\Project::class,
                $project->id,
                $contentFileIds
            );
            
            $unusedFiles = array_merge($unusedFiles, $unused);
        }
    }

    /**
     * Анализирует спринты
     */
    private function analyzeSprints(array &$unusedFiles): void
    {
        $sprints = \App\Models\Sprint::whereNotNull('description')
            ->where('description', '!=', '')
            ->get();

        foreach ($sprints as $sprint) {
            $contentFileIds = $this->extractFileIdsFromContent($sprint->description);
            $unused = $this->findUnusedFiles(
                \App\Models\Sprint::class,
                $sprint->id,
                $contentFileIds
            );
            
            $unusedFiles = array_merge($unusedFiles, $unused);
        }
    }

    /**
     * Удаляет неиспользуемые файлы
     */
    public function cleanupUnusedFiles(array $unusedFiles): int
    {
        $deletedCount = 0;

        foreach ($unusedFiles as $file) {
            try {
                if ($file->delete()) {
                    $deletedCount++;
                    Log::info('Удален неиспользуемый файл', [
                        'file_id' => $file->id,
                        'filename' => $file->original_name,
                        'attachable_type' => $file->attachable_type,
                        'attachable_id' => $file->attachable_id
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Ошибка при удалении неиспользуемого файла', [
                    'file_id' => $file->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return $deletedCount;
    }
}
