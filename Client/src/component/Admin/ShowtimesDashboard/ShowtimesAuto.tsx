import React, { useState, useEffect } from "react";
import { notification } from "antd";
import instance from "../../../server";
import { Showtime } from "../../../interface/Showtimes";
import { Movie } from "../../../interface/Movie";
import { Room } from "../../../interface/Room";
import { useNavigate } from "react-router-dom";

const ShowtimeAuto = () => {
    const [formData, setFormData] = useState<Showtime>({
        movie: {} as Movie,
        id: 0,
        movie_id: 0,
        cinema_id: 0,
        showtime_date: '',
        showtime_start: '',
        showtime_end: '',
        date: '',
        opening_time: '',
        closing_time: '',
        duration: '', // Thời gian sẽ được tự động cập nhật khi chọn phim
        cinema: '',
        status: '',
        price: 0,
        room_id: 0,
        room: {} as Room
    });
    const nav = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);

    // Fetch movies and rooms data
    useEffect(() => {
        const fetchMoviesAndRooms = async () => {
            try {
                const movieResponse = await instance.get("/movies");  // Thay thế với endpoint chính xác
                setMovies(movieResponse.data.data.original);

                const roomResponse = await instance.get("/room");  // Thay thế với endpoint chính xác
                setRooms(roomResponse.data.data);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu phim và phòng:", error);
                notification.error({
                    message: 'Lỗi khi tải dữ liệu',
                    description: 'Không thể tải phim và phòng, vui lòng thử lại sau.'
                });
            }
        };

        fetchMoviesAndRooms();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Cập nhật thời gian khi người dùng chọn một bộ phim
    const handleMovieChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMovieId = parseInt(e.target.value);
        const selectedMovie = movies.find(movie => movie.id === selectedMovieId);

        if (selectedMovie) {
            setFormData({
                ...formData,
                movie_id: selectedMovieId,
                duration: selectedMovie.duration || '' // Giả sử trường `duration` có sẵn trong đối tượng `Movie`
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Gửi dữ liệu lên API
        try {
            const response = await instance.post('/showtimePayload', {
                room_id: formData.room_id,
                movie_id: formData.movie_id,
                date: formData.date,
                opening_time: formData.opening_time,
                closing_time: formData.closing_time,
                duration: formData.duration,
                price: formData.price
            });
            console.log("Thêm showtime thành công:", response.data);
            notification.success({
                message: 'Thêm ShowTime thành công',
                description: 'Showtime đã được thêm thành công.'
            });
            nav('/admin/showtimes');
        } catch (error) {
            console.error("Lỗi khi thêm showtime:", error);
            notification.error({
                message: 'Lỗi khi thêm Showtime',
                description: 'Có lỗi xảy ra khi thêm Showtime, vui lòng thử lại.'
            });
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Thêm Suất Chiếu Tự Động</h2>
            <form onSubmit={handleSubmit} className="shadow p-4 rounded bg-light">
                <div className="mb-3">
                    <label htmlFor="movie_id" className="form-label">Phim</label>
                    <select
                        className="form-control"
                        id="movie_id"
                        name="movie_id"
                        value={formData.movie_id}
                        onChange={handleMovieChange} // Sử dụng handleMovieChange để cập nhật thời gian
                    >
                        <option value="">Chọn Phim</option>
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>
                                {movie.movie_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="room_id" className="form-label">Phòng</label>
                    <select
                        className="form-control"
                        id="room_id"
                        name="room_id"
                        value={formData.room_id}
                        onChange={handleChange}
                    >
                        <option value="">Chọn Phòng</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                                {room.room_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="date" className="form-label">Ngày</label>
                    <input
                        type="date"
                        className="form-control"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="opening_time" className="form-label">Giờ Chiếu</label>
                    <input
                        type="time"
                        className="form-control"
                        id="opening_time"
                        name="opening_time"
                        value={formData.opening_time}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="closing_time" className="form-label">Giờ Kết Thúc</label>
                    <input
                        type="time"
                        className="form-control"
                        id="closing_time"
                        name="closing_time"
                        value={formData.closing_time}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="duration" className="form-label">Thời Gian (phút)</label>
                    <input
                        type="number"
                        className="form-control"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className="form-label">Giá</label>
                    <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit" className="btn btn-primary">Thêm Showtime</button>
            </form>
        </div>
    );
};

export default ShowtimeAuto;