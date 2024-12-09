<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Models\Rank;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        $this->call([

            LocationSeeder::class,
            CinemaSeeder::class,
            // SeatMapSeeder::class,
            // RoomSeeder::class,
            PayMethodSeeder::class,
            ComboSeeder::class,
            ActorSeeder::class,
            DirectorSeeder::class,
            MovieCategorySeeder::class,
            NewsCategorySeeder::class,
            RankSeeder::class,
            MovieSeeder::class,
            UserSeeder::class,
            News::class,
            ActorInMovie::class,
            DirectorInMovie::class,
            CategoryInMovieSeeder::class,
            RatingSeeder::class,
            FavoriteSeeder::class,
            // SeatLayoutSeeder::class,
            // MovieInCinema::class,
            // ShowtimeSeeder::class,
            // CategorySeatSeeder::class,
            // BookingSeeder::class,
            WebsiteSettingsSeeder::class,
            VorcherSeeder::class,
        ]);
        // Tạo các quyền
        $permissions = [
            'index',
            'show',
            'create',
            'store',
            'edit',
            'update',
            'destroy'
        ];

        foreach ($permissions as $permission) {
            // kiểm tra xem có phải sự cho phép đã tồn tại không, nếu không, hãy tạo nó
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Tạo vai trò và gán các quyền cho mỗi vai trò
        $roles = [
            'admin',
            'manager',
            'staff',
            'user',
        ];

        foreach ($roles as $roleName) {
            // kiểm tra xem vai trò đã tồn tại, nếu không, hãy tạo nó
            $role = Role::firstOrCreate(['name' => $roleName]);

            // Gán tất cả các quyền cho vai trò 'admin'
            if ($roleName === 'admin') {
                $role->givePermissionTo(Permission::all()); // Gán tất cả quyền cho vai trò admin
            } else {
                // Gán một vài quyền cho các vai trò khác (ví dụ: chỉ index, show)
                $role->givePermissionTo(['index', 'show']);
            }
        }


        $users = User::all();
        foreach ($users as $user) {
            if ($user->id === 1) {
                $user->assignRole('admin');
            } else {
                $user->assignRole('user');
            }
        }
    }
}
