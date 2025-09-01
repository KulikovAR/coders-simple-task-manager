<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SubscriptionUserLimit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'storage_used_bytes'
    ];

    protected $casts = [
        'storage_used_bytes' => 'integer'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getStorageUsedGb(): float
    {
        return round($this->storage_used_bytes / (1024 * 1024 * 1024), 2);
    }

    public function addStorageUsed(int $bytes): void
    {
        $this->storage_used_bytes += $bytes;
        $this->save();
    }

    public function subtractStorageUsed(int $bytes): void
    {
        $this->storage_used_bytes = max(0, $this->storage_used_bytes - $bytes);
        $this->save();
    }

    public function getRemainingStorageBytes(): int
    {
        if (!$this->user->subscription) {
            return 0;
        }

        if ($this->user->subscription->isUnlimitedStorage()) {
            return PHP_INT_MAX;
        }

        $limitBytes = $this->user->subscription->storage_limit_gb * 1024 * 1024 * 1024;
        return max(0, $limitBytes - $this->storage_used_bytes);
    }

    public function getRemainingStorageGb(): float
    {
        if ($this->user->subscription && $this->user->subscription->isUnlimitedStorage()) {
            return -1; // Означает безлимитное хранилище
        }

        return round($this->getRemainingStorageBytes() / (1024 * 1024 * 1024), 2);
    }

    public function hasAvailableStorage(int $requiredBytes): bool
    {
        if ($this->user->subscription && $this->user->subscription->isUnlimitedStorage()) {
            return true;
        }

        return $this->getRemainingStorageBytes() >= $requiredBytes;
    }
}
