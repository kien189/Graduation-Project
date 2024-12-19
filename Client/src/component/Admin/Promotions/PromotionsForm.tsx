import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import instance from "../../../server";
import { notification } from "antd";
import { Promotions } from "../../../interface/Promotions";
import { z } from "zod";  // Import Zod
import { zodResolver } from "@hookform/resolvers/zod"; // Import zodResolver

// Define Zod schema
const promotionSchema = z.object({
  code: z.string().min(1, "Mã khuyến mãi là bắt buộc"),
  discount_percentage: z
    .number({ invalid_type_error: "Vui lòng nhập % giảm giá" })
    .min(0, "Giảm giá phải lớn hơn hoặc bằng 0")
    .max(50, "Giảm giá không thể vượt quá 50%"),
  max_discount: z.number({ invalid_type_error: "Vui lòng nhập giảm giá tối đa" }).min(1, "Giảm giá tối đa phải lớn hơn 0").max(200000,"giảm giá tối đa 200.000VNĐ"),
  min_purchase: z.number({ invalid_type_error: "Vui lòng nhập giá trị tối thiểu" }).min(1, "Giá trị mua tối thiểu phải lớn hơn 0"),
  valid_from: z
    .string()
    .refine((val) => !!Date.parse(val), "Ngày bắt đầu không hợp lệ"),
  valid_to: z
    .string()
    .refine((val) => !!Date.parse(val), "Ngày kết thúc không hợp lệ")
    .refine((val) => new Date(val) >= new Date(), "Ngày kết thúc không được bé hơn ngày hiện tại"),
  is_active: z
    .union([z.literal("1"), z.literal("0"), z.number().int()])
    .transform((val) => {
      if (val === "1" || val === 1) return true;
      return false;
    }),
});


type PromotionFormData = z.infer<typeof promotionSchema>;

const PromotionForm = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  // Integrating Zod with react-hook-form using zodResolver
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue, // Add setValue to set field values manually
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema), // Use zodResolver here
  });

  // Create a function to generate a random promotion code
  const generatePromotionCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  useEffect(() => {
    const fetchPromotion = async () => {
      if (id) {
        try {
          const { data } = await instance.get(`/manager/promotions/${id}`);
          
          // Convert date fields to 'YYYY-MM-DD' format if needed
          if (data.valid_from) {
            data.valid_from = new Date(data.valid_from).toISOString().split('T')[0];
          }
          if (data.valid_to) {
            data.valid_to = new Date(data.valid_to).toISOString().split('T')[0];
          }

          reset(data); // Reset form with the fetched data
        } catch (error) {
          console.error("Error fetching promotion data:", error);
        }
      }
    };

    fetchPromotion(); // Fetch promotion data if there is an ID
  }, [id, reset]);

  useEffect(() => {
    // If no ID and the code is not provided, generate a promotion code
    if (!id) {
      const generatedCode = generatePromotionCode();
      setValue("code", generatedCode); // Automatically set the generated code
    }
  }, [id, setValue]);

  const handleFormSubmit = async (data: PromotionFormData) => {
    try {
      if (id) {
        // Update promotion
        await instance.put(`/manager/promotions/${id}`, data);
        notification.success({
          message: "Cập nhật khuyến mãi thành công!",
        });
      } else {
        // Create new promotion
        await instance.post("/manager/promotions", data);
        notification.success({
          message: "Thêm khuyến mãi thành công!",
        });
      }
      nav("/admin/promotions"); // Redirect to the promotions list page
    } catch (error) {
      console.error("Error submitting promotion data:", error);
      notification.error({
        message: "Lỗi khi gửi dữ liệu khuyến mãi",
        description:"Tên khuyến mãi đã tồn tại!!"
      });
    }
  };

  return (
    <div className="container mt-5">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="shadow p-4 rounded bg-light"
        style={{ maxWidth: "900px", margin: "0 auto",height: "900px" }}
      >
        <h1 className="text-center mb-4">
          {id ? "Cập nhật Khuyến mãi" : "Thêm Khuyến mãi"}
        </h1>

        {/* Mã khuyến mãi */}
        <div className="mb-3">
          <label htmlFor="code" className="form-label">
            Mã khuyến mãi
          </label>
          <input
            type="text"
            className={`form-control ${errors.code ? "is-invalid" : ""}`}
            {...register("code")}
          />
          {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
        </div>

        {/* Giảm giá (%) */}
        <div className="mb-3">
          <label htmlFor="discount_percentage" className="form-label">
            Giảm giá (%)
          </label>
          <input
            type="number"
            className={`form-control ${errors.discount_percentage ? "is-invalid" : ""}`}
            {...register("discount_percentage",{valueAsNumber:true})}
          />
          {errors.discount_percentage && <div className="invalid-feedback">{errors.discount_percentage.message}</div>}
        </div>

        {/* Giảm giá tối đa */}
        <div className="mb-3">
          <label htmlFor="max_discount" className="form-label">
            Giảm giá tối đa
          </label>
          <input
            type="number"
            className={`form-control ${errors.max_discount ? "is-invalid" : ""}`}
            {...register("max_discount",{valueAsNumber: true})}
          />
          {errors.max_discount && <div className="invalid-feedback">{errors.max_discount.message}</div>}
        </div>

        {/* Giá trị mua tối thiểu */}
        <div className="mb-3">
          <label htmlFor="min_purchase" className="form-label">
            Giá trị mua tối thiểu
          </label>
          <input
            type="number"
            className={`form-control ${errors.min_purchase ? "is-invalid" : ""}`}
            {...register("min_purchase",{valueAsNumber: true})}
          />
          {errors.min_purchase && <div className="invalid-feedback">{errors.min_purchase.message}</div>}
        </div>

        {/* Ngày bắt đầu */}
        <div className="mb-3">
          <label htmlFor="valid_from" className="form-label">
            Ngày bắt đầu
          </label>
          <input
            type="date"
            className={`form-control ${errors.valid_from ? "is-invalid" : ""}`}
            {...register("valid_from")}
          />
          {errors.valid_from && <div className="invalid-feedback">{errors.valid_from.message}</div>}
        </div>

        {/* Ngày kết thúc */}
        <div className="mb-3">
          <label htmlFor="valid_to" className="form-label">
            Ngày kết thúc
          </label>
          <input
            type="date"
            className={`form-control ${errors.valid_to ? "is-invalid" : ""}`}
            {...register("valid_to")}
          />
          {errors.valid_to && <div className="invalid-feedback">{errors.valid_to.message}</div>}
        </div>

        {/* Trạng thái */}
        <div className="mb-3">
          <label htmlFor="is_active" className="form-label">
            Trạng thái
          </label>
          <select
            className={`form-control ${errors.is_active ? "is-invalid" : ""}`}
            {...register("is_active")}
          >
            <option value="1">Hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
          {errors.is_active && <div className="invalid-feedback">{errors.is_active.message}</div>}
        </div>

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary">
            {id ? "Cập nhật" : "Thêm"}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => nav("/admin/promotions")}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromotionForm;
