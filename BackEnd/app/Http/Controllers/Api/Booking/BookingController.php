<?php

namespace App\Http\Controllers\Api\Booking;

use App\Events\InvoiceCreated;
use App\Events\InvoiceSendMail;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\TicketBookingRequest;
use App\Jobs\ResetSeats;
use App\Mail\InvoiceMail;
use App\Models\Booking;
use App\Models\Combo;
use App\Models\Room;
use App\Models\Seats;
use App\Models\TemporaryBooking;
use App\Services\Booking\TicketBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;

class BookingController extends Controller
{
    protected TicketBookingService $ticketBookingService;

    public function __construct(TicketBookingService $ticketBookingService)
    {
        $this->ticketBookingService = $ticketBookingService;
    }

    // public function slectMovieAndSeats(Request $request)
    // {
    //     try {
    //         $selectMovieAndSeat = $this->ticketBookingService->selectMovieSeats($request);
    //         return $selectMovieAndSeat;
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => $e->getMessage()
    //         ]);
    //     }
    // }

    // public function selectCombos(Request $request)
    // {
    //     try {
    //         $selectCombos = $this->ticketBookingService->selectCombos($request);
    //         return $selectCombos;
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'status' => false,
    //             'message' => $e->getMessage()
    //         ]);
    //     }
    // }


