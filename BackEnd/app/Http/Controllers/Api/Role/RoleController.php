<?php

namespace App\Http\Controllers\Api\Role;

use App\Http\Controllers\Controller;
use App\Models\User as ModelsUser; // Ensure this is your User model
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Http\Request;
// use App\Models\Role;
use App\Models\User;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::all();
        $users = ModelsUser::all();
        $permissions = Permission::all();
        return $this->success([
            'roles' => $roles,
            'users' => $users,
            'permissions' => $permissions
        ]);
    }
    public function show($id)
    {
        $userWithRoles = User::with('roles')->findOrFail($id);
        return $this->success([
            'user' => $userWithRoles,
            'roles' => $userWithRoles->roles
        ], 'success', 200);
    }
    public function syncRoles(Request $request, User $user)
    {
        // Lấy thông tin người dùng hiện tại
        $currentUser = auth()->user();

        // Kiểm tra quyền của người dùng hiện tại
        if ($currentUser->hasRole('manager')) {
            // Người dùng Manager chỉ được gắn vai trò Staff
            if (!empty(array_diff($request->roles, ['staff']))) {
                return response()->json([
                    'message' => 'Bạn chỉ được phép gán vai trò "nhân viên".'
                ], 403);
            }
        }

        // Validate dữ liệu
        $validated = $request->validate([
            'roles' => 'array|required',
            'cinema_id' => 'required_if:roles,manager|exists:cinema,id',
        ]);

        // Gán roles cho user
        $user->syncRoles($request->roles);

        // Nếu user được gán vai trò Manager, gán cinema_id
        if (in_array('manager', $request->roles)) {
            $user->cinema_id = $request->cinema_id;
            $user->save();
        } else {
            // Xóa cinema_id nếu vai trò không còn là Manager
            $user->cinema_id = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Vai trò và điện ảnh được giao thành công.'
        ], 200);
    }





    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'cinema_id' => 'nullable|integer|exists:cinema,id', // Thêm ràng buộc cinema_id
        ]);

        $role = Role::create(['name' => $request->name]);

        if ($request->cinema_id) {
            // Gán cinema_id cho manager
            $role->cinema_id = $request->cinema_id;
            $role->save();
        }

        return $this->success($role, 'Role created successfully', 201);
    }


    public function syncPermissions(Request $request, Role $role)
    {
        return $role->syncPermissions($request->permissions);
    }

    // public function syncRoles(Request $request, User $user)
    // {
    //     return $user->syncRoles($request->roles);
    // }

    public function destroy(Role $role)
    {
        $role->delete();
        return $this->success([], 'delete succuess', 200);
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return $this->success([], 'delete succuess', 200);
    }

    public function status(int $id)
    {
        $movie = User::findOrFail($id);
        $movie->status = $movie->status == 1 ? 0 : 1;
        $movie->save();
        return $this->success('', 'Cập nhật trạng thái thành công.', 200);
    }
}
