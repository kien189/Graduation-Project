<?php

namespace App\Services\Cinema;

use App\Models\Showtime;
use App\Models\Movie;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ShowtimeService
{
    protected function filterByRole($query)
    {
        $user = Auth::user();

        if (!$user) {
            // Người chưa đăng nhập chỉ thấy các suất chiếu có `status = 1`
            $query->where('status', 1);
        } elseif ($user->hasRole('manager')) {
            // Manager chỉ thấy các suất chiếu thuộc rạp của họ
            $query->whereHas('room.cinema', function ($q) use ($user) {
                $q->where('id', $user->cinema_id);
            });
        } elseif (!$user->hasRole('admin')) {
            // Người dùng thông thường chỉ thấy `status = 1`
            $query->where('status', 1);
        }

        return $query;
    }

    public function index()
    {
        $query = Showtime::with(['movie', 'room.cinema'])->orderByDesc('created_at');
        return $this->filterByRole($query)->paginate(5);
    }

    public function store(array $data): Showtime
    {
        return Showtime::create($data);
    }

    public function update(int $id, array $data): Showtime
    {
        $showtime = $this->filterByRole(Showtime::where('id', $id))->firstOrFail();
        $showtime->update($data);
        return $showtime;
    }

    public function delete(int $id): ?bool
    {
        $showtime = $this->filterByRole(Showtime::where('id', $id))->firstOrFail();
        return $showtime->delete();
    }

    public function get(int $id)
    {
        $query = Showtime::with(['movie', 'room.cinema', 'room.seatMap']);
        $showtime = $this->filterByRole($query)->findOrFail($id);

        // Định dạng lại chỗ ngồi
        $showtimeData = $showtime->toArray();
        $showtimeData['formatted_seats'] = $showtime->room->seatMap->groupBy('row');

        return $showtimeData;
    }

    public function getShowtimesByMovieName(string $movieName)
    {
        $movie = Movie::where('movie_name', 'like', '%' . $movieName . '%')->first();

        if (!$movie) {
            throw new \Exception('Movie not found');
        }

        return $this->filterByRole($movie->showtimes()->getQuery())->get();
    }

    public function generateShowtimes(array $data): array
    {
        $openingTime = Carbon::createFromFormat('H:i', $data['opening_time']);
        $closingTime = Carbon::createFromFormat('H:i', $data['closing_time']);
        $duration = $data['duration'];
        $price = $data['price'];

        $showtimes = [];
        while ($openingTime->addMinutes($duration)->lte($closingTime)) {
            $startTime = $openingTime->copy()->subMinutes($duration)->format('H:i:s');
            $endTime = $openingTime->format('H:i:s');

            $showtimes[] = Showtime::create([
                'room_id' => $data['room_id'],
                'movie_id' => $data['movie_id'],
                'showtime_date' => $data['date'],
                'showtime_start' => $startTime,
                'showtime_end' => $endTime,
                'price' => $price,
                'status' => '1',
            ]);
        }

        return $showtimes;
    }
}
