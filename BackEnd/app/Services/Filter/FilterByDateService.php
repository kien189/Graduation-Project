<?php

namespace App\Services\Filter;

use App\Models\Cinema;
use App\Models\Movie;
use App\Models\MovieInCinema;
use App\Models\Showtime;
use Illuminate\Support\Facades\Auth;

class FilterByDateService
{
    // public function filterByDate(string $date, $cinemaId = null)
    // {
    //     $query = Movie::whereHas('showtimes', function ($query) use ($date, $cinemaId) {
    //         $query->where('showtime_date', $date)
    //             ->whereHas('room', function ($query) use ($cinemaId) {
    //                 $query->where('cinema_id', $cinemaId);
    //             });
    //     })->with('showtimes', function ($query) use ($date) {
    //         $query->where('showtime_date', $date);
    //     })
    //         ->get();
    //     return $query;

    // }

    public function filterByDate(string $date, $cinemaId = null)
    {
        $user = Auth::user(); // Lấy thông tin người dùng

        if ($user && $user->hasRole('admin')) {
            // Admin: Có thể xem tất cả
            $movies = Movie::whereHas('showtimes', function ($query) use ($date) {
                $query->where('showtime_date', $date);
            })->with(['showtimes' => function ($query) use ($date) {
                $query->where('showtime_date', $date);
            }])->get();
        } elseif ($user && $user->hasRole('manager')) {
            // Manager: Chỉ xem trong cinema_id của họ
            $cinemaId = $user->cinema_id;
            $movies = Movie::whereHas('showtimes', function ($query) use ($date, $cinemaId) {
                $query->where('showtime_date', $date)
                    ->whereHas('room', function ($query) use ($cinemaId) {
                        $query->where('cinema_id', $cinemaId);
                    });
            })->with(['showtimes' => function ($query) use ($date) {
                $query->where('showtime_date', $date);
            }])->get();
        } else {
            // Người dùng đã đăng nhập hoặc chưa đăng nhập: Chỉ xem các showtime có trạng thái active
            $movies = Movie::whereHas('showtimes', function ($query) use ($date, $cinemaId) {
                $query->where('showtime_date', $date)->where('status', 1);

                if ($cinemaId) {
                    $query->whereHas('room', function ($query) use ($cinemaId) {
                        $query->where('cinema_id', $cinemaId);
                    });
                }
            })->with(['showtimes' => function ($query) use ($date) {
                $query->where('showtime_date', $date)->where('status', 1);
            }])->get();
        }

        return $movies;
    }


    public function filterByDateOrMovie(string $date, $movieid, $locationId)
    {
        $user = Auth::user(); // Lấy thông tin người dùng (có thể là null)

        $query = Cinema::query();

        // Logic phân quyền
        if ($user) {
            if ($user->hasRole('admin')) {
                // Admin: Hiển thị tất cả
                $query->where('location_id', $locationId)
                    ->whereHas('rooms.showtimes.movie', function ($query) use ($date, $movieid) {
                        $query->where('showtime_date', $date)
                            ->where('movies.id', $movieid);
                    })
                    ->with(['rooms.showtimes' => function ($query) use ($date) {
                        $query->where('showtime_date', $date);
                    }]);
            } elseif ($user->hasRole('manager')) {
                // Manager: Hiển thị các suất chiếu của rạp thuộc quyền quản lý
                $query->where('id', $user->cinema_id)
                    ->whereHas('rooms.showtimes.movie', function ($query) use ($date, $movieid) {
                        $query->where('showtime_date', $date)
                            ->where('movies.id', $movieid);
                    })
                    ->with(['rooms.showtimes' => function ($query) use ($date) {
                        $query->where('showtime_date', $date);
                    }]);
            } else {
                // Người dùng đăng nhập: Chỉ hiện suất chiếu có status = 1
                $query->where('location_id', $locationId)
                    ->whereHas('rooms.showtimes.movie', function ($query) use ($date, $movieid) {
                        $query->where('showtime_date', $date)
                            ->where('movies.id', $movieid)
                            ->where('status', 1);
                    })
                    ->with(['rooms.showtimes' => function ($query) use ($date) {
                        $query->where('showtime_date', $date)->where('status', 1);
                    }]);
            }
        } else {
            // Người chưa đăng nhập: Chỉ hiện suất chiếu có status = 1
            $query->where('location_id', $locationId)
                ->whereHas('rooms.showtimes.movie', function ($query) use ($date, $movieid) {
                    $query->where('showtime_date', $date)
                        ->where('movies.id', $movieid)
                        ->where('status', 1);
                })
                ->with(['rooms.showtimes' => function ($query) use ($date) {
                    $query->where('showtime_date', $date)->where('status', 1);
                }]);
        }

        $results = $query->get();

        // Xử lý ánh xạ kết quả
        $filteredResults = $results->map(function ($cinema) {
            return [
                'cinema_name' => $cinema->cinema_name,
                'cinema_address' => $cinema->cinema_address,
                'image' => $cinema->image,
                'showtimes' => $cinema->rooms->flatMap(function ($room) {
                    return $room->showtimes->map(function ($showtime) {
                        return [
                            'showtime_id' => $showtime->id,
                            'showtime_date' => $showtime->showtime_date,
                            'showtime_start' => $showtime->showtime_start,
                            'showtime_end' => $showtime->showtime_end,
                            'price' => $showtime->price,
                        ];
                    });
                }),
            ];
        });

        return $filteredResults;
    }

}
