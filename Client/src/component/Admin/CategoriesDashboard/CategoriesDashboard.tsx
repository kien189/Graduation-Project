import React, { useState } from 'react';
import { useCategoryContext } from '../../../Context/CategoriesContext';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { notification } from 'antd'; // Import the notification component
import 'bootstrap/dist/css/bootstrap.min.css';


const CategoriesDashboard = () => {
    const { state, deleteCategory } = useCategoryContext();
    const { categories } = state;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const categoriesPerPage = 3;

    const filteredCategories = categories.filter(category => 
        category.category_name && 
        category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalCategories = filteredCategories.length;
    const totalPages = Math.ceil(totalCategories / categoriesPerPage);
    const currentCategories = filteredCategories.slice(
        (currentPage - 1) * categoriesPerPage,
        currentPage * categoriesPerPage
    );
    
    const handleDelete = (id: number) => {
        const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa thể loại này?');
        if (confirmDelete) {
            deleteCategory(id);
            // Show success notification after deleting
            notification.success({
                message: 'Thành Công',
                description: 'Thể loại đã được xóa thành công!',
                placement: 'topRight',
            });
        }
    };

    const handlePageChange = (page: number) => setCurrentPage(page);

    return (
        <div className="container mt-5">
            <h2 className="text-center text-primary mb-4">Tất Cả Thể Loại Phim</h2>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to={'/admin/categories/add'} className="btn btn-outline-primary">
                   + Thêm Thể Loại Phim
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
                            <th>Tên Thể Loại</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentCategories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.category_name}</td>
                                <td>
                                    <div className="d-flex justify-content-around">
                                        <Link to={`/admin/categories/edit/${category.id}`} className="btn btn-warning btn-sm">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Link>
                                        <button
                                               onClick={() => handleDelete(category.id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentCategories.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center">
                                    Không có thể loại nào.
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
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                {index + 1}
                            </button>
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

export default CategoriesDashboard;
