<?php

namespace App\Console\Commands;

use App\Services\Seo\Services\RecognitionTaskService;
use Illuminate\Console\Command;

class CleanupSeoRecognitionTasks extends Command
{
    protected $signature = 'seo:cleanup-tasks';
    protected $description = 'Cleanup old completed SEO recognition tasks';

    public function handle(RecognitionTaskService $recognitionTaskService): int
    {
        $this->info('Cleaning up old SEO recognition tasks...');
        
        $recognitionTaskService->cleanupOldTasks();
        
        $this->info('Cleanup completed successfully.');
        
        return Command::SUCCESS;
    }
}