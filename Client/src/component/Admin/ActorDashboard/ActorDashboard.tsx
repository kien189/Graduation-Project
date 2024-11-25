import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd'; // Import the notification component
import 'bootstrap/dist/css/bootstrap.min.css';
import { Actor } from '../../../interface/Actor';
import instance from '../../../server';

const ActorDashboard = () => {
    const [actors, setActors] = useState<Actor[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');  
    const actorsPerPage = 7;

    useEffect(() => {
        // Gọi API để lấy danh sách diễn viên
        const fetchActors = async () => {
            try {
                const response = await instance.get('/actor');
                setActors(response.data.data);
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu diễn viên:', error);
                notification.error({
                    message: 'Lỗi',
                    description: 'Không thể tải danh sách diễn viên!',
                    placement: 'topRight',
                });
            }
        };
        fetchActors();
    }, []);

    const filteredActors = actors.filter(actor =>
        actor.actor_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalActors = filteredActors.length;
    const totalPages = Math.ceil(totalActors / actorsPerPage);
    const currentActors = filteredActors.slice(
        (currentPage - 1) * actorsPerPage,
        currentPage * actorsPerPage
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
                <Link to={'/admin/actor/add'} className="btn btn-outline-primary">
                    <FontAwesomeIcon icon={faPlus} /> Thêm Diễn Viên
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
                            <th>Tên Diễn Viên</th>
                            <th>Quốc Gia</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentActors.map((actor) => (
                            <tr key={actor.id}>
                                <td>{actor.id}</td>
                                <td>
                                    <img
                                        src={actor.photo ?? undefined}
                                        style={{ width: "80px", height: "120px", objectFit: 'cover' }}
                                    />
                                </td>
                                <td>{actor.actor_name}</td>
                                <td>{actor.country}</td>
                                <td>
                                    <div className="d-flex justify-content-around">
                                        <Link to={`/admin/actor/edit/${actor.id}`} className="btn btn-warning btn-sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentActors.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    Không có diễn viên nào.
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

export default ActorDashboard;
