import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { usePostsContext } from '../../../Context/PostContext';
import instance from '../../../server'; // Adjust path if necessary
import { NewsCategory } from '../../../interface/NewsCategory';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { notification } from 'antd'; // Import Ant Design notification

// Define the Zod schema for validation
const postSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc').max(100,'Tiêu đề tối đa 100 ký tự'), // Title is required
  news_category_id: z.string().min(1, 'Chọn một danh mục'), // Category is required
  content: z.string().min(1, 'Nội dung là bắt buộc').max(1000,'Nội dung tối đa 1000 ký tự'), // Content is required
});

type FormData = z.infer<typeof postSchema>;

const PostsForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(postSchema), // Using Zod schema for validation
  });
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [oldThumbnail, setOldThumbnail] = useState<string | null>(null); // Store old thumbnail URL
  const [oldBanner, setOldBanner] = useState<string | null>(null); // Store old banner URL
  const { addOrUpdatePost } = usePostsContext();
  const nav = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await instance.get('/news_category');
        setCategories(Array.isArray(categoryResponse.data.data) ? categoryResponse.data.data : []);

        if (id) {
          const postResponse = await instance.get(`/news/${id}`);
          const postData = postResponse.data.data;
          console.log(postData);

          // Set old images if available
          setOldThumbnail(postData.thumnail);
          setOldBanner(postData.banner);

          reset({
            title: postData.title,
            news_category_id: postData.news_category_id,
            content: postData.content,
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu bài viết:', error);
      }
    };

    fetchCategories();
  }, [id, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Kiểm tra nếu chưa có thumbnail hoặc banner
    if (!thumbnailFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh thu nhỏ là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
    if (!bannerFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh bìa là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
  
    // Nếu đã hợp lệ, tiếp tục gửi dữ liệu
    await addOrUpdatePost(
      {
        ...data,
        thumnail: thumbnailFile,
        banner: bannerFile,
      },
      id
    );
  
    notification.success({
      message: id ? 'Cập nhật bài viết thành công!' : 'Thêm bài viết thành công!',
      description: 'Bài viết của bạn đã được lưu thành công.',
      placement: 'topRight',
    });
  
    nav('/admin/posts');
  };
  

  return (
    <div className="container mt-5">
      <h2>{id ? 'Chỉnh sửa bài viết' : 'Thêm bài viết'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
        <div className="mb-3">
          <label className="form-label">Tiêu đề:</label>
          <input
            type="text"
            className="form-control"
            {...register('title')}
          />
          {errors.title && <span className="text-danger">{errors.title.message}</span>}
        </div>
        <div className="mb-3">
          <label className="form-label">Danh mục tin tức:</label>
          <select {...register('news_category_id')} className="form-select">
            <option value="">Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.news_category_name}
              </option>
            ))}
          </select>
          {errors.news_category_id && <span className="text-danger">{errors.news_category_id.message}</span>}
        </div>

        {/* Show old thumbnail if available */}
        {oldThumbnail && (
          <div className="mb-3">
            <label className="form-label">Ảnh thu nhỏ hiện tại:</label>
            <img src={oldThumbnail} alt="Thumbnail cũ"   style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} />
          </div>
        )}
        <div className="mb-3">
          <label className="form-label">Ảnh thu nhỏ mới:</label>
          <input
            type="file"
            className="form-control d-block"
            onChange={(e) => {
              if (e.target.files) {
                setThumbnailFile(e.target.files[0]);
              }
            }}
          />
          {!thumbnailFile && (
    <span className="text-danger">Ảnh thu nhỏ là bắt buộc</span>
  )}
        </div>

        {/* Show old banner if available */}
        {oldBanner && (
          <div className="mb-3">
            <label className="form-label">Ảnh bìa hiện tại:</label>
            <img src={oldBanner} alt="Banner cũ"   style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} />
          </div>
        )}
        <div className="mb-3">
          <label className="form-label">Ảnh bìa mới:</label>
          <input
            type="file"
            className="form-control d-block"
            onChange={(e) => {
              if (e.target.files) {
                setBannerFile(e.target.files[0]);
              }
            }}
          />
           {!bannerFile && (
    <span className="text-danger">Ảnh bìa là bắt buộc</span>
  )}
        </div>

        <div className="mb-3">
          <label className="form-label">Nội dung:</label>
          <textarea
            className="form-control"
            {...register('content')}
          ></textarea>
          {errors.content && <span className="text-danger">{errors.content.message}</span>}
        </div>

        <button type="submit" className="btn btn-primary">
          {id ? 'Cập nhật bài viết' : 'Thêm bài viết'}
        </button>
      </form>
    </div>
  );
};

export default PostsForm;
