<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use PhpParser\Builder\Function_;
use PhpParser\Node\Stmt\Return_;

class Room extends Model
{
    use HasFactory;

    protected $table = 'room';

    protected $fillable = [
        'room_name',
        'cinema_id',
        'seat_map_id',
        'status',
    ];

    // Define relation to SeatLayout
    public function seatMap()
    {
        return $this->belongsTo(SeatMap::class);
    }

    // Define relation to Showtimes
    public function showtimes()
    {
        return $this->hasMany(Showtime::class);
    }

    // Relation to Cinema
    public function cinema()
    {
        return $this->belongsTo(Cinema::class);
    }
public function showtimes()
{
    return $this->hasMany(Showtime::class);
}


}
