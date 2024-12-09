<?php

namespace App\Services\News;

use App\Models\News;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class NewService
{
    protected function filterByCinema($query)
    {
        $user = Auth::user();


        if (!$user) {
            // Người chưa đăng nhập: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        } elseif ($user->hasRole('manager')) {
            // Manager: chỉ lấy rạp theo cinema_id của họ
            $query->where('cinema_id', $user->cinema_id);
        } elseif (!$user->hasRole('admin')) {
            // Người dùng không phải admin: chỉ lấy rạp có status = 1
            $query->where('status', 1);
        }

        return $query;
    }

    public function index(): Collection
    {
        $query = News::with(['user', 'newsCategory'])->orderByDesc('created_at');
        return $this->filterByCinema($query)->get();
    }

    public function store(array $data): News
    {
        $user = Auth::user();
        if ($user && $user->hasRole('manager')) {
            $data['cinema_id'] = $user->cinema_id;
        }

        return News::create($data);
    }

    public function update(int $id, array $data): News
    {
        $news = $this->filterByCinema(News::where('id', $id))->firstOrFail();
        $news->update($data);
        return $news;
    }

    public function delete(int $id): ?bool
    {
        $news = $this->filterByCinema(News::where('id', $id))->firstOrFail();
        return $news->delete();
    }

    public function show($identifier): News
    {
        $query = News::with(['newsCategory', 'movie', 'user'])
            ->when(is_numeric($identifier), function ($q) use ($identifier) {
                return $q->where('id', $identifier);
            }, function ($q) use ($identifier) {
                return $q->where('slug', $identifier);
            });

        $news = $this->filterByCinema($query)->firstOrFail();
        $news->increment('views'); // Tăng số lượt xem
        return $news;
    }
}
