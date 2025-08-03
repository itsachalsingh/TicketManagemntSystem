<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    //
    public function users()
    {
        return $this->hasMany(User::class);
    }

    protected $fillable = [
        'name',
        'label',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
