<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ligjerues extends Model
{
    use HasFactory;

    protected $table = 'ligjeruesi';
    protected $primaryKey = 'LigjeruesiID';

    protected $fillable = [
        'Emri',
        'Mbiemri',
        'Specializmi',
    ];
}
