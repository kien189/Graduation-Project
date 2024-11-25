import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../../server";
import { notification } from "antd"; // Import Ant Design's notification component
import { Director } from "../../../interface/Director";

// Định nghĩa schema cho việc xác thực form sử dụng Zod
const directorSchema = z.object({
  director_name: z.string().min(1, "Tên đạo diễn là bắt buộc."),
  country: z.string().min(1, "Quốc gia là bắt buộc."),
  photo: z.any().optional(),
  link_wiki: z.string().url("Link Wiki phải là URL hợp lệ."),
  descripcion: z
    .string()
    .min(1, "Mô tả là bắt buộc.")
    .max(500, "Mô tả không được vượt quá 500 ký tự."), // Giới hạn tối đa 500 ký tự
});


const DirectorForm = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null); // State để lưu ảnh cũ

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<Director>({
    resolver: zodResolver(directorSchema),
  });

  useEffect(() => {
    const fetchDirector = async () => {
      if (id) {
        try {
          const { data } = await instance.get(`/director/${id}`);
          reset(data.data); // Reset form với dữ liệu đã lấy
          setExistingPhoto(data.data.photo)
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu đạo diễn:", error);
        }
      }
    };

    fetchDirector(); // Lấy dữ liệu đạo diễn nếu có ID
  }, [id, reset]);

  const handleFormSubmit = async (data: Director) => {
    if (!selectedFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh đại diện là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
    const formData = new FormData();
    formData.append("director_name", data.director_name);
    formData.append("country", data.country);
    formData.append("link_wiki", data.link_wiki);
    formData.append("descripcion", data.descripcion || "");
    
    // Thêm _method vào FormData
    if (id) {
      formData.append("_method", "PUT"); // Đặt phương thức PUT
    }
  
    if (selectedFile) {
      formData.append("photo", selectedFile); // Thêm file vào FormData
    }
  
    try {
      if (id) {
        await instance.post(`/director/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }); // Sử dụng POST nhưng với _method là PUT
        notification.success({
          message: "Cập nhật đạo diễn thành công!",
        });
      } else {
        await instance.post("/director", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }); // Thêm đạo diễn mới
        notification.success({
          message: "Thêm đạo diễn thành công!",
        });
      }
      nav("/admin/director"); // Chuyển hướng tới trang danh sách đạo diễn
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu đạo diễn:", error);
      notification.error({
        message: "Lỗi khi gửi dữ liệu đạo diễn",
      });
    }
  };
  

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]); // Lưu file đã chọn vào state
    }
  };

  return (
    <div className="container mt-5">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="shadow p-4 rounded bg-light"
        encType="multipart/form-data"
      >
        <h1 className="text-center mb-4">
          {id ? "Cập nhật Đạo diễn" : "Thêm Đạo diễn"}
        </h1>

        {/* Tên đạo diễn */}
        <div className="mb-3">
          <label htmlFor="director_name" className="form-label">
            Tên Đạo diễn
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.director_name ? "is-invalid" : ""
            }`}
            {...register("director_name")}
          />
          {errors.director_name && (
            <span className="text-danger">{errors.director_name.message}</span>
          )}
        </div>

        {/* Quốc gia */}
        <div className="mb-3">
          <label htmlFor="country" className="form-label">
            Quốc gia
          </label>
          <input
            type="text"
            className={`form-control ${errors.country ? "is-invalid" : ""}`}
            {...register("country")}
          />
          {errors.country && (
            <span className="text-danger">{errors.country.message}</span>
          )}
        </div>

        {/* Ảnh */}
       <div className="mb-3">
          <label htmlFor="photo" className="form-label">
            Ảnh
          </label>
          {existingPhoto && !selectedFile && (
            <div>
              <img
                src={existingPhoto}
                alt="Đạo diễn"
                style={{ width: "150px", height: "auto" }}
              />
            </div>
          )}
          <input
            type="file"
            className={`form-control ${errors.photo ? "is-invalid" : ""}`}
            accept="image/*"
            onChange={handleFileChange} // Xử lý khi chọn file
          />
          {errors.photo && (
            <span className="text-danger">{errors.photo.message}</span>
          )}
        </div>
        {/* Link Wiki */}
        <div className="mb-3">
          <label htmlFor="link_wiki" className="form-label">
            Link Wiki (URL)
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.link_wiki ? "is-invalid" : ""
            }`}
            {...register("link_wiki")}
          />
          {errors.link_wiki && (
            <span className="text-danger">{errors.link_wiki.message}</span>
          )}
        </div>

        {/* Mô tả */}
        <div className="mb-3">
          <label htmlFor="descripcion" className="form-label">
            Mô tả
          </label>
          <textarea
            className={`form-control ${
              errors.descripcion ? "is-invalid" : ""
            }`}
            {...register("descripcion")}
          ></textarea>
          {errors.descripcion && (
            <span className="text-danger">{errors.descripcion.message}</span>
          )}
        </div>

        <div className="mb-3">
          <button className="btn btn-primary w-100">
            {id ? "Cập nhật Đạo diễn" : "Thêm Đạo diễn"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DirectorForm;
