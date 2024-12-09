<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VorcherSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [];

        for ($i = 0; $i < 10; $i++) {
            $data[] = [
                'code' => 'DISCOUNT' . rand(1, 9999),
                'discount_percentage' => rand(1, 50),
                'max_discount' => 100000,
                'min_purchase' => 200000,
                'valid_from' => '2024-11-01 00:00:00',
                'valid_to' => '2024-12-31 23:59:59',
                'is_active' => true,
                'cinema_id' => rand(1, 198),
            ];
        }

        DB::table('promotions')->insert($data);
    }
}
