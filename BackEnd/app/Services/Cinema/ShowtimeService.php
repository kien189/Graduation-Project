<?php

namespace App\Services\Cinema;

use App\Models\Movie;
use App\Models\MovieInCinema;
use App\Models\Showtime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Traits\AuthorizesInService;


/**
 * Class LocationService.
 */
class ShowtimeService
{
    use AuthorizesInService;
    public function index()
    {

        return Showtime::with(['movieInCinema.movie', 'room'])->orderByDesc('created_at')->paginate(5);

    }



    public function store(array $data): Showtime
    {

        return Showtime::create($data);
    }

    public function update(int $id, array $data): Showtime
    {

        $showtime = Showtime::findOrFail($id);
        $showtime->update($data);

        return $showtime;
    }


    public function delete(int $id): ?bool
    {

        $showtime = Showtime::findOrFail($id);
        return $showtime->delete();
    }

    public function get(int $id): Showtime
    {
        $showtime = Showtime::with('movieInCinema.movie')
            ->findOrFail($id);

        return $showtime;
    }


    public function getShowtimesByMovieName(string $movie_name)
    {
        // Tìm kiếm phim dựa trên tên phim
        $movie = Movie::where('movie_name', 'like', '%' . $movie_name . '%')->first();

        if (!$movie) {
            throw new ModelNotFoundException('Movie not found');
        }
        return $movie->showtimes;
    }

}
