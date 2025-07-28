<?php

namespace App\Mail;

use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $notification;
    public $notificationText;
    public $actionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Notification $notification, string $notificationText, ?string $actionUrl = null)
    {
        $this->notification = $notification;
        $this->notificationText = $notificationText;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Новое уведомление в 379ТМ',
            tags: ['notification', '379tm'],
            metadata: [
                'notification_id' => $this->notification->id,
                'user_id' => $this->notification->user_id,
            ],
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.notifications.notification',
            with: [
                'notification' => $this->notification,
                'notificationText' => $this->notificationText,
                'actionUrl' => $this->actionUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
