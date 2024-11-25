import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import moment from 'moment';
import { Actor } from '../../../interface/Actor';
import { Director } from '../../../interface/Director';
import { useMovieContext } from '../../../Context/MoviesContext';
import instance from '../../../server';
import { MovieCategory } from '../../../interface/MovieCategory';
import { notification } from 'antd';

// Zod schema for form validation
const movieSchema = z.object({
  movie_name: z.string().min(1, 'Tên phim là bắt buộc'),
  movie_category_id: z.array(z.number()).min(1, 'Chọn ít nhất một danh mục phim'),
  actor_id: z.array(z.number()).min(1, 'Chọn ít nhất một diễn viên'),
  director_id: z.array(z.number()).min(1, 'Chọn ít nhất một đạo diễn'),
  release_date: z
    .string()
    .refine((date) => moment(date, 'YYYY-MM-DD', true).isValid(), 'Ngày phát hành không hợp lệ')
    .refine((date) => moment(date).isSameOrAfter(moment(), 'day'), 'Ngày phát hành không được bé hơn ngày hiện tại'),
  age_limit: z
    .number()
    .int()
    .min(5, 'Giới hạn độ tuổi tối thiểu là 5')
    .max(18, 'Giới hạn độ tuổi tối đa là 18'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự').max(500,'Mô tả tối đa 500 ký tự'),
  duration: z
    .string()
    .min(1, 'Thời lượng là bắt buộc')
    .refine((duration) => {
      const durationInMinutes = parseInt(duration, 10);
      return !isNaN(durationInMinutes) && durationInMinutes <= 180;
    }, 'Thời lượng phim không được quá 180 phút'),
  posterFile: z.any().optional(),
  thumbnailFile: z.any().optional(), // Optional thumbnail
  country: z.string().min(1,'Tên quốc gia là bắt buộc'),
  trailer: z.string().url("Link Trailer phải là URL hợp lệ."), // Trailer URL validation (optional)
});

type MovieFormValues = z.infer<typeof movieSchema>;

const MovieForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      movie_name: '',
      movie_category_id: [],
      actor_id: [],
      director_id: [],
      release_date: '',
      age_limit: 0,
      description: '',
      duration: '',
      posterFile: null,
      thumbnailFile: null,
      country: '', // default value for country
      trailer: '', // default value for trailer
    },
  });

  const [actors, setActors] = useState<Actor[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null); // State for thumbnail
  const [country, setCountry] = useState<string>(''); // State for country
  const [trailer, setTrailer] = useState<string>(''); // State for trailer URL
  const nav = useNavigate();
  const { addOrUpdateMovie } = useMovieContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const actorResponse = await instance.get('/actor');
        const directorResponse = await instance.get('/director');
        const categoryResponse = await instance.get('/movie-category');

        setActors(actorResponse.data.data || []);
        setDirectors(directorResponse.data.data || []);
        setCategories(categoryResponse.data.data || []);

        if (id) {
          const movieResponse = await instance.get(`/movies/${id}`);
          const movieData = movieResponse.data.data.original;

          reset({
            movie_name: movieData.movie_name || '',
            release_date: moment(movieData.release_date).format('YYYY-MM-DD'),
            age_limit: movieData.age_limit || 0,
            description: movieData.description || '',
            duration: movieData.duration || '',
            movie_category_id: movieData.movie_category.map((cat: any) => cat.id) || [],
            actor_id: movieData.actor.map((act: any) => act.id) || [],
            director_id: movieData.director.map((dir: any) => dir.id) || [],
            country: movieData.country || '', // Fetch and set country
            trailer: movieData.trailer || '', // Fetch and set trailer
          });
          setCountry(movieData.country || '');  // Set country state correctly
          setTrailer(movieData.trailer || '');  // Set trailer state correctly
          setPosterFile(movieData.poster); // URL ảnh poster cũ
          setThumbnailFile(movieData.thumbnail); // URL ảnh thumbnail cũ
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: MovieFormValues) => {
    if (!thumbnailFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh thu nhỏ là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
    if (!posterFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh bìa là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
    const updatedData = {
      ...data,
      posterFile: posterFile instanceof File ? posterFile : undefined,
    thumbnailFile: thumbnailFile instanceof File ? thumbnailFile : undefined,
      country,
      trailer,
    };

    await addOrUpdateMovie(updatedData, id);
    nav('/admin/movies');
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{id ? 'Chỉnh sửa phim' : 'Thêm phim'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
        {/* Movie Name */}
        <div className="mb-3">
          <label className="form-label">Tên phim</label>
          <input
            type="text"
            className="form-control"
            {...register('movie_name')}
          />
          {errors.movie_name && <p className="text-danger">{errors.movie_name.message}</p>}
        </div>

        {/* Movie Categories */}
        <div className="mb-3">
          <label className="form-label">Danh mục phim</label>
          <Controller
            name="movie_category_id"
            control={control}
            render={({ field }) => (
              <div>
                {categories.map((category) => (
                  <div key={category.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      value={category.id}
                      checked={field.value.includes(category.id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const newValue = e.target.checked
                          ? [...field.value, value]
                          : field.value.filter((id) => id !== value);
                        field.onChange(newValue);
                      }}
                    />
                    <label className="form-check-label">
                      {category.category_name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.movie_category_id && <p className="text-danger">{errors.movie_category_id.message}</p>}
        </div>

        {/* Actors */}
        <div className="mb-3">
          <label className="form-label">Diễn viên</label>
          <Controller
            name="actor_id"
            control={control}
            render={({ field }) => (
              <div>
                {actors.map((actor) => (
                  <div key={actor.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      value={actor.id}
                      checked={field.value.includes(actor.id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const newValue = e.target.checked
                          ? [...field.value, value]
                          : field.value.filter((id) => id !== value);
                        field.onChange(newValue);
                      }}
                    />
                    <label className="form-check-label">
                      {actor.actor_name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.actor_id && <p className="text-danger">{errors.actor_id.message}</p>}
        </div>

        {/* Directors */}
        <div className="mb-3">
          <label className="form-label">Đạo diễn</label>
          <Controller
            name="director_id"
            control={control}
            render={({ field }) => (
              <div>
                {directors.map((director) => (
                  <div key={director.id} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      value={director.id}
                      checked={field.value.includes(director.id)}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const newValue = e.target.checked
                          ? [...field.value, value]
                          : field.value.filter((id) => id !== value);
                        field.onChange(newValue);
                      }}
                    />
                    <label className="form-check-label">
                      {director.director_name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          />
          {errors.director_id && <p className="text-danger">{errors.director_id.message}</p>}
        </div>

        {/* Release Date */}
        <div className="mb-3">
          <label className="form-label">Ngày phát hành</label>
          <input
            type="date"
            className="form-control"
            {...register('release_date')}
          />
          {errors.release_date && <p className="text-danger">{errors.release_date.message}</p>}
        </div>

        {/* Age Limit */}
        <div className="mb-3">
          <label className="form-label">Giới hạn độ tuổi</label>
          <input
            type="number"
            className="form-control"
            {...register('age_limit', { valueAsNumber: true })}
          />
          {errors.age_limit && <p className="text-danger">{errors.age_limit.message}</p>}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label">Mô tả</label>
          <textarea
            className="form-control"
            rows={4}
            {...register('description')}
          />
          {errors.description && <p className="text-danger">{errors.description.message}</p>}
        </div>

        {/* Duration */}
        <div className="mb-3">
          <label className="form-label">Thời lượng</label>
          <input
            type="text"
            className="form-control"
            {...register('duration')}
          />
          {errors.duration && <p className="text-danger">{errors.duration.message}</p>}
        </div>

        {/* Country */}
        <div className="mb-3">
          <label className="form-label">Quốc gia</label>
          <input
  type="text"
  className="form-control"
  {...register('country')}
  value={country}
  onChange={(e) => setCountry(e.target.value)}
/>

          {errors.country && <p className="text-danger">{errors.country.message}</p>}
        </div>

        {/* Trailer */}
        <div className="mb-3">
          <label className="form-label">Trailer (URL)</label>
          <input
            type="text"
            className="form-control"
            value={trailer}
            onChange={(e) => setTrailer(e.target.value)}
          />
          {errors.trailer && <p className="text-danger">{errors.trailer.message}</p>}
        </div>
 {/* Thumbnail */}
<div className="mb-3">
  <label className="form-label">Thumbnail</label>
  {thumbnailFile && (
    <div className="mb-2">
      <img
        src={typeof thumbnailFile === 'string' ? thumbnailFile : URL.createObjectURL(thumbnailFile)}
        alt="Thumbnail cũ"
        style={{ width: '150px', height: 'auto' }}
      />
    </div>
  )}
  <input
    type="file"
    className="form-control"
    onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
  />
</div>

       {/* Poster File */}
<div className="mb-3">
  <label className="form-label">Poster</label>
  {posterFile && (
    <div className="mb-2">
      <img
        src={typeof posterFile === 'string' ? posterFile : URL.createObjectURL(posterFile)}
        alt="Poster cũ"
        style={{ width: '150px', height: 'auto' }}
      />
    </div>
  )}
  <input
    type="file"
    className="form-control"
    onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
  />
</div>


        <button type="submit" className="btn btn-primary btn-lg w-100">
          {id ? 'Cập nhật phim' : 'Thêm phim'}
        </button>
      </form>
    </div>
  );
};

export default MovieForm;
