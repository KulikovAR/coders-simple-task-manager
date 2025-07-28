@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<div style="background-color: #667eea; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 16px; font-family: Arial, sans-serif;">
    379ТМ
</div>
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>
