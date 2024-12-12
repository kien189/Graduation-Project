<?php

use App\Http\Controllers\Api\Booking\BookingController;
use App\Http\Controllers\Api\Google\GoongMapController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\News\NewController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Filter\FilterByDateController;
use App\Http\Controllers\Api\Cinema\RoomController;
use App\Http\Controllers\Api\Combo\ComboController;
use App\Http\Controllers\Api\Movie\ActorController;
use App\Http\Controllers\Api\Movie\MovieController;
use App\Http\Controllers\Api\Cinema\CinemaController;
use App\Http\Controllers\Api\Movie\DirectorController;
use App\Http\Controllers\Api\Movie\FavoriteController;
use App\Http\Controllers\Api\Cinema\LocationController;
use App\Http\Controllers\Api\Cinema\ShowtimeController;
use App\Http\Controllers\Api\News\NewCategoryController;
use App\Http\Controllers\Api\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\Movie\MovieCategoryController;
use App\Http\Controllers\Api\PayMethod\PayMethodController;
use App\Http\Controllers\Api\Auth\AccountVerificationController;
use App\Http\Controllers\Api\Auth\ResetPasswordController;
use App\Http\Controllers\Api\Booking\BookingStaffController;
use App\Http\Controllers\Api\Booking\CheckInTicketController;
use App\Http\Controllers\Api\Filter\DashBoard\FilterOfDashBoarchController;
use App\Http\Controllers\Api\Filter\FilterMovieByNewController;
use App\Http\Controllers\Api\Google\GoogleController;
use App\Http\Controllers\Api\Movie\RatingController;
use App\Http\Controllers\Api\Order\OrderController;
use App\Http\Controllers\Api\Revenue\DashboardAdminController;
use App\Http\Controllers\Api\Revenue\RevenueController;
use App\Http\Controllers\Api\Revenue\RevenueMovieController;
use App\Http\Controllers\Api\Role\RoleController;
use App\Http\Controllers\Api\Seat\SeatController;
use App\Http\Controllers\Api\Promotion\PromotionController;
use App\Http\Controllers\Api\Ranks\RankContrller;
use App\Http\Controllers\Api\SeatMap\SeatMapController;
use App\Http\Controllers\Api\SeatMap\MatrixController;
use App\Http\Controllers\Api\WebsiteSetting\WebsiteSettingController;
use App\Http\Controllers\ConfigController;


// Các tuyến xác thực công khai
Route::post('login', [AuthController::class, 'login']);
Route::post('/get-google-sign-in-url', [GoogleController::class, 'getGoogleSignInUrl']); // lấy url login google
Route::get('/callback', [GoogleController::class, 'loginCallback']);  // login google
Route::get('/autocomplete', [GoongMapController::class, 'autocomplete']);
Route::post('logout', [AuthController::class, 'logout']);
Route::post('register', [AuthController::class, 'register']); // Đăng ký người dùng

