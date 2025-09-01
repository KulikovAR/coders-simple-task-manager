<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'price',
        'description',
        'max_projects',
        'max_members_per_project',
        'storage_limit_gb',
        'ai_requests_limit',
        'ai_requests_period',
        'is_custom',
        'is_active'
    ];

    protected $casts = [
        'price' => 'float',
        'max_projects' => 'integer',
        'max_members_per_project' => 'integer',
        'storage_limit_gb' => 'integer',
        'ai_requests_limit' => 'integer',
        'is_custom' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function isUnlimitedProjects(): bool
    {
        return $this->max_projects === -1;
    }

    public function isUnlimitedMembers(): bool
    {
        return $this->max_members_per_project === -1;
    }

    public function isUnlimitedStorage(): bool
    {
        return $this->storage_limit_gb === -1;
    }
}
