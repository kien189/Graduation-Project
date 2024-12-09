<?php
namespace App\Services\Combo;

use App\Models\Combo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ComboService
{
    protected function filterByCinema($query)
    {
        $user = Auth::user();

        if ($user && $user->hasRole('manager')) {
            // Manager chỉ thấy combo của rạp mà họ quản lý
            $query->where('cinema_id', $user->cinema_id);
        }

        return $query;
    }

    public function index(): Collection
    {
        $query = Combo::orderByDesc('created_at');
        return $this->filterByCinema($query)->get();
    }

    public function store(array $data): Combo
    {
        $user = Auth::user();

        if ($user && $user->hasRole('manager')) {
            $data['cinema_id'] = $user->cinema_id;
        }

        return Combo::create($data);
    }

    public function update(int $id, array $data): Combo
    {
        $combo = $this->filterByCinema(Combo::where('id', $id))->firstOrFail();
        $combo->update($data);
        return $combo;
    }

    public function delete(int $id): ?bool
    {
        $combo = $this->filterByCinema(Combo::where('id', $id))->firstOrFail();
        return $combo->delete();
    }

    public function get(int $id): Combo
    {
        return $this->filterByCinema(Combo::where('id', $id))->firstOrFail();
    }
}
