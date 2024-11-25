import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Showtime } from '../../../interface/Showtimes';
import { useShowtimeContext } from '../../../Context/ShowtimesContext';
import instance from '../../../server';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Cinema } from '../../../interface/Cinema';
import { Room } from '../../../interface/Room';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notification } from 'antd';

// Schema validation
const showtimeSchema = z.object({
    movie_in_cinema_id: z.string().min(1, 'Vui lòng chọn phim'),
    room_id: z.string().min(1, 'Vui lòng chọn phòng'),
    showtime_date: z
      .string()
      .min(1, 'Vui lòng chọn ngày chiếu')
      .refine((value) => {
        const today = new Date();
        const selectedDate = new Date(value);
        today.setHours(0, 0, 0, 0); // Reset giờ phút giây để chỉ so sánh ngày
        return selectedDate >= today;
      }, 'Ngày chiếu không được nhỏ hơn ngày hiện tại'),
      showtime_start: z
      .string()
      .min(1, 'Vui lòng chọn giờ bắt đầu')
      .refine((value) => {
        const selectedTime = value.split(':'); // Tách giờ và phút từ giá trị nhập
        const now = new Date(); // Lấy thời gian hiện tại
        const today = new Date();
        today.setHours(Number(selectedTime[0]), Number(selectedTime[1]), 0, 0); // Gán giờ và phút từ giá trị nhập
    
        return today >= now; // So sánh giờ bắt đầu với thời gian hiện tại
      }, 'Giờ bắt đầu không được nhỏ hơn thời gian hiện tại'),
    
    price: z
      .number()
      .min(0, 'Giá phải lớn hơn hoặc bằng 0')
      .max(500000, 'Giá không được vượt quá 500,000 VNĐ')
      .optional(),
    cinema_id: z.string().min(1, 'Vui lòng chọn rạp'),
  });
  

const ShowtimesForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Showtime>({
    resolver: zodResolver(showtimeSchema),
  });
  const { addOrUpdateShowtime } = useShowtimeContext();
  const navigate = useNavigate();

  // State variables
  const [cinemasList, setCinemasList] = useState<Cinema[]>([]);
  const [movieInCinemas, setMovieInCinemas] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [cinemaId, setCinemaId] = useState<number | null>(null);
  const [showtimesList, setShowtimesList] = useState<Showtime[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchCinemas = async () => {
      const response = await instance.get('/cinema');
      setCinemasList(response.data.data);
    };

    const fetchShowtime = async () => {
      if (id) {
        const response = await instance.get(`/showtimes/${id}`);
        const showtimeData = response.data.data;

        // Prefetch related data based on selected cinema
        setCinemaId(showtimeData.movie_in_cinema.cinema_id);
        await fetchMovieInCinema(showtimeData.movie_in_cinema.cinema_id);
        await fetchRoomsByCinema(showtimeData.movie_in_cinema.cinema_id);

        // Populate form fields for edit mode
        reset({
          movie_in_cinema_id: showtimeData.movie_in_cinema_id,
          cinema_id: showtimeData.movie_in_cinema.cinema_id,
          showtime_date: showtimeData.showtime_date,
          showtime_start: showtimeData.showtime_start,
          price: showtimeData.price,
          room_id: showtimeData.room_id,
        });
      }
    };

    fetchCinemas();
    fetchShowtime();
  }, [id, reset]);

  // Fetch movies by cinema
  const fetchMovieInCinema = async (cinemaId: number) => {
    const response = await instance.get(`/show-movie-in-cinema/${cinemaId}`);
    setMovieInCinemas(response.data.data);
  };

  // Fetch rooms by cinema
  const fetchRoomsByCinema = async (cinemaId: number) => {
    const response = await instance.get(`/cinema/${cinemaId}/room`);
    setRoomsList(response.data.data);
  };

  // Handle cinema selection change
  const handleCinemaChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCinemaId = Number(e.target.value);
    setCinemaId(selectedCinemaId);
    await fetchMovieInCinema(selectedCinemaId);
    await fetchRoomsByCinema(selectedCinemaId);
  };

  // Form submission handler
  const onSubmit: SubmitHandler<Showtime> = async (data) => {
    const formattedData = {
      ...data,
      showtime_start: `${data.showtime_start}:00`,
    };

    if (!id) {
      setShowtimesList((prevList) => [...prevList, formattedData]);
    } else {
      await addOrUpdateShowtime(formattedData, id);
      notification.success({
        message: 'Cập nhật Suất Chiếu Thành Công!',
        description: 'Suất chiếu đã được cập nhật vào danh sách.',
      });
      navigate('/admin/showtimes');
    }

    reset();
  };

  // Submit all showtimes in bulk
  const handleSubmitAll = async () => {
    await addOrUpdateShowtime(showtimesList);
    notification.success({
      message: 'Gửi Tất Cả Suất Chiếu Thành Công!',
      description: 'Suất chiếu mới đã được thêm vào danh sách.',
    });
    navigate('/admin/showtimes');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{id ? 'Cập nhật Suất Chiếu' : 'Thêm Suất Chiếu'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="shadow p-4 rounded bg-light">
        <div className="mb-3">
          <label className="form-label">Chọn Rạp</label>
          <select
            {...register('cinema_id')}
            value={cinemaId || ''}
            onChange={handleCinemaChange}
            className="form-select"
          >
            <option value="">Chọn Rạp</option>
            {cinemasList.map((cinema) => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.cinema_name} - {cinema.location.location_name}
              </option>
            ))}
          </select>
          {errors.cinema_id && <div className="text-danger">{errors.cinema_id.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Chọn Phim</label>
          <select {...register('movie_in_cinema_id')} className="form-select">
            <option value="">Chọn Phim</option>
            {movieInCinemas.map((movie) => (
              <option key={movie.id} value={movie.id}>
                {movie.movie.movie_name}
              </option>
            ))}
          </select>
          {errors.movie_in_cinema_id && <div className="text-danger">{errors.movie_in_cinema_id.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Chọn Phòng</label>
          <select {...register('room_id')} className="form-select">
            <option value="">Chọn Phòng</option>
            {roomsList.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_name}
              </option>
            ))}
          </select>
          {errors.room_id && <div className="text-danger">{errors.room_id.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Ngày chiếu</label>
          <input type="date" {...register('showtime_date')} className="form-control" />
          {errors.showtime_date && <div className="text-danger">{errors.showtime_date.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Giờ bắt đầu</label>
          <input type="time" {...register('showtime_start')} className="form-control" />
          {errors.showtime_start && <div className="text-danger">{errors.showtime_start.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Giá</label>
          <input type="number" {...register('price', { valueAsNumber: true })} className="form-control" />
          {errors.price && <div className="text-danger">{errors.price.message}</div>}
        </div>

        <div className="mb-3">
          {id ? (
            <button type="submit" className="btn btn-success">
              Cập nhật Showtime
            </button>
          ) : (
            <>
              <button type="submit" className="btn btn-primary">
                Thêm Showtime
              </button>
              <button
                type="button"
                onClick={handleSubmitAll}
                className="btn btn-secondary ms-2"
              >
                Gửi tất cả Showtime
              </button>
            </>
          )}
        </div>
      </form>

      {/* Showtimes list */}
      <div className="mt-4">
        <h3 className="text-center">Danh sách Showtime</h3>
        {showtimesList.length > 0 ? (
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Rạp</th>
                <th>Phim</th>
                <th>Ngày chiếu</th>
                <th>Giờ bắt đầu</th>
                <th>Giá</th>
              </tr>
            </thead>
            <tbody>
              {showtimesList.map((item, index) => (
                <tr key={index}>
                  <td>{item.cinema_id}</td>
                  <td>{item.movie_in_cinema_id}</td>
                  <td>{item.showtime_date}</td>
                  <td>{item.showtime_start}</td>
                  <td>{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">Không có suất chiếu nào trong danh sách</p>
        )}
      </div>
    </div>
  );
};

export default ShowtimesForm;
