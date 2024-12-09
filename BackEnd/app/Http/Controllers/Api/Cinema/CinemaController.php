<?php

namespace App\Http\Controllers\Api\Cinema;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreCinemaRequest;
use App\Http\Requests\Update\UpdateCinemaRequest;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\MovieInCinema;
use Illuminate\Http\Request;
use App\Services\Cinema\CinemaService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CinemaController extends Controller
{
    protected $cinemaService;

    public function __construct(CinemaService $cinemaService)
    {
        $this->cinemaService = $cinemaService;
    }

    public function index()
    {
        $cinemas = $this->cinemaService->index();
        return $this->success($cinemas);
    }
    public function show($id)
    {
        try {
            $cinema = $this->cinemaService->get($id);

            if (!$cinema) {
                return response()->json(['error' => 'Cinema not found'], 404);
            }

            return $this->success($cinema);
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }


    public function store(StoreCinemaRequest $request)
    {
        $cinema = $this->cinemaService->store($request->validated());
        return $this->success($cinema);
    }
    

    public function status(int $id)
    {
        $movie = Cinema::findOrFail($id);
        $movie->status = $movie->status == 1 ? 0 : 1;
        $movie->save();
        return $this->success('', 'Cập nhật trạng thái thành công.', 200);
    }




    public function update(UpdateCinemaRequest $request, $id)
    {
        try {
            $cinema = $this->cinemaService->update($id, $request->validated());
            return $this->success($cinema);
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    public function destroy($id)
    {
        try {
            return $this->success($this->cinemaService->delete($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }


    public function filterMovie($id)
    {
        try {
            $movies = MovieInCinema::where('cinema_id', $id)->with('showtimes')->get();
            if ($movies->isEmpty()) {
                return $this->error('Không có phim trong rạp này .');
            }
            return $this->success($movies, 'Lấy phim thành công');
        } catch (\Throwable $th) {
            return response()->json([
                'status' => 'fail',
                'data' => $th->getMessage()
            ]);
        }

    }
    public function showCinemaByLocation($id)
    {
        try {
            $cinema = $this->cinemaService->showCinemaByLocation($id);
            if ($cinema) {
                return $this->success($cinema);
            }
            return $this->error('');

        } catch (\Throwable $th) {
            return $th->getMessage();
        }
    }
}
