<?php
namespace App\Services;

use App\Mail\ResetPasswordOtpMail;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;

class OtpService
{
    protected $otpExpiration = 300;
    public function sendOtp($email)
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw new \Exception('Không tìm thấy người dùng với email này.');
        }

        $otp = rand(100000, 999999); // Tạo OTP ngẫu nhiên 6 số

        Cache::put('otp_' . $email, $otp, $this->otpExpiration); // Lưu OTP vào cache

        Mail::to($user->email)->queue(new ResetPasswordOtpMail($otp));

        return 'Mã OTP đã được gửi đến email của bạn.';
    }

    public function verifyOtp($otp)
    {
        // Lấy email từ session
        $email = Session::get('reset_password_email');

        if (!$email) {
            throw new \Exception('Không tìm thấy email trong phiên làm việc.');
        }

        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp) {
            throw new \Exception('OTP đã hết hạn hoặc không hợp lệ.');
        }

        if ($cachedOtp !== $otp) {
            throw new \Exception('Mã OTP không đúng.');
        }

        // Xác thực OTP thành công, lưu trạng thái đã xác thực
        Cache::forget('otp_' . $email); // Xóa OTP cũ
        Cache::put('otp_verified_' . $email, true, $this->otpExpiration); // Đặt trạng thái đã xác thực

        return 'OTP đã xác thực thành công.';
    }

    public function canResetPassword()
    {
        $email = Session::get('reset_password_email');

        if (!$email) {
            return false;
        }

        return Cache::has('otp_verified_' . $email); // Kiểm tra OTP đã được xác thực chưa
    }

    public function clearOtpVerification()
    {
        $email = Session::get('reset_password_email');
        Cache::forget('otp_verified_' . $email); // Xóa trạng thái xác thực OTP
        Session::forget('reset_password_email'); // Xóa email khỏi session
    }
}