Route::post('password/send-otp', [ForgotPasswordController::class, 'sendOtp']);                     // Gửi OTP đến email
Route::post('password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);                 // Xác minh OTP
Route::post('password/reset', [ForgotPasswordController::class, 'forgotPassword']);                 // Đặt lại mật khẩu
Route::get('/verify-account/{userId}', [AccountVerificationController::class, 'verify'])->name('verify'); // verify account
Route::post('/resetPassword', [ResetPasswordController::class, 'resetPassword'])->middleware('auth:sanctum');

// Các tuyến có thể truy cập được cho người dùng được xác thực
Route::middleware(['auth:sanctum', 'web'])->group(function () {
    Route::post('favorites/{movie_id}', [FavoriteController::class, 'store']);                 // Thêm phim yêu thích
    Route::delete('favorites/{movie_id}', [FavoriteController::class, 'destroy']);             // Xóa phim yêu thích
    Route::post('ratings', [RatingController::class, 'store']);                                // Phim đánh giá
    Route::middleware(['auth:sanctum', 'web'])->group(function () {
        Route::post('favorites/{movie}', [FavoriteController::class, 'store']);                 // Thêm phim yêu thích
        Route::delete('favorites/{movie}', [FavoriteController::class, 'destroy']);             // Xóa phim yêu thích
        Route::apiResource('user', AuthController::class);
        Route::get('/user', function (Request $request) {
            $user = $request->user()->load('favoriteMovies');
            return response()->json($user);
        });
    });
});


// người chưa đăng nhập có thể xem tất cả ở trạng thái status 1
Route::group([], function () {
    Route::apiResource('location', LocationController::class)->only(['index', 'show']);
    Route::apiResource('news_category', NewCategoryController::class)->only(['index', 'show']);
    Route::apiResource('news', NewController::class)->only(['index', 'show']);
    Route::apiResource('movie-category', MovieCategoryController::class)->only(['index', 'show']);
    Route::apiResource('movies', MovieController::class)->only(['index', 'show']);
    Route::apiResource('actor', ActorController::class)->only(['index', 'show']);
    Route::apiResource('director', DirectorController::class)->only(['index', 'show']);
    Route::apiResource('seat', SeatController::class)->only(['index', 'show']);
    Route::apiResource('method', PayMethodController::class)->only(['index', 'show']);
    Route::apiResource('room', RoomController::class)->only(['index', 'show']);
    Route::apiResource('showtimes', ShowtimeController::class)->only(['index', 'show']);
    Route::apiResource('cinema', CinemaController::class)->only(['index', 'show']);
    Route::get('/cinema/{id}/room', [RoomController::class, 'getRoomByCinema']);
    Route::get('/filterByDate', [FilterByDateController::class, 'filterByDate']);
    Route::get('/filterByDateByMovie', [FilterByDateController::class, 'filterByDateByMovie']);
});



// Admin: Full access to all features
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    // CRUD Routes
    Route::apiResource('cinema', CinemaController::class); // CRUD rạp
    Route::apiResource('method', PayMethodController::class);
    Route::apiResource('ranks', RankContrller::class); // CRUD ranks

    // Authentication & Users
    Route::get('/all-user', [AuthController::class, 'allUser']);
    Route::delete('/delete-user/{id}', [RoleController::class, 'destroyUser'])->name('roles.destroyUser'); // Delete user

    // Role Management
    Route::apiResource('roles', RoleController::class);
    Route::post('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions.sync'); // Gán quyền cho vai trò
    Route::post('/roles/{user}/users', [RoleController::class, 'syncRoles'])->name('users.roles.sync'); // gán vai trò cho người dùng
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy'); // Xóa vai trò

    // Revenue Statistics
    Route::get('all-revenue-cinema', [RevenueController::class, 'allRevenueCinema']); // All cinema revenue
    Route::get('total-revenue/{status}', [RevenueController::class, 'totalRevenue']); // Revenue by status
    Route::get('total-revenue-cinema/{cinema_id}', [RevenueController::class, 'totalRevenueByCinema']); // Revenue by cinema
    Route::get('total-revenue-by-date/{start_date}/{end_date}', [RevenueController::class, 'totalRevenueBetweenDates']); // Revenue by date range
    Route::get('total-revenue-cinema-by-date/{cinema_id}/{start_date}/{end_date}', [RevenueController::class, 'totalRevenueByCinemaBetweenDates']); // Revenue by cinema and date range

    // Dashboard and Filters
    Route::get('filter-dashboard', [FilterOfDashBoarchController::class, 'filterOfDashBoarch']); // Filter dashboard data
    Route::get('/dashboard', [DashboardAdminController::class, 'dashboardAdmin']); // Dashboard page

    // Website Settings
    Route::post('/website-settings', [WebsiteSettingController::class, 'index']); // List Website Settings
    Route::post('/website-settings/update/{id}', [WebsiteSettingController::class, 'update']); // Update Website Settings
    Route::post('/website-settings/reset', [WebsiteSettingController::class, 'reset']); // Reset Website Settings

    //status
    Route::post('movieStatus/{id}', [MovieController::class, 'status']);
    Route::post('showtimeStatus/{id}', [ShowtimeController::class, 'status']);
    Route::post('newStatus/{id}', [NewCategoryController::class, 'status']);
    Route::post('comboStatus/{id}', [ComboController::class, 'status']);
    Route::post('userStatus/{id}', [RoleController::class, 'status']);
});

// Manager: Limited access to their assigned cinemas and related data
Route::middleware(['auth:sanctum', 'role:manager'])->prefix('manager')->group(function () {
    // Seat Map Management
    Route::apiResource('cinema', CinemaController::class); // CRUD rạp
    Route::prefix('seat-maps')->group(function () {
        Route::get('/', [SeatMapController::class, 'index']); // List seat maps
        Route::get('/{id}', [SeatMapController::class, 'show']); // Show seat map
        Route::post('/', [SeatMapController::class, 'store']); // Add seat map
        Route::put('/{id}', [SeatMapController::class, 'update']); // Update seat map
        Route::delete('/{id}', [SeatMapController::class, 'destroy']); // Delete seat map
    });

    // Movies, Rooms, and Showtimes
    Route::apiResource('movies', MovieController::class); // Manage movies
    Route::apiResource('room', RoomController::class); // Manage rooms
    Route::apiResource('showtimes', ShowtimeController::class); // Manage showtimes
    Route::post('showtimePayload', [ShowtimeController::class, 'storeWithTimeRange']); // Add showtimes automatically

    // Combos and Categories
    Route::apiResource('combo', ComboController::class);
    Route::apiResource('actor', ActorController::class);
    Route::apiResource('director', DirectorController::class);
    Route::apiResource('movie-category', MovieCategoryController::class);
    Route::apiResource('promotions', PromotionController::class); // Manage vouchers
    Route::apiResource('news_category', NewCategoryController::class);
    Route::apiResource('news', NewController::class);

    //Phân quyền
    Route::apiResource('roles', RoleController::class);
    Route::post('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions.sync'); // Gán quyền cho vai trò
    Route::post('/roles/{user}/users', [RoleController::class, 'syncRoles'])->name('users.roles.sync'); // gán vai trò cho người dùng
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy'); // Xóa vai trò


    // Dashboard and Filters
    Route::get('filter-dashboard', [FilterOfDashBoarchController::class, 'filterOfDashBoarch']); // Filter dashboard data
    Route::get('/dashboard', [DashboardAdminController::class, 'dashboardAdmin']); // Dashboard page

    // status
    Route::post('movieStatus/{id}', [MovieController::class, 'status']);
    Route::post('showtimeStatus/{id}', [ShowtimeController::class, 'status']);
    Route::post('newStatus/{id}', [NewCategoryController::class, 'status']);
    Route::post('comboStatus/{id}', [ComboController::class, 'status']);
    Route::post('userStatus/{id}', [RoleController::class, 'status']);

    // Ticket Printing
    Route::post('printTicket', [OrderController::class, 'printTicket']); // Print ticket and change status

    //checkin ghế barcode
    Route::post('checkInSeat/{code}', [CheckInTicketController::class, 'checkInSeat']);
    Route::post('checkInBooking/{code}', [CheckInTicketController::class, 'checkInBooking']);
});

