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
    Route::apiResource('location', LocationController::class);
    Route::apiResource('news_category', NewCategoryController::class);
    Route::apiResource('news', NewController::class);
    Route::apiResource('movie-category', MovieCategoryController::class);
    Route::apiResource('movies', MovieController::class);
    Route::apiResource('actor', ActorController::class);
    Route::apiResource('director', DirectorController::class);
    Route::apiResource('combo', ComboController::class);
    Route::apiResource('seat', SeatController::class);
    Route::apiResource('method', PayMethodController::class);
    Route::apiResource('room', RoomController::class);
    Route::apiResource('showtimes', ShowtimeController::class);
    Route::apiResource('cinema', CinemaController::class);
    Route::get('/cinema/{id}/room', [RoomController::class, 'getRoomByCinema']);
    Route::get('/filterByDate', [FilterByDateController::class, 'filterByDate']);
    Route::get('/filterByDateByMovie', [FilterByDateController::class, 'filterByDateByMovie']);
});



//admin có tất cả mọi quyền
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('cinema', CinemaController::class); // crud rạp
    Route::get('/all-user', [AuthController::class, 'allUser']);
    Route::apiResource('method', PayMethodController::class);
    Route::apiResource('movies', MovieController::class);
    Route::apiResource('room', RoomController::class); // crud phòng
    Route::apiResource('showtimes', ShowtimeController::class); // crud suất chiếu
    Route::apiResource('combo', ComboController::class);
    Route::apiResource('actor', ActorController::class);
    Route::apiResource('director', DirectorController::class);
    Route::apiResource('movie-category', MovieCategoryController::class);
    Route::apiResource('promotions', PromotionController::class); // crud vourcher
    Route::apiResource('news_category', NewCategoryController::class);
    Route::apiResource('news', NewController::class);
    // phan quyen
    Route::apiResource('roles', RoleController::class); // add roles and show
    Route::post('/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.permissions.sync'); // chia chuc nang cho quyen
    Route::post('/roles/{user}/users', [RoleController::class, 'syncRoles'])->name('users.roles.sync'); // cap quyen cho user
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy'); // delete role
    Route::delete('/delete-user/{id}', [RoleController::class, 'destroy'])->name('roles.destroyUser'); // delete role
    Route::get('allRevenueCinema', [RevenueController::class, 'allRevenueCinema']); // Doanh thu cuả tất cả các rạp
    // Thống kê doanh thu theo rạp vào ngày
    Route::get('total-revenue/{status}', [RevenueController::class, 'totalRevenue']);
    Route::get('total-revenue-cinema/{cinema_id}', [RevenueController::class, 'totalRevenueByCinema']);
    Route::get('total-revenue-by-date/{start_date}/{end_date}', [RevenueController::class, 'totalRevenueBetweenDates']);
    Route::get('total-revenue-cinema-by-date/{cinema_id}/{start_date}/{end_date}', [RevenueController::class, 'totalRevenueByCinemaBetweenDates']);

    // bộ lọc thông kê doanh thu
    Route::get('filter-DashBoarch', [FilterOfDashBoarchController::class, 'filterOfDashBoarch']);
    //Trang dashboard
    Route::get('/dashboard', [DashboardAdminController::class, 'dashboardAdmin']);
    //Cấu hình website
    Route::post('/website-settings', [WebsiteSettingController::class, 'index']);               //Danh sách Website Settings
    Route::post('/website-settings/update/{id}', [WebsiteSettingController::class, 'update']);  //Cập Nhập Website Settings
    Route::post('/website-settings/reset', [WebsiteSettingController::class, 'reset']);         //Cập Nhập Website Settings
    Route::apiResource('ranks', RankContrller::class); // crud ranks
});

// manager chỉ có thể xem thông tin và rạp của mình
Route::middleware(['auth:sanctum', 'role:manager'])->group(function () {
    Route::apiResource('movies', MovieController::class);
    Route::apiResource('room', RoomController::class); // crud phòng
    Route::apiResource('showtimes', ShowtimeController::class); // crud suất chiếu
    Route::post('showtimePayload', [ShowtimeController::class, 'storeWithTimeRange']); // thêm phim tự động
    Route::apiResource('combo', ComboController::class);
    Route::apiResource('actor', ActorController::class);
    Route::apiResource('director', DirectorController::class);
    Route::apiResource('movie-category', MovieCategoryController::class);
    Route::apiResource('promotions', PromotionController::class); // crud vourcher
    Route::apiResource('news_category', NewCategoryController::class);
    Route::apiResource('news', NewController::class);
    //crud sơ đồ ghế
    Route::prefix('seat-maps')->group(function () {
        Route::get('/', [SeatMapController::class, 'index']);
        Route::get('/{id}', [SeatMapController::class, 'show']);
        Route::post('/', [SeatMapController::class, 'store']);
        Route::put('/{id}', [SeatMapController::class, 'update']);
        Route::delete('/{id}', [SeatMapController::class, 'destroy']);
    });
    Route::post('printTicket', [OrderController::class, 'printTicket']); // in vé thay đổi trạng thái
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
