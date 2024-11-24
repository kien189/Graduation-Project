import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import instance from '../../../server';
import { User } from '../../../interface/User';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

const UserDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [usersPerPage] = useState<number>(3);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await instance.get('/all-user');
                setUsers(response.data.data);
            } catch (err) {
                setError('Lỗi khi tải người dùng');
            }
        };

        fetchUsers();
    }, []);

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const filteredUsers = users.filter(user =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    if (error) {
        return <p>{error}</p>;
    }

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Total number of pages
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Calculate the range of pages to display
    const pageNumbers = [];
    let start = Math.max(1, currentPage - 2); // start from 2 pages before the current page
    let end = Math.min(totalPages, currentPage + 2); // end at 2 pages after the current page

    if (start > 1) pageNumbers.push(1); // Always show the first page if it's not in the range
    if (start > 2) pageNumbers.push('...'); // Show "..." if there are skipped pages

    for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
    }

    if (end < totalPages - 1) pageNumbers.push('...'); // Show "..." if there are skipped pages
    if (end < totalPages) pageNumbers.push(totalPages); // Always show the last page if it's not in the range

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to={'/admin/user/roles'} className="btn btn-outline-primary">
                    Quản lý vai trò
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
                            <th>Tên Đăng Nhập</th>
                            <th>Tên Đầy Đủ</th>
                            <th>Email</th>
                            <th>Ngày Tạo</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map((user: User) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.user_name}</td>
                                <td>{user.fullname}</td>
                                <td>{user.email || 'Chưa có'}</td>
                                <td>{new Date(user.created_at!).toLocaleDateString()}</td>
                                <td>    
                                    <div className="d-flex justify-content-around">
                                        <Link to={`/admin/user/edit/${user.id}`} className="btn btn-warning btn-sm mr-2">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                            Trước
                        </button>
                    </li>
                    {pageNumbers.map((page, index) => (
                        <li key={index} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            {page === '...' ? (
                                <span className="page-link">...</span>
                            ) : (
                                <button className="page-link" onClick={() => paginate(page as number)}>
                                    {page}
                                </button>
                            )}
                        </li>
                    ))}
                    <li className={`page-item ${indexOfLastUser >= filteredUsers.length ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                            Tiếp
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default UserDashboard;
