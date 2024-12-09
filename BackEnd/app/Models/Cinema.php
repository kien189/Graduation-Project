<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Slugable;
use Illuminate\Support\Str;

class Cinema extends Model
{
    use HasFactory, Slugable;
    protected $table = 'cinema';
    protected $primaryKey = 'id';
    protected $fillable = [
        'cinema_name',
        'slug',
        'phone',
        'city',
        'image',
        'description',
        'location_id',
        'cinema_address',
        'status',
    ];
    public function location()
    {
        return $this->belongsTo(Location::class);
    }
    public function movies()
    {
        return $this->belongsToMany(Movie::class, 'movie_in_cinemas', 'cinema_id', 'movie_id')

            ->withTimestamps();
    }
    // public function showtimes() {
    //     return $this->hasMany(Showtime::class);
    // }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }


    protected static function booted()
    {
        static::creating(function ($movie) {
            $movie->slug = self::createSlug($movie->cinema_name);
        });
    }



    public static function createSlug($title)
    {
        return str::slug($title);
    }
}
