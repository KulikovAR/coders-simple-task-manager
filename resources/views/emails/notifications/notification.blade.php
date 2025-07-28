@component('mail::message')
# Новое уведомление

{{ $notificationText }}

@if($notification->from_user)
**От:** {{ $notification->from_user->name }}
@endif

**Дата:** {{ $notification->created_at ? $notification->created_at->format('d.m.Y H:i') : now()->format('d.m.Y H:i') }}

@if($actionUrl)
@component('mail::button', ['url' => $actionUrl])
Перейти к объекту
@endcomponent
@endif

@component('mail::button', ['url' => route('notifications.index'), 'color' => 'secondary'])
Все уведомления
@endcomponent

С уважением,<br>
{{ config('app.name') }}

---
Если вы не хотите получать email уведомления, вы можете [отключить их в настройках профиля]({{ route('profile.edit') }}).
@endcomponent 