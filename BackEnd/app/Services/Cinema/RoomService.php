<?php

namespace App\Services\Cinema;

use App\Models\Room;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class RoomService
{
    protected function filterByRole($query)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Unauthorized');
        }

        if ($user->hasRole('manager')) {
            // Manager chỉ được phép truy cập phòng trong rạp của họ
            $query->where('cinema_id', $user->cinema_id);
        }

        return $query;
    }

    public function index(): Collection
    {
        $rooms = Room::with('seatmap')->orderByDesc('created_at');
        return $this->filterByRole($rooms)->get();
    }

    public function store(array $data): Room
    {
        $user = Auth::user();

        if (!$user || !$user->hasRole('manager')) {
            abort(403, 'Unauthorized');
        }

        $data['cinema_id'] = $user->cinema_id;
        return Room::create($data);
    }

    public function update(int $id, array $data): Room
    {
        $room = $this->filterByRole(Room::where('id', $id))->firstOrFail();
        $room->update($data);
        return $room;
    }

    public function delete(int $id): ?bool
    {
        $room = $this->filterByRole(Room::where('id', $id))->firstOrFail();
        return $room->delete();
    }

    public function get(int $id): Room
    {
        return $this->filterByRole(Room::where('id', $id))->firstOrFail();
    }

    public function getRoomByCinema(int $cinemaId): Collection
    {
        $rooms = Room::where('cinema_id', $cinemaId);
        return $this->filterByRole($rooms)->get();
    }
}
