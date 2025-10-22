<?php

namespace App\Console\Commands;

use App\Services\Seo\Services\WordstatRecognitionTaskService;
use Illuminate\Console\Command;

class CleanupWordstatRecognitionTasks extends Command
{
    protected $signature = 'seo:cleanup-wordstat-tasks';
    protected $description = 'Cleanup old completed Wordstat recognition tasks';

    public function handle(WordstatRecognitionTaskService $wordstatRecognitionTaskService): int
    {
        $this->info('Cleaning up old Wordstat recognition tasks...');
        
        $wordstatRecognitionTaskService->cleanupOldTasks();
        
        $this->info('Cleanup completed successfully.');
        
        return Command::SUCCESS;
    }
}
