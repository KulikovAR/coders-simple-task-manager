<?php

namespace App\Exceptions;

use Exception;

class StatusHasTasksException extends Exception
{
    protected $statusNames;

    public function __construct(array $statusNames, string $message = null)
    {
        $this->statusNames = $statusNames;
        
        if (!$message) {
            $message = 'Нельзя удалить статусы "' . implode('", "', $statusNames) . 
                      '", так как в них есть задачи. Сначала переместите задачи в другие статусы.';
        }

        parent::__construct($message);
    }

    public function getStatusNames(): array
    {
        return $this->statusNames;
    }
}
