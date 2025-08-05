<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketComment extends Model
{
    //
    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public static function boot()
    {
        parent::boot();
        static::creating(function ($comment) {
            $comment->user_id = auth()->id(); // Automatically set the user_id to the authenticated user
            $comment->message = trim($comment->message); // Ensure message is trimmed
        });
    }

}
