import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    let title = "FlickHive"; // Title mặc định

    // Cập nhật title theo URL
    const path = location.pathname;
    if (path === "/buy-ticket") {
      title = "Buy Ticket";
    } else if (path === "/orders") {
      title = "Orders";
    } else if (path === "/seat") {
      title = "Seat Selection";
    } else if (path.includes("/movie-detail/")) {
      title = "Movie Details";
    } else if (path.includes("/reviews/")) {
      title = "Reviews";
    } else if (path === "/filmnews") {
      title = "Film News";
    } else if (path === "/video") {
      title = "Video News";
    } else if (path === "/sp") {
      title = "Support Center";
    } else if (path === "/profile") {
      title = "User Profile";
    }else if (path === "/pay") {
        title = "Pay";
    }else if (path === "/news") {
        title = "News";
    }else if (path === "/community") {
        title = "Community";
    }
    else if (path === "/personal") {
        title = "Personal";
    }
    else if (path === "/admin"){
        title = "Admin"
    }
    else if (path === "/admin/dashboard"){
        title = "Dashboard"
    }
    else if (path === "/admin/user"){
        title = "User"
    }
    else if (path === "/admin/actor"){
        title = "Quản Lí Diễn Viên"
    }
    else if (path === "/admin/director"){
        title = "Quản Lí Đạo Diễn"
    }
    else if (path === "/admin/posts"){
        title = "Quản Lí Bài Viết"
    }
    else if (path === "/admin/showtimes"){
        title = "Quản Lí Suất Chiếu"
    }
    else if (path === "/admin/orders"){
        title = "Quản Lí Đơn Hàng"
    }
    else if (path === "/admin/categories"){
        title = "Quản Lí Thể Loại"
    }
    else if (path === "/admin/combo"){
        title = "Quản Lí Combo"
    }
    else if (path === "/admin/cinema"){
        title = "Quản Lí Rạp"
    }
    else if (path === "/admin/movies"){
        title = "Quản Lí Phim"
    }
    else if (path === "/admin/room"){
        title = "Quản Lí Phòng Rạp"
    }
    else if (path === "/admin/RevenueByCinema"){
        title = "Doanh Thu Theo Rạp"
    }
    else if (path === "/admin/RevenueByMovie"){
        title = "Doanh Thu Theo Phim"
    }
    
    
    document.title = title; // Cập nhật title
  }, [location]);

  return null;
};
export default PageTitleUpdater