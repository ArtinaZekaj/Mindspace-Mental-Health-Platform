<?php

// app/Models/Reflection.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reflection extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'mood',
        'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
