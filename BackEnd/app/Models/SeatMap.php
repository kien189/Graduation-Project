<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeatMap extends Model
{
    protected $table = "seat_map";
    protected $fillable = [
        'name',
        'cinema_id',
        'description',
        'matrix_row',
        'matrix_column',
        'row_regular_seat',
        'row_vip_seat',
        'row_couple_seat',
        'seat_structure',
    ];

    protected $casts = [
        'seat_structure' => 'array', // Tự động cast JSON thành array khi truy cập
    ];



}
