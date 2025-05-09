<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'psychologist_id',
        'date',
        'time',
        'status',
        'discussion'
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function psychologist() {
        return $this->belongsTo(User::class, 'psychologist_id');
    }
}