<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_percentage',
        'max_discount',
        'min_purchase',
        'valid_from',
        'valid_to',
        'is_active',
        'cinema_id',
    ];
}
