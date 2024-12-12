<?php

namespace App\Http\Controllers\Api\Cinema;

use App\Http\Controllers\Controller;
use App\Http\Requests\Store\StoreShowtimeRequest;
use App\Http\Requests\Update\UpdateShowtimeRequest;
use App\Models\Cinema;
use App\Models\Movie;
use App\Models\Room;
use App\Models\Showtime;
use App\Services\Cinema\ShowtimeService;
use Carbon\Carbon;
// use Dotenv\Validator;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Validator;


class ShowtimeController extends Controller
{
    protected $showtimeService;

    public function __construct(ShowtimeService $showtimeService)
    {
        $this->showtimeService = $showtimeService;
    }

    public function index()
    {
        $showtimes = $this->showtimeService->index();
        return $this->success($showtimes);
    }

    public function showtimeByMovieName($movie_name)
    {
        try {
            $showtimes = $this->showtimeService->getShowtimesByMovieName($movie_name);

            if ($showtimes->isEmpty()) {
                return $this->notFound();
            }
            return $this->success($showtimes);
        } catch (ModelNotFoundException $e) {
            return $e->getMessage();
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }
    public function create()
    {
        $movies = Movie::all();  // Fetch all movies
        $rooms = Room::all();    // Fetch all rooms
        $cinemas = Cinema::all();

        return view('showtimes.create', compact('movies', 'rooms', 'cinemas'));
    }



    public function store(StoreShowtimeRequest $request)
    {
        // Retrieve the validated data from the request
        $showtimeData = $request->validated();

        // Check if the incoming data is an array of arrays (multiple showtimes)
        if ($this->isMultiDimensionalArray($showtimeData)) {
            $createdShowtimes = [];

            foreach ($showtimeData as $singleShowtimeData) {
                // Store each showtime in the database and add to the result array
                $createdShowtimes[] = $this->showtimeService->store($singleShowtimeData);
            }

            return $this->success($createdShowtimes, 'Multiple showtimes created successfully.');
        } else {
            // Handle a single showtime
            $createdShowtime = $this->showtimeService->store($showtimeData);
            return $this->success($createdShowtime, 'Single showtime created successfully.');
        }
    }

    /**
     * Helper function to check if an array is multidimensional.
     *
     * @param array $array
     * @return bool
     */
    private function isMultiDimensionalArray(array $array): bool
    {
        return isset($array[0]) && is_array($array[0]);
    }



    public function update(UpdateShowtimeRequest $request, $id)
    {
        try {
            $showtime = $this->showtimeService->update($id, $request->validated());
            return $this->success($showtime);
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    public function destroy($id)
    {
        try {
            return $this->success($this->showtimeService->delete($id));
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    public function show($id)
    {
        try {
            $showtime = $this->showtimeService->get($id);
            return $this->success($showtime);
        } catch (ModelNotFoundException $e) {
            return $this->notFound("Không có id {$id} trong cơ sở dữ liệu");
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    public function storeWithTimeRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|integer|exists:room,id',
            'movie_id' => 'required|integer|exists:movies,id',
            'date' => 'required|date',
            'opening_time' => 'required|date_format:H:i',
            'closing_time' => 'required|date_format:H:i|after:opening_time',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first());
        }

        try {
            $data = $validator->validated();

            // Fetch the movie to get the duration
            $movie = Movie::find($data['movie_id']);
            if (!$movie) {
                return $this->error('The movie associated with the provided movie_id does not exist.');
            }
            $data['duration'] = $movie->duration;

            // Check for conflicting showtimes
            $existingShowtimes = Showtime::where('room_id', $data['room_id'])
                ->where('showtime_date', $data['date'])
                ->where(function ($query) use ($data) {
                    $query->whereBetween('showtime_start', [
                        $data['opening_time'],
                        Carbon::parse($data['closing_time'])->format('H:i:s')
                    ])
                        ->orWhereBetween('showtime_end', [
                            Carbon::parse($data['opening_time'])->format('H:i:s'),
                            Carbon::parse($data['closing_time'])->format('H:i:s')
                        ]);
                })
                ->get();

            if ($existingShowtimes->isNotEmpty()) {
                return $this->error('The selected time range overlaps with existing showtimes for this room.', [
                    'existing_showtimes' => $existingShowtimes,
                ]);
            }

            // Generate showtimes using the service
            $createdShowtimes = $this->showtimeService->generateShowtimes($data);

            return $this->success($createdShowtimes, 'Showtimes created successfully.');
        } catch (Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function status(int $id)
    {
        $movie = Showtime::findOrFail($id);
        $movie->status = $movie->status == 1 ? 0 : 1;
        $movie->save();
        return $this->success('', 'Cập nhật trạng thái thành công.', 200);
    }
}
