<?php

namespace App\Http\Controllers\Api\Booking;

use App\Events\InvoiceCreated;
use App\Events\InvoiceSendMail;
use App\Events\SeatSelected;
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
use App\Services\Ranks\RankService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Milon\Barcode\Facades\DNS1D;
use Milon\Barcode\Facades\DNS1DFacade;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Picqer\Barcode\BarcodeGenerator;


class BookingController extends Controller
{
    protected TicketBookingService $ticketBookingService;
    protected RankService $rankService;

    public function __construct(TicketBookingService $ticketBookingService, RankService $rankService)
    {
        $this->ticketBookingService = $ticketBookingService;
        $this->rankService = $rankService;
    }


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
            // Tìm booking theo ID
            $booking = Booking::where('id', $data['vnp_TxnRef'])->first();

            // Cập nhật trạng thái đặt vé
            $booking->status = 'Thanh toán thành công';

            // Tạo mã vạch dưới dạng PNG
            // $generator = new BarcodeGeneratorPNG();
            // $barcode = $generator->getBarcode($booking->id, BarcodeGenerator::TYPE_CODE_128);

            // // Tạo tên file duy nhất cho mã vạch (dựa vào booking ID)
            // $fileName = 'barcode_' . $booking->id . '.png';

            // // Lưu mã vạch vào thư mục 'public/barcodes'
            // Storage::put('public/barcodes/' . $fileName, $barcode);

            // // Đưa đường dẫn đến mã vạch vào phương thức uploadImage
            // $filePath = storage_path('app/public/barcodes/' . $fileName);
            // $imageUrl = $this->uploadImage($filePath); // Gửi ảnh lên ImgBB

            // // Lưu đường dẫn của ảnh mã vạch vào cơ sở dữ liệu (URL từ ImgBB)
            // $booking->barcode = $imageUrl;
            $booking->save();

            $this->rankService->points($booking);

            // Gửi email với hóa đơn và mã vạch
            Mail::to($booking->user->email)->queue(new InvoiceMail($booking));

            // Xoá session
            session()->flush();

