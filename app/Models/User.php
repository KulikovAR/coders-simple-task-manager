<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\VerifyEmailNotification;
use App\Models\UserXmlApiSettings;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'paid',
        'expires_at',
        'email_notifications',
        'telegram_chat_id',
        'deadline_notification_time',
        'subscription_id',
        'subscription_expires_at',
        'ai_requests_used',
        'ai_requests_reset_at',
        'google_id',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'paid' => 'boolean',
            'expires_at' => 'datetime',
            'email_notifications' => 'boolean',
            'telegram_chat_id' => 'string',
            'deadline_notification_time' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'ai_requests_used' => 'integer',
            'ai_requests_reset_at' => 'datetime',
        ];
    }

    public function ownedProjects(): HasMany
    {
        return $this->hasMany(Project::class, 'owner_id');
    }

    public function projectMemberships(): HasMany
    {
        return $this->hasMany(ProjectMember::class);
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'assignee_id');
    }

    public function reportedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'reporter_id');
    }

    public function taskComments(): HasMany
    {
        return $this->hasMany(TaskComment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function projects(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function subscriptionLimit(): HasOne
    {
        return $this->hasOne(SubscriptionUserLimit::class);
    }

    public function xmlApiSettings(): HasOne
    {
        return $this->hasOne(UserXmlApiSettings::class);
    }

    public function getRemainingAiRequests(): int
    {
        if (!$this->subscription) {
            return 0;
        }

        // Если период сброса прошел, сбрасываем счетчик
        if ($this->ai_requests_reset_at && $this->ai_requests_reset_at < now()) {
            $this->ai_requests_used = 0;
            $this->updateAiRequestsResetDate();
            $this->save();
        }

        return max(0, $this->subscription->ai_requests_limit - $this->ai_requests_used);
    }

    public function updateAiRequestsResetDate(): void
    {
        if (!$this->subscription) {
            return;
        }

        if ($this->subscription->ai_requests_period === 'daily') {
            $this->ai_requests_reset_at = now()->addDay();
        } else {
            $this->ai_requests_reset_at = now()->addMonth();
        }
    }

    public function incrementAiRequestsUsed(): void
    {
        $this->ai_requests_used++;
        $this->save();
    }

    public function hasAvailableAiRequests(): bool
    {
        return $this->getRemainingAiRequests() > 0;
    }

    /**
     * Get the avatar URL attribute.
     * Returns the full URL for Google avatars or storage URL for local avatars.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        // Если аватар начинается с http, это Google URL
        if (str_starts_with($this->avatar, 'http')) {
            return $this->avatar;
        }

        // Иначе это локальный файл в storage
        return asset('storage/' . $this->avatar);
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification);
    }
}
