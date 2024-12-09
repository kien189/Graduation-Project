<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class News extends Model
{
    use HasFactory;
    protected $table = 'news';
    protected $fillable = [
        'title',
        'slug',
        'thumnail',
        'banner',
        'content',
        'news_category_id',
        'user_id',
        'movie_id',
        'views',
        'status',
        'cinema_id',
    ];

    public function newsCategory()
    {
        return $this->belongsTo(NewsCategory::class, 'news_category_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function movie()
    {
        return $this->belongsTo(Movie::class, 'movie_id');
    }

    protected static function booted()
    {
        static::creating(function ($movie) {
            $movie->slug = self::createSlug($movie->title);
        });
    }



    public static function createSlug($title)
    {
        return Str::slug($title);
    }
}