            // Chuyển hướng về trang yêu cầu
            return redirect('http://localhost:5173/ticketcinema');
        }

        // Xử lý khi mã phản hồi không phải '00'
        return redirect('http://localhost:5173/ticketcinema')->with('error', 'Payment failed');
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


    // public function selectSeats(Request $request)
    // {
    //     $seats = $request->input('seats'); // Ghế người dùng chọn

    //     // Kiểm tra nếu không có ghế được chọn
    //     if (empty($seats)) {
    //         return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
    //     }
    //     if (is_array($seats) && count($seats) > 10) {
    //         return response()->json(['status' => false, 'message' => 'You can only select up to 10 seats.'], 400);
    //     }

    //     if (!$seats) {
    //         return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
    //     }
    //     // Sắp xếp các ghế đã chọn theo `seat_name` (theo tên ghế)
    //     $gapIssue = $this->hasGapIssue($seats);
    //     if ($gapIssue) {
    //         return $gapIssue;  // Trả về lỗi nếu có khoảng trống
    //     }
    //     // Nếu không có lỗi, tiếp tục xử lý ghế đã chọn
    //     $saveSeats = $this->saveSeats($seats);
    //     if ($saveSeats) {
    //         return $saveSeats;
    //     }
    // }

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
                        ->where('showtime_id', $seatData['showtime_id'])
                        ->first();

                    if ($seat) {
                        // Lưu ghế đã tồn tại vào danh sách lỗi
                        $existingSeats[] = $seat->toArray();
                    } else {
                        // Tạo ghế mới
                        $seatCreate = Seats::create($seatData);
                        if ($seatCreate) {
                            $generator = new BarcodeGeneratorPNG();
                            $barcode = $generator->getBarcode($seatCreate->id.now()->format('Ymd'), BarcodeGenerator::TYPE_CODE_128);

                            // Tạo tên file duy nhất cho mã vạch (dựa vào ID của ghế)
                            $fileName = 'barcode_' . $seatCreate->id.now()->format('Ymd') . '.png';

                            // Lưu mã vạch vào thư mục 'public/barcodes'
                            Storage::put('public/barcodes/' . $fileName, $barcode);

                            // Đường dẫn đến file mã vạch
                            $filePath = storage_path('app/public/barcodes/' . $fileName);

                            // Gửi ảnh mã vạch lên ImgBB và nhận URL
                            $imageUrl = $this->uploadImage($filePath);
                            $code = $seatCreate->id.now()->format('Ymd');
                            // Cập nhật đường dẫn mã vạch vào cơ sở dữ liệu
                            $seatCreate->barcode = $imageUrl;
                            $seatCreate->code= $code;
                            $seatCreate->save();
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


    public function selectSeats(Request $request)
    {
        $seats = $request->input('seats'); // Ghế người dùng chọn
        $totalSeatsInRows = $request->input('totalSeatsInRows'); // Tổng số ghế trong từng hàng
        $showtime_id = $request->input('showtimeId');
        Log::info("totalSeatsInRows: " . json_encode($totalSeatsInRows));

        if (empty($seats)) {
            return response()->json(['status' => false, 'message' => 'Please select at least one seat.'], 400);
        }
        if (is_array($seats) && count($seats) > 10) {
            return response()->json(['status' => false, 'message' => 'You can only select up to 10 seats.'], 400);
        }

        $gapIssue = $this->hasGapIssue($seats, $totalSeatsInRows, $showtime_id);
        if ($gapIssue) {
            return $gapIssue; // Trả về lỗi nếu có khoảng trống
        }

        $saveSeats = $this->saveSeats($seats);
        if ($saveSeats) {
            return $saveSeats;
        }
    }

    public function hasGapIssue($seats, $totalSeatsInRows, $showtime_id)
    {
        usort($seats, function ($a, $b) {
            return strcmp($a['seat_name'], $b['seat_name']); // Sắp xếp theo tên ghế
        });

        $selectedRows = [];
        foreach ($seats as $seat) {
            preg_match('/([A-Za-z]+)(\d+)/', $seat['seat_name'], $match);
            $row = $match[1]; // Hàng
            $column = (int)$match[2]; // Cột

            if (!isset($selectedRows[$row])) {
                $selectedRows[$row] = [];
            }
            $selectedRows[$row][] = $column;
        }
        $missingSeats = [];
        foreach ($selectedRows as $row => $columns) {
            sort($columns);

            // Lấy danh sách ghế đã được mua trong phòng và hàng
            $purchasedSeats = Seats::where('showtime_id', $showtime_id)
                ->get()->toArray();
            // Tạo danh sách hợp nhất các ghế (cột) đã mua và đang chọn
            $purchasedColumns = array_map(fn($seat) => $seat['seat_column'], $purchasedSeats);
            $combinedSeats = array_merge($purchasedColumns, $columns);
            sort($combinedSeats);

            // Kiểm tra khoảng trống giữa các ghế (bao gồm cả ghế đã mua)
            for ($i = 0; $i < count($combinedSeats) - 1; $i++) {
                if ($combinedSeats[$i + 1] - $combinedSeats[$i] == 2) {
                    $missingColumn = $combinedSeats[$i] + 1;

                    // Xác định tên ghế bị thiếu (tên đầy đủ)
                    $missingSeatName = $row . $missingColumn;

                    $missingSeats[] = $missingSeatName;
                }
            }

            $firstColumn = $combinedSeats[0];
            $lastColumn = end($combinedSeats);
            $maxColumn = $this->getMaxColumnForRow($row, $totalSeatsInRows);


            // Kiểm tra bỏ ghế đầu hàng
            if ($firstColumn > 1 && $firstColumn < 3) {
                $missingSeats[] = $row . $firstColumn - 1;
            }
            if ($maxColumn - $lastColumn == 1) {
                $missingSeats[] = $row . $maxColumn;
            }
        }
        if (!empty($missingSeats)) {
            return response()->json([
                'status' => false,
                'message' => 'Please select consecutive seats without gaps.',
                'data' => [
                    'missing_seats' => $missingSeats, // Trả về danh sách các ghế bị thiếu theo hàng
                ]
            ], 402);
        }

        return null; // Không có lỗi
    }

    private function getMaxColumnForRow($row, $totalSeatsInRows)
    {
        return $totalSeatsInRows[$row] ?? 0; // Trả về số ghế tối đa trong hàng, nếu không tìm thấy trả về 0
    }

    public  function dispatchResetSeatsJob(array $seatIds): void
    {
        // Dispatch một job với toàn bộ các ID ghế đã được tạo
        ResetSeats::dispatch($seatIds)->delay(now()->addMinutes(5));
    }

    public function selectedSeats(Request $request, $roomId)
    {

        $seats = $request->input('seats'); // Ghế người dùng chọn
        // $roomId = $request->input('roomId'); // Lấy roomId từ client (dưới dạng POST)

        if (is_array($seats) && count($seats) > 10) {
            return $this->error('You can only select up to 10 seats.', 400);
        }

        // Broadcast sự kiện ghế đã chọn
        broadcast(new SeatSelected($seats, Auth::id(), $roomId));
        Log::info('Broadcasted SeatSelected event successfully', [
            'seats' => $seats,
            'userId' => Auth::id(),
            'roomId' => $roomId
        ]);
        return $this->success($seats, 'Selected seats successfully.');
    }
}
