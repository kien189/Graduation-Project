<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Cinema\ShowtimeController;
use App\Http\Controllers\Api\Role\RoleController as RoleRoleController;
use App\Http\Controllers\Client\LoginController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoleController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

 Route::get('/', function () {
     return phpinfo();
 });





    // Route::resource('roles', RoleController::class);
    // Route::post('roles/{role}/permissions', [RoleController::class, 'syncPermissions'])->name('roles.syncPermissions');



    Route::get('/admin/scan', function () {
        return view('admin.scan');
    });





