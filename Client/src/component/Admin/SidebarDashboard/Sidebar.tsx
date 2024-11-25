import React, { useState } from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUser, FaFilm, FaTicketAlt, FaTag, FaNewspaper, FaList, FaGlobe, FaCogs, FaTheaterMasks, FaCalendarAlt, FaChartLine, FaChevronRight, FaChevronLeft, FaIndustry, FaUserTie, FaVideo } from 'react-icons/fa'; // Đã thay FaUser thành FaUserTie cho diễn viên

const Sidebar = () => {
    const [isActive, setIsActive] = useState(false);

    // Hàm toggle để mở/đóng sidebar
    const toggleSidebar = () => {
        setIsActive(!isActive);
    };

    return (
        <>
            {/* Nút mũi tên để mở/đóng sidebar */}
            <div className="sidebar-toggle" onClick={toggleSidebar}>
                {isActive ? <FaChevronLeft /> : <FaChevronRight />}
            </div>

            {/* Sidebar ẩn/hiện dựa vào trạng thái isActive */}
            <div className={`sidebar ${isActive ? 'active' : ''}`}>
                <div className="header-logo col-lg-1 col-md-4 col-sm-4 col-4">
                    <NavLink to={"/"} className={({ isActive }) => (isActive ? 'active' : '')}>
                        <span className="logo-first-letter1">F</span>lickHive
                    </NavLink>
                </div>
                <ul>
                    <li><NavLink to={'/admin/dashboard'} className={({ isActive }) => (isActive ? 'active' : '')}><FaTachometerAlt /> Dashboard</NavLink></li>
                    <li><NavLink to={'/admin/user'} className={({ isActive }) => (isActive ? 'active' : '')}><FaUser /> Users</NavLink></li>
                    <li><NavLink to={'/admin/actor'} className={({ isActive }) => (isActive ? 'active' : '')}><FaUserTie /> Quản lí diễn viên</NavLink></li> {/* Sử dụng FaUserTie cho diễn viên */}
                    <li><NavLink to={'/admin/director'} className={({ isActive }) => (isActive ? 'active' : '')}><FaVideo /> Quản lí đạo diễn</NavLink></li> {/* Sử dụng FaVideo cho đạo diễn */}
                    <li><NavLink to={'/admin/posts'} className={({ isActive }) => (isActive ? 'active' : '')}><FaNewspaper /> Quản lí bài viết</NavLink></li>
                    <li><NavLink to={'/admin/showtimes'} className={({ isActive }) => (isActive ? 'active' : '')}><FaCalendarAlt /> Quản lí xuất chiếu</NavLink></li>
                    <li><NavLink to={'/admin/orders'} className={({ isActive }) => (isActive ? 'active' : '')}><FaTag /> Quản lí đơn hàng</NavLink></li>
                    <li><NavLink to={'/admin/categories'} className={({ isActive }) => (isActive ? 'active' : '')}><FaList /> Quản lí thể loại</NavLink></li>
                    {/* <li><NavLink to={'/admin/countries'} className={({ isActive }) => (isActive ? 'active' : '')}><FaGlobe /> Quản lí khu vực</NavLink></li> */}
                    <li><NavLink to={'/admin/combo'} className={({ isActive }) => (isActive ? 'active' : '')}><FaCogs /> Quản lí combo nước</NavLink></li>
                    <li><NavLink to={'/admin/cinemas'} className={({ isActive }) => (isActive ? 'active' : '')}><FaTheaterMasks /> Quản lí rạp chiếu phim</NavLink></li>
                    <li><NavLink to={'/admin/movies'} className={({ isActive }) => (isActive ? 'active' : '')}><FaFilm /> Quản lí phim</NavLink></li>
                    
                    <li><NavLink to={'/admin/rooms'} className={({ isActive }) => (isActive ? 'active' : '')}><FaIndustry /> Quản lí phòng rạp</NavLink></li>
                    <li><NavLink to={'/admin/RevenueByCinema'} className={({ isActive }) => (isActive ? 'active' : '')}><FaChartLine /> Doanh thu theo rạp</NavLink></li>
                    <li><NavLink to={'/admin/RevenueByMovie'} className={({ isActive }) => (isActive ? 'active' : '')}><FaChartLine /> Doanh thu theo phim</NavLink></li>
                </ul>
            </div>
        </>
    );
};

export default Sidebar;
