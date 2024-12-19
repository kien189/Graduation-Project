import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notification, Table, Pagination, Input, Button, Switch } from 'antd';
import instance from '../../../server';
import { User } from '../../../interface/User';

const UserDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [pageSize] = useState<number>(10); // Số lượng bản ghi trên mỗi trang
    const { Search } = Input;
    const [userRole, setUserRole] = useState<string>("");

    // Fetch user role from localStorage
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user_profile") || "{}");
        const roles = userData.roles || [];

        if (roles.length > 0) {
            setUserRole(roles[0].name);
        } else {
            setUserRole("unknown");
        }
    }, []);

    // Fetch users from API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                let response;
                if (userRole === "admin") {
                    response = await instance.get(`/admin/all-user?page=${currentPage}`);
                } else if (userRole === "manager") {
                    response = await instance.get(`/manager/all-user?page=${currentPage}`);
                } else {
                    response = await instance.get(`/all-user?page=${currentPage}`);
                }

                setUsers(response.data.data);
                setCurrentPage(response.data.current_page);
                setTotalItems(response.data.total); // Tổng số bản ghi
            } catch (err) {
                setError('Lỗi khi tải người dùng');
            }
        };

        if (userRole !== "") {
            fetchUsers();
        }
    }, [currentPage, userRole]);

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle pagination change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle status change
    const handleStatusChange = async (id: number, status: boolean) => {
        try {
            if (userRole === "admin") {
                await instance.post(`/admin/userStatus/${id}`, { status: !status });
            } else if (userRole === "manager") {
                await instance.post(`/manager/userStatus/${id}`, { status: !status });
            } else {
                await instance.post(`/userStatus/${id}`, { status: !status });
            }
            const updatedUsers = users.map(user =>
                user.id === id ? { ...user, status: !status } : user
            );
            setUsers(updatedUsers);
            notification.success({
                message: 'Cập Nhật Thành Công',
                description: 'Trạng thái tài khoản đã được cập nhật!',
                placement: 'topRight',
            });
        } catch (err) {
            notification.error({
                message: 'Cập Nhật Thất Bại',
                description: 'Lỗi khi cập nhật trạng thái người dùng.',
                placement: 'topRight',
            });
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center' as const,
        },
        {
            title: 'Tên Đăng Nhập',
            dataIndex: 'user_name',
            key: 'user_name',
            align: 'center' as const,
        },
        {
            title: 'Tên Đầy Đủ',
            dataIndex: 'fullname',
            key: 'fullname',
            align: 'center' as const,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            align: 'center' as const,
            render: (text: string) => text || 'Chưa có',
        },
        {
            title: 'Ngày Tạo',
            dataIndex: 'created_at',
            key: 'created_at',
            align: 'center' as const,
            render: (text: string) => new Date(text).toLocaleDateString(),
        },
        {
            title: 'Trạng Thái',
            key: 'status',
            render: (_: any, record: any) => (
                <div style={{ textAlign: 'left' }}>
                    <Switch
                        checked={record.status}
                        onChange={() => handleStatusChange(record.id, record.status)}
                        checkedChildren="Hoạt Động"
                        unCheckedChildren="Khóa"
                    />
                </div>
            ),
            className: 'text-left',
        },
    ];

    if (error) {
        return <p className="text-red-500 text-center mt-4">{error}</p>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to="/admin/user/roles">
                    <Button type="primary" size="large">
                        Quản lý vai trò
                    </Button>
                </Link>
                <Search
                    placeholder="Tìm kiếm theo tên"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey="id"
                pagination={false}
                locale={{
                    emptyText: 'Không có người dùng nào.',
                }}
            />

            <div className="d-flex justify-content-center mt-4">
                <Pagination
                    current={currentPage}
                    total={totalItems}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                   
                />
            </div>
        </div>
    );
};

export default UserDashboard;