Route::middleware(['auth:sanctum', 'role:staff'])->prefix('staff')->group(function () {
    // Ticket Printing
    Route::post('printTicket', [OrderController::class, 'printTicket']); // in vé và thay đổi trạng thái
    //checkin ghế barcode
    Route::post('checkInSeat/{code}', [CheckInTicketController::class, 'checkInSeat']);
    Route::post('checkInBooking/{code}', [CheckInTicketController::class, 'checkInBooking']);
});


// Các tuyến đường dành riêng cho phim
Route::get('/movie/search/{movie_name}', [MovieController::class, 'search']);                       // Tìm kiếm phim theo tên
Route::get('showtimes/movie/{movie_name}', [ShowtimeController::class, 'showtimeByMovieName']);     // Showtimes by movie name
Route::get('filterMovie/{id}', [CinemaController::class, 'filterMovie']);                           // Phim lọc của điện ảnh
Route::get('/movie/{category}', [MovieController::class, 'movieByCategory']);                       // Lọc Phim theo thể loại
Route::get('/new/{category}', [NewController::class, 'newByCategory']);                             // Lọc chuyên đề theo thể loại
Route::get('/fillMovies/upcoming', [MovieController::class, 'getUpcomingMovies']);                  // Lọc Phim sắp chiếu
Route::get('/fillMovies/comingSoon', [MovieController::class, 'getComingSoonMovie']);               // Lọc Phim chiếu sớm
Route::get('cinema-by-location/{id}', [CinemaController::class, 'showCinemaByLocation']);
Route::get('filterMovieByNew', [FilterMovieByNewController::class, 'filterMovieByNew']);
Route::get('filterNewByActor/{actor}', [ActorController::class, 'filterNewByActor']);                // Lọc bài viết liên quan tới diễn viễn
Route::get('filterNewByDictor/{director}', [DirectorController::class, 'filterNewByDictor']);        // Lọc bài viết liên quan tới đạo diễn
Route::get('filterNewByMovie/{movie}', [MovieController::class, 'filterNewByMovie']);                // Lọc bài viết liên quan tới phim
Route::get('ratings/{movie}', [RatingController::class, 'show']);                                    // Xem dánh giá phim
Route::get('rating', [RatingController::class, 'index']);                                            // Xem all dánh giá
Route::get('filterMoviePopular', [MovieController::class, 'moviePopular']);                          // Lọc bài viết liên quan tới phim

Route::apiResource('order', OrderController::class);

Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::post('/slectMovieAndSeats', [BookingController::class, 'slectMovieAndSeats']);
    Route::post('/selectCombo', [BookingController::class, 'selectCombos']);

    //Bokking=======================
    Route::post('selectSeats', [BookingController::class, 'selectSeats']);
    Route::post('/book-ticket', [BookingController::class, 'bookTicket']);
    Route::post('/seat-selection/{roomId}', [BookingController::class, 'selectedSeats']);

    //BookingStaff==============================
    Route::post('selectSeats-staff', [BookingStaffController::class, 'selectSeats']);
    Route::post('/book-ticket-staff', [BookingStaffController::class, 'bookTicket']);
    Route::post('/seat-selection-staff/{roomId}', [BookingStaffController::class, 'selectedSeats']);
    Route::post('/confirmBooking-staff', [BookingStaffController::class, 'confirmBooking']);
    Route::post('/checkuser', [BookingStaffController::class, 'checkuser']);

    //===============================
    Route::post('/historyOrder', [OrderController::class, 'order']);
    Route::post('/historyOrder/{id}', [OrderController::class, 'orderDetail']);
    Route::get('session', [BookingController::class, 'getSession']);
    Route::get('vouchers', [PromotionController::class, 'getUserVouchers']); // lấy ra vourcher
    Route::post('/use-points', [RankContrller::class, 'usePoints']);                        //Dùng điểm tích lũy và cập nhập cấp bậc
    Route::post('apply-promotion', [PromotionController::class, 'applyPromotion']); // dùng vourcher
});
Route::get('/vnpay-return', [BookingController::class, 'vnPayReturn']);
Route::get('/env-config', [ConfigController::class, 'envConfig']);
