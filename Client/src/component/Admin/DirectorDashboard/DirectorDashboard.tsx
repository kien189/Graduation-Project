import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd'; // Import the notification component
import 'bootstrap/dist/css/bootstrap.min.css';
import { Director } from '../../../interface/Director';
import instance from '../../../server';

const DirectorDashboard = () => {
    const [directors, setDirectors] = useState<Director[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>(''); 
    const directorsPerPage = 7;

    useEffect(() => {
        // Gọi API để lấy danh sách đạo diễn
        const fetchDirectors = async () => {
            try {
                const response = await instance.get('/director');
                setDirectors(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu đạo diễn:', error);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải danh sách đạo diễn!',
                    placement: 'topRight',
                });
            }
        };
        fetchDirectors();
    }, []);

    const filteredDirectors = directors.filter(director =>
        director.director_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalDirectors = filteredDirectors.length;
    const totalPages = Math.ceil(totalDirectors / directorsPerPage);
    const currentDirectors = filteredDirectors.slice(
        (currentPage - 1) * directorsPerPage,
        currentPage * directorsPerPage
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    const getPageNumbers = () => {
        const pageNumbers = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > 3) pageNumbers.push('...');
            const start = Math.max(currentPage - 1, 2);
            const end = Math.min(currentPage + 1, totalPages - 1);
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            if (currentPage < totalPages - 2) pageNumbers.push('...');
            pageNumbers.push(totalPages);
        }
        return pageNumbers;
    };

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to={'/admin/director/add'} className="btn btn-outline-primary">
                    <FontAwesomeIcon icon={faPlus} /> Thêm Đạo Diễn
                </Link>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control w-25"
                />
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover shadow-sm">
                    <thead className="thead-light">
                        <tr>
                            <th>ID</th>
                            <th>Ảnh</th>
                            <th>Tên Đạo Diễn</th>
                            <th>Quốc Gia</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDirectors.map((director) => (
                            <tr key={director.id}>
                                <td>{director.id}</td>
                                <td>
                                    <img
                                        src={director.photo ?? undefined}
                                        style={{ width: "80px", height: "120px", objectFit: 'cover' }}
                                        alt="Ảnh Đạo Diễn"
                                    />
                                </td>
                                <td>{director.director_name}</td>
                                <td>{director.country}</td>
                                <td>
                                    <div className="d-flex justify-content-around">
                                        <Link to={`/admin/director/edit/${director.id}`} className="btn btn-warning btn-sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentDirectors.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    Không có đạo diễn nào.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                            Trước
                        </button>
                    </li>
                    {getPageNumbers().map((page, index) => (
                        <li key={index} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                            {page === '...' ? (
                                <span className="page-link">...</span>
                            ) : (
                                <button className="page-link" onClick={() => handlePageChange(Number(page))}>
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                            Tiếp
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default DirectorDashboard;
