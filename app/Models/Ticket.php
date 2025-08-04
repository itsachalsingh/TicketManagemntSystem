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
        'category_id',
        'subject',
        'description',
        'resolution',
        'resolved_at',
        'closed_at',
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
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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

