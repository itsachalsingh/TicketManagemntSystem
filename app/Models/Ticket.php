<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Ticket extends Model
{
    //
    protected $fillable = [
        'ticket_number',
        'user_id',
        'district_id',
        'tehsil_id',
        'area_id',
        'service_id',
        'category_id',
        'subject',
        'description',
        'resolution',
        'resolved_at',
        'closed_at',
        'is_anonymous',
        'is_public',
        'is_escalated',
        'is_urgent',
        'is_follow_up',
        'assigned_to',
        'due_date',
        'source',
        'ip_address',
        'user_agent',
        'status'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'due_date' => 'datetime',
        'is_anonymous' => 'boolean',
        'is_public' => 'boolean',
        'is_escalated' => 'boolean',
        'is_urgent' => 'boolean',
        'is_follow_up' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public static function boot()
    {
        parent::boot();
        static::creating(function ($ticket) {
            $lastTicket = self::orderBy('id', 'desc')->first();
            $nextId = $lastTicket ? $lastTicket->id + 1 : 1;
            $ticket->ticket_number = 'UCC-' . date('Ymd') . '-' . sprintf('%04d', $nextId);
        });

    }
}

