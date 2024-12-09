<?php

namespace App\Services\SeatMap;

use App\Models\SeatMap;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class SeatMapService
{
    protected function filterByCinema($query)
    {
        $user = Auth::user();
        if ($user && $user->hasRole('manager')) {
            // Manager chỉ được thao tác với SeatMap thuộc rạp của mình
            $query->where('cinema_id', $user->cinema_id);
        }
        return $query;
    }

    public function getAll(): Collection
    {
        $query = SeatMap::query();
        return $this->filterByCinema($query)->get();
    }

    public function getById(int $id): SeatMap
    {
        $query = SeatMap::where('id', $id);
        return $this->filterByCinema($query)->firstOrFail();
    }

    public function create(array $data): SeatMap
    {
        $user = Auth::user();
        if ($user && $user->hasRole('manager')) {
            $data['cinema_id'] = $user->cinema_id;
        }
        return SeatMap::create($data);
    }

    public function update(int $id, array $data): SeatMap
    {
        $seatMap = $this->getById($id); // Tự động lọc theo quyền của người dùng
        $seatMap->update($data);
        return $seatMap;
    }

    public function delete(int $id): bool
    {
        $seatMap = $this->getById($id); // Tự động lọc theo quyền của người dùng
        return $seatMap->delete();
    }
}
