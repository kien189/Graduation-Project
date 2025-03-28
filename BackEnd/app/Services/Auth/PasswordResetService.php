<?php
namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class PasswordResetService
{
    /**
     * Đặt lại mật khẩu cho người dùng
     *
     * @param string $email
     * @param string $password
     * @return void
     * @throws \Exception
     */
    public function resetPassword($data)
    {
        $user = auth()->user(); // Lấy người dùng hiện tại
        if (!Hash::check($data['current_password'], $user->password)) {
            throw new \Exception(__('messages.error_password_old'));
        }

        $user->password = $data['new_password'];
        /** @var \Illuminate\Database\Eloquent\Model $user */
        $user->save();

        return $user;
    }
}
