<?php

namespace Database\Seeders;

use App\Traits\RandomDateTrait;
use GuzzleHttp\Client;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class News extends Seeder
{
    use RandomDateTrait;

    public function run(): void
    {
        $client = new Client();
        $response = $client->get('https://rapchieuphim.com/api/v1/posts');
        $data = json_decode($response->getBody()->getContents(), true);
        $data = array_slice($data, 205, 400);

        // Lấy danh sách movie_id từ bảng movies
        $movieIds = DB::table('movies')->pluck('id');
        $news_category = DB::table('news_category')->pluck('id');

        foreach ($data as $item) {
            $thumbnail = $item['thumbnail'];

            // Kiểm tra nếu thumbnail là đường dẫn tương đối
            if (strpos($thumbnail, 'http') === false) {
                $thumbnail = 'https://rapchieuphim.com' . $thumbnail;
            }

            // Kiểm tra xem ảnh có tồn tại hay không
            try {
                $response = $client->head($thumbnail);
                if ($response->getStatusCode() !== 200) {
                    Log::warning("Poster not found for news: {$item['name']}, skipping.");
                    continue;
                }
            } catch (\Exception $e) {
                Log::warning("Error checking poster for news: {$item['name']}, skipping. Error: {$e->getMessage()}");
                continue;
            }

            // Xử lý content để thêm tiền tố vào các đường dẫn ảnh tương đối
            $content = $item['content'];
            $content = preg_replace_callback(
                '/<img\s+[^>]*src="([^"]+)"/i',
                function ($matches) {
                    $src = $matches[1];
                    if (strpos($src, 'http') === false && strpos($src, '/') === 0) {
                        // Thêm tiền tố nếu src là đường dẫn tương đối
                        $src = 'https://rapchieuphim.com' . $src;
                    }
                    return str_replace($matches[1], $src, $matches[0]);
                },
                $content
            );

            DB::table('news')->insert([
                'user_id' => rand(1, 31),
                'movie_id' => $movieIds->random(),
                'title' => $item['name'],
                'slug' => $item['slug'],
                'content' => $content, // Nội dung đã được xử lý
                'banner' => $thumbnail,
                'thumnail' => $thumbnail,
                'views' => rand(50, 100),
                'cinema_id' => rand(1, 15),
                'news_category_id' => $news_category->random(),
                'created_at' => $this->randomDate('2024-01-01', now()),
                'updated_at' => now(),
            ]);
        }
    }
}
