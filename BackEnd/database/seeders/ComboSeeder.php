<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComboSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('combos')->insert([
            [
                'combo_name' => 'Combo Gấu',
                'descripton' => 'Món ngon giá đẹp',
                'price' => 119000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Poca Khoai Tây 54gr',
                'descripton' => 'Món ngon giá đẹp',
                'price' => 28000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Poca Wavy 54gr',
                'descripton' => 'Món ngon giá đẹp',
                'price' => 28000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Fanta 32oz',
                'descripton' => 'Món ngon giá đẹp',
                'price' => 37000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Combo Nhà Gấu',
                'descripton' => '4 Coke 22oz + 2 Bắp 2 Ngăn 64OZ Phô Mai + Caramel',
                'price' => 259000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Combo Hotdog',
                'descripton' => '1 HOTDOG + 1 Coke 22oz',
                'price' => 490009,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Combo Couple',
                'descripton' => '1 Bắp Ngọt 60oz + 2 Coke 32oz',
                'price' => 115000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Combo Solo',
                'descripton' => '1 Bắp Ngọt 60oz + 1 Coke 32oz',
                'price' => 94000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ],
            [
                'combo_name' => 'Combo Party',
                'descripton' => '2 Bắp Ngọt 60oz + 4 Coke 32oz',
                'price' => 209000,
                'volume' => 999,
                'cinema_id' => rand(1, 198),
            ]


        ]);
    }
}
