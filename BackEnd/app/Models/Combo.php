<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Combo extends Model
{
    use HasFactory;
    protected $table = 'combos';
    protected $primaryKey = 'id';
    protected $fillable = [
        'combo_name',
        'price',
        'descripton',
        'volume',
        'cinema_id',
        'status',
    ];
}
