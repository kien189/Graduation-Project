<?php

namespace App\Http\Controllers\Api\Booking;

use App\Http\Controllers\Controller;
use App\Models\Seats;
use Illuminate\Http\Request;

class CheckInTicketController extends Controller
{
    public function checkInSeat(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);
        $ticket = Seats::where('code', $request->code)->first();
        if (!$ticket) {
            return $this->notFound('Không tìm thấy vé', 400);
        }
        if ($ticket->is_checked_in) {
            return $this->error('Vé đã qua sử dụng', 400);
        }
        // Cập nhật trạng thái check-in
        $ticket->is_checked_in = true;
        return $this->success($ticket, 'Checkin thành công', 200);
    }
    public function checkInBooking(Request $request)
    {
        $request->validate([
            'booking_code' => 'required|string',
        ]);
        $ticket = Seats::where('booking_code', $request->booking_code)->first();
        if (!$ticket) {
            return $this->notFound('Không tìm thấy vé', 404);
        }
        if ($ticket->status == 'Đã in vé') {
            return $this->error('Vé đã qua sử dụng', 400);
        }
        // Cập nhật trạng thái check-in
        $ticket->status = 'Đã in vé';
        $ticket->save();
        return $this->success($ticket, 'Đã in vé', 200);
    }
}
