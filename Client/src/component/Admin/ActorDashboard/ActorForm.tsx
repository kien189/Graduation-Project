import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../../server";
import { notification } from "antd"; // Import Ant Design's notification component
import { Actor } from "../../../interface/Actor";

// Định nghĩa schema cho việc xác thực form sử dụng Zod

const actorSchema = z.object({
  actor_name: z.string().min(1, "Tên diễn viên là bắt buộc."),
  country: z.string().min(1, "Quốc gia là bắt buộc."),
  photo: z.any().optional(),
  link_wiki: z.string().url("Link Wiki phải là URL hợp lệ."),
  descripcion: z
    .string()
    .min(1, "Mô tả là bắt buộc.")
    .max(500, "Mô tả không được vượt quá 500 ký tự."),
});

const ActorForm = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null); // State để lưu ảnh cũ

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<Actor>({
    resolver: zodResolver(actorSchema),
  });

  useEffect(() => {
    const fetchActor = async () => {
      if (id) {
        try {
          const { data } = await instance.get(`/actor/${id}`);
          reset(data.data); // Reset form với dữ liệu đã lấy
          setExistingPhoto(data.data.photo); // Lưu URL ảnh cũ
        } catch (error) {
          console.error("Lỗi khi lấy dữ liệu diễn viên:", error);
        }
      }
    };

    fetchActor(); // Lấy dữ liệu diễn viên nếu có ID
  }, [id, reset]);

  const handleFormSubmit = async (data: Actor) => {
    if (!selectedFile) {
      notification.error({
        message: 'Lỗi xác thực',
        description: 'Ảnh đại diện là bắt buộc!',
        placement: 'topRight',
      });
      return;
    }
  
    const formData = new FormData();
    formData.append("actor_name", data.actor_name);
    formData.append("country", data.country);
    formData.append("link_wiki", data.link_wiki);
    formData.append("descripcion", data.descripcion || "");
    if (selectedFile) {
      formData.append("photo", selectedFile); // Thêm file vào FormData
    }

    // Thêm _method để mô phỏng PUT request
    if (id) {
      formData.append("_method", "PUT");
    }

    try {
      if (id) {
        await instance.post(`/actor/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }); // Cập nhật diễn viên
        notification.success({
          message: "Cập nhật diễn viên thành công!",
        });
      } else {
        await instance.post("/actor", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        }); // Thêm diễn viên mới
        notification.success({
          message: "Thêm diễn viên thành công!",
        });
      }
      nav("/admin/actor"); // Chuyển hướng tới trang danh sách diễn viên hoặc trang cần thiết
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu diễn viên:", error);
      notification.error({
        message: "Lỗi khi gửi dữ liệu diễn viên",
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
          {id ? "Cập nhật Diễn viên" : "Thêm Diễn viên"}
        </h1>

        {/* Tên diễn viên */}
        <div className="mb-3">
          <label htmlFor="actor_name" className="form-label">
            Tên Diễn viên
          </label>
          <input
            type="text"
            className={`form-control ${
              errors.actor_name ? "is-invalid" : ""
            }`}
            {...register("actor_name")}
          />
          {errors.actor_name && (
            <span className="text-danger">{errors.actor_name.message}</span>
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

        {/* Ảnh cũ và chọn ảnh mới */}
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">
            Ảnh
          </label>
          {existingPhoto && !selectedFile && (
            <div>
              <img
                src={existingPhoto}
                alt="Diễn viên"
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
            {id ? "Cập nhật Diễn viên" : "Thêm Diễn viên"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActorForm;
