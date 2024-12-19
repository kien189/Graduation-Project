<?php

namespace App\Services\Order;

use App\Models\Booking;
use Illuminate\Support\Facades\Auth;

/**
 * Class LocationService.
 */
class OrderService
{
    // use Illuminate\Support\Facades\Auth;

    protected function filterByRole($query)
    {
        $user = Auth::user();

        if (!$user) {
            // Người chưa đăng nhập: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        } elseif ($user->hasRole('admin')) {
            // Admin: không lọc gì thêm, lấy tất cả rạp
            return $query;
        } elseif ($user->hasAnyRole(['manager', 'staff'])) {
            // Manager hoặc Staff: chỉ lấy các phòng chiếu thuộc cinema_id của họ
            $query->whereHas('showtime.room', function ($q) use ($user) {
                $q->where('cinema_id', $user->cinema_id);
            });
        } else {
            // Các vai trò khác (không phải admin/manager/staff): chỉ lấy rạp có status = 1
            $query->where('user_id', Auth::user()->id)
                ->where(function ($q) {
                    $q->where('status', 'Thanh toán thành công')
                        ->orWhere('status', 'Đã in vé');
                });
        }

        return $query;
    }

    public function index()
    {
        $query = Booking::with(['showtime.movie', 'showtime.room', 'user', 'payMethod', 'seats', 'combos'])
            ->orderByDesc('created_at');

        // Áp dụng bộ lọc theo vai trò
        $query = $this->filterByRole($query);

        return $query->get();
    }

    public function show($id)
    {
        $query = Booking::with(['showtime.movie', 'showtime.room', 'user', 'payMethod', 'seats', 'combos']);

        // Áp dụng bộ lọc theo vai trò
        $query = $this->filterByRole($query);

        // Tìm đơn hàng theo ID
        $order = $query->findOrFail($id);

        return $order;
    }

    public function destroy($id)
    {
        $order = Booking::find($id);
        $order->delete();
        return $order;
    }

    public function update(string $status, int $id)
    {
        $order = Booking::findOrFail($id);
        $order->status = $status;
        $order->save();
        return $order;
    }

    public function order()
    {
        $order = Booking::where('user_id', Auth::user()->id)->with('showtime.movie', 'showtime.room', 'user', 'payMethod', 'seats', 'combos')->where('status', 'Thanh toán thành công')->orderByDesc('created_at')->get();
        return $order;
    }
}
