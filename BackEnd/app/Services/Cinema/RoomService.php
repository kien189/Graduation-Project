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
            // Người chưa đăng nhập: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        } elseif ($user->hasRole('admin')) {
            // Admin: không lọc gì thêm, lấy tất cả rạp
            return $query;
        } elseif ($user->hasRole('manager')) {
            // Manager hoặc Staff: chỉ lấy rạp theo cinema_id của họ
            $query->where('id', $user->cinema_id);
        } else {
            // Các vai trò khác (không phải admin/manager/staff): chỉ lấy rạp có status = 1
            $query->where('status', 1);
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
