<?php

namespace App\Services\Cinema;

use App\Models\Cinema;
use App\Models\Location;
use App\Models\MovieInCinema;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Traits\AuthorizesInService;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

/**
 * Class LocationService.
 */
class CinemaService
{
    use AuthorizesInService;

    protected function filterByRole($query)
    {
        $user = Auth::user();

        if (!$user) {
            // Người chưa đăng nhập: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        } elseif ($user->hasRole('manager')) {
            // Manager: chỉ lấy rạp theo cinema_id của họ
            $query->where('id', $user->cinema_id);
        } elseif (!$user->hasRole('admin')) {
            // Người dùng không phải admin: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        }

        return $query;
    }

    public function index()
    {
        $cinemas = Cinema::query()->orderByDesc('created_at');
        return $this->filterByRole($cinemas)->get();
    }

    public function store(array $data): Cinema
    {
        return Cinema::create($data);
    }

    public function update(int $id, array $data): Cinema
    {
        $cinema = $this->filterByRole(Cinema::query()->where('id', $id))->firstOrFail();
        $cinema->update($data);
        return $cinema;
    }

    public function delete(int $id): ?bool
    {
        $cinema = $this->filterByRole(Cinema::query()->where('id', $id))->firstOrFail();
        return $cinema->delete();
    }

    public function get($identifier): Cinema
    {
        $cinema = Cinema::query();

        $this->filterByRole($cinema);

        $cinema->when(is_numeric($identifier), function ($query) use ($identifier) {
            return $query->where('id', $identifier);
        }, function ($query) use ($identifier) {
            return $query->where('slug', $identifier);
        });

        return $cinema->firstOrFail();
    }


    public function showCinemaByLocation(int $location_id)
    {
        $location = Location::where('id', $location_id)->first();
        if (!$location) {
            throw new ModelNotFoundException('Cinema not found');
        }
        return $location->cinema;
    }
}