    public function bookTicket(TicketBookingRequest $request)
    {
        try {
            $data = $this->ticketBookingService->bookingTicket($request);

            if ($data instanceof JsonResponse) {
                return $data;  // Trả về URL thanh toán hoặc lỗi nếu có
            }
            if (session()->get('booking')) {
                $paymentURL = $this->ticketBookingService->processPayment($request);
                return response()->json([
                    'status' => true,
                    'message' => 'Đặt vé thành công',
                    'Url' => $paymentURL
                ]);
            }
            return $this->error('Đặt vé thất bại', 500);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function vnpayReturn(Request $request)
    {
        $data = $request->only(['vnp_TxnRef', 'vnp_ResponseCode']);
        if ($data['vnp_ResponseCode'] == "00") {
            $booking = Booking::where('id', $data['vnp_TxnRef'])->first();

            $booking->status = 'Confirmed';
            $booking->save();
            Mail::to($booking->user->email)->queue(new InvoiceMail($booking));
            // event(new InvoiceSendMail($booking));
            session()->flush();
            // return redirect('http://localhost:5173/')->with('success', 'Đặt vé thành công');

            return redirect('http://localhost:5173/movieticket');
            // return $this->success($booking, 'success');

        }
    }

    // public function selectSeats(Request $request)
    // {
    //     $seats = $request->input('seats');
    //     $existingSeats = [];
    //     $seatDataList = [];
    //     if (is_array($seats) && count($seats) > 10) {
    //         return response()->json(['status' => false, 'message' => 'You can only select up to 10 seats.'], 400);
    //     }

    //     if (!$seats) {
    //         return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
    //     }
    //     if (is_array($seats)) {
    //         foreach ($seats as $seatData) {
    //             // Kiểm tra xem ghế đã tồn tại
    //             $seat = Seats::where('seat_name', $seatData['seat_name'])
    //                 ->where('seat_row', $seatData['seat_row'])
    //                 ->where('seat_column', $seatData['seat_column'])
    //                 ->where('room_id', $seatData['room_id'])
    //                 ->first();

    //             if ($seat) {
    //                 // Lưu ghế đã tồn tại vào danh sách lỗi
    //                 $existingSeats[] = $seat->toArray();
    //             } else {
    //                 // Tạo ghế mới
    //                 $seatCreate = Seats::create($seatData);

    //                 if ($seatCreate) {
    //                     $seatDataList[] = $seatCreate;
    //                     $seatCreate->reserveForUser();
    //                 } else {
    //                     return response()->json(['status' => false, 'message' => 'Failed to create seat.'], 500);
    //                 }
    //             }
    //         }

    //         // Nếu có ghế đã tồn tại, trả về danh sách các ghế đó
    //         if (!empty($existingSeats)) {
    //             return response()->json(['status' => false, 'message' => 'Some seats already exist.', 'data' => $existingSeats], 400);
    //         }

    //         // Nếu tạo ghế thành công, dispatch job cho tất cả ghế đã tạo
    //         if (!empty($seatDataList)) {
    //             $this->dispatchResetSeatsJob($seatDataList);
    //             // Lưu thông tin ghế vào session
    //             Session::put('seats', $seatDataList);
    //             Log::info('Seats Session: ' . json_encode(session('seats')));
    //         }

    //         return response()->json([
    //             'status' => true,
    //             'message' => 'Selected seats successfully.',
    //             'data' => $seatDataList
    //         ]);
    //     }
    // }

    public function selectSeats(Request $request)
    {
        $seats = $request->input('seats'); // Ghế người dùng chọn

        // Kiểm tra nếu không có ghế được chọn
        if (empty($seats)) {
            return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
        }
        if (is_array($seats) && count($seats) > 10) {
            return response()->json(['status' => false, 'message' => 'You can only select up to 10 seats.'], 400);
        }

        if (!$seats) {
            return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
        }
        // Sắp xếp các ghế đã chọn theo `seat_name` (theo tên ghế)
        $gapIssue = $this->hasGapIssue($seats);
        if ($gapIssue) {
            return $gapIssue;  // Trả về lỗi nếu có khoảng trống
        }
        // Nếu không có lỗi, tiếp tục xử lý ghế đã chọn
        $saveSeats = $this->saveSeats($seats);
        if ($saveSeats) {
            return $saveSeats;
        }
    }

    public function saveSeats($seats)
    {
        if (is_array($seats)) {
            try {
                // Bắt đầu transaction
                DB::beginTransaction();

                $existingSeats = [];
                $seatDataList = [];

                foreach ($seats as $seatData) {
                    // Kiểm tra xem ghế đã tồn tại
                    $seat = Seats::where('seat_name', $seatData['seat_name'])
                        ->where('seat_row', $seatData['seat_row'])
                        ->where('seat_column', $seatData['seat_column'])
                        ->where('room_id', $seatData['room_id'])
                        ->first();

                    if ($seat) {
                        // Lưu ghế đã tồn tại vào danh sách lỗi
                        $existingSeats[] = $seat->toArray();
                    } else {
                        // Tạo ghế mới
                        $seatCreate = Seats::create($seatData);

                        if ($seatCreate) {
                            $seatDataList[] = $seatCreate;
                            $seatCreate->reserveForUser();
                        } else {
                            // Nếu không thể tạo ghế, thực hiện rollback và trả về lỗi
                            DB::rollBack();
                            return response()->json(['status' => false, 'message' => 'Failed to create seat.'], 500);
                        }
                    }
                }

                // Nếu có ghế đã tồn tại, thực hiện rollback transaction và trả về danh sách các ghế đã tồn tại
                if (!empty($existingSeats)) {
                    DB::rollBack();
                    return response()->json(['status' => false, 'message' => 'Some seats already exist.', 'data' => $existingSeats], 400);
                }

                // Nếu không có lỗi, commit transaction và tiếp tục xử lý
                DB::commit();

                // Gửi job cho tất cả ghế đã tạo
                if (!empty($seatDataList)) {
                    $this->dispatchResetSeatsJob($seatDataList);
                    // Lưu thông tin ghế vào session
                    Session::put('seats', $seatDataList);
                    Log::info('Seats Session: ' . json_encode(session('seats')));
                }

                return response()->json([
                    'status' => true,
                    'message' => 'Selected seats successfully.',
                    'data' => $seatDataList
                ]);
            } catch (\Exception $e) {
                // Nếu xảy ra lỗi ngoài mong muốn, thực hiện rollback toàn bộ transaction
                DB::rollBack();
                return response()->json(['status' => false, 'message' => 'An error occurred while processing seats.'], 500);
            }
        }

        return response()->json(['status' => false, 'message' => 'Invalid data provided.'], 400);
    }


    public function hasGapIssue($seats)
    {
        usort($seats, function ($a, $b) {
            return strcmp($a['seat_name'], $b['seat_name']); // Sắp xếp theo tên ghế
        });

        // Lưu ghế theo hàng
        $selectedRows = [];
        foreach ($seats as $seat) {
            preg_match('/([A-Za-z]+)(\d+)/', $seat['seat_name'], $match);
            $row = $match[1]; // Hàng
            $column = (int)$match[2]; // Cột

            // Kiểm tra xem hàng đã được chọn chưa
            if (!isset($selectedRows[$row])) {
                $selectedRows[$row] = [];
            }
            // Thêm cột của ghế vào danh sách ghế đã chọn
            $selectedRows[$row][] = $column;
        }

        // Kiểm tra các ghế trong cùng một hàng
        foreach ($selectedRows as $row => $columns) {
            sort($columns); // Sắp xếp lại các cột của ghế trong hàng

            // Kiểm tra nếu có sự bỏ trống giữa các cột trong hàng
            for ($i = 0; $i < count($columns) - 1; $i++) {
                $currentColumn = $columns[$i];
                $nextColumn = $columns[$i + 1];

                // Kiểm tra sự chênh lệch giữa các cột
                if ($nextColumn - $currentColumn == 2) {
                    return response()->json([
                        'status' => false,
                        'message' => 'Please select consecutive seats without gaps.',
                        'data' => [
                            'missing_seat' => $row . ($currentColumn + 1) // Ghế bị bỏ trống giữa các ghế đã chọn
                        ]
                    ], 402);
                }
            }
        }
    }



    public  function dispatchResetSeatsJob(array $seatIds): void
    {
        // Dispatch một job với toàn bộ các ID ghế đã được tạo
        ResetSeats::dispatch($seatIds)->delay(now()->addMinutes(5));
    }
}
