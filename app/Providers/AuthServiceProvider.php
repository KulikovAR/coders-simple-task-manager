<?php

namespace App\Providers;

use App\Models\TaskComment;
use App\Policies\CommentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        TaskComment::class => CommentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
} 