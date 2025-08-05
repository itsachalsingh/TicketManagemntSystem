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
        'status',
        'priority',
        'sub_category_id',
        'created_by',
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
            $ticket->ticket_number = 'UCC-' . date('ymd') . '-' . sprintf('%04d', $nextId);
        });

    }

    public function comments()
    {
        return $this->hasMany(TicketComment::class)->latest();
    }

    public function category()
    {
        return $this->belongsTo(Category::class,'category_id');
    }

    public function subCategory()
    {
        return $this->belongsTo(Category::class, 'sub_category_id');
    }

    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'open' => 'Open',
            'in_progress' => 'In Progress',
            'resolved' => 'Resolved',
            'closed' => 'Closed',
            'reopened' => 'Reopened',
            default => 'Unknown',
        };
    }

    public function getPriorityLabelAttribute()
    {
        return match ($this->priority) {
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            default => 'Unknown',
        };
    }

}

