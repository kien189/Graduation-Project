import React, { useEffect, useState } from "react";
import { Table, Button, Select, Input, DatePicker, Card, Space, notification } from "antd";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import instance from "../../../server";
import { Booking } from "../../../interface/Booking";
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import './OrdersDashboard.css'
import Search from "antd/es/input/Search";

const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);  // Update type to any[]
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);  // Trang hiện tại
  const [pageSize, setPageSize] = useState<number>(10);  // Số bản ghi mỗi trang
  const [total, setTotal] = useState<number>(0);  // Tổng số bản ghi

  // Fetch bookings when filters or pagination change
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const params: any = {
          status: statusFilter,
          search: searchTerm,
          page: currentPage,  // Trang hiện tại
          limit: pageSize,  // Số bản ghi mỗi trang
        };
        if (dateRange) {
          params.start_date = dateRange[0];
          params.end_date = dateRange[1];
        }

        const response = await instance.get("/dashboard", { params });
        setBookings(response.data.booking_revenue);  // Use the booking_revenue from response
        setTotal(response.data.booking_revenue.length);  // Set total records
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông tin đơn hàng.",
        });
      }
    };

    fetchBookings();
  }, [statusFilter, searchTerm, dateRange, currentPage, pageSize]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Thanh toán thành công':
        return {
          style: { color: 'green', fontWeight: 'bold' },
          icon: <CheckCircleOutlined style={{ marginRight: 8, color: 'green' }} />,
        };
      case 'Thanh toán thất bại':
        return {
          style: { color: 'orange', fontWeight: 'bold' },
          icon: <ExclamationCircleOutlined style={{ marginRight: 8, color: 'orange' }} />,
        };
      case 'Đã hủy':
        return {
          style: { color: 'red', fontWeight: 'bold' },
          icon: <ExclamationCircleOutlined style={{ marginRight: 8, color: 'red' }} />,
        };
      case 'Đang xử lý':
        return {
          style: { color: 'blue', fontWeight: 'bold' },
          icon: <CheckCircleOutlined style={{ marginRight: 8, color: 'blue' }} />,
        };
      case 'Đã in vé':
        return {
          style: { color: 'purple', fontWeight: 'bold' },
          icon: <CheckCircleOutlined style={{ marginRight: 8, color: 'purple' }} />,
        };
      default:
        return {
          style: { color: 'gray' },
          icon: null,
        };
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "booking_code", // Update to booking_code
      key: "booking_code",
      align: "center" as const,
    },
    {
      title: "Người Dùng",
      dataIndex: "user_id", // Nested data for movie_name
      key: "user_id",
      align: "center" as const,
      render: (text: string) => text || "Unknown User",
    },
    {
      title: "Suất Chiếu",
      dataIndex: ["showtime","showtime_date"], // Nested data for showtime_date
      key: "showtime.showtime_date",
      align: "center" as const,
    },
    {
      title: "Phòng",
      dataIndex: ["showtime","room_id"], // Nested data for room_id
      key: "room_name",
      align: "center" as const,
    },
    {
      title: "Phim",
      dataIndex: ["showtime","movie","movie_name"], // Nested data for movie_name
      key: "movie_name",
      align: "center" as const,
    },
    {
      title: "Phương Thức Thanh Toán",
      dataIndex: "pay_method_id", // pay_method_id
      key: "pay_method",
      align: "center" as const,
    },
    {
      title: "Tổng Tiền",
      dataIndex: "amount", // amount
      key: "amount",
      align: "center" as const,
    },
    {
      title: "Trạng Thái",
      dataIndex: "status", // status
      key: "status",
      render: (text: string) => {
        const { style, icon } = getStatusStyle(text);
        return (
          <span style={style}>
            {icon}
            {text}
          </span>
        );
      },
    },
    {
      title: "Hành Động",
      key: "actions",
      align: "center" as const,
      render: (_: any, booking: any) => (
        <Space>
          <Link to={`/admin/ordersdetail/${booking.id}`} className="btn btn-primary">
            Chi tiết
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Doanh Thu" style={{ margin: "20px" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <RangePicker
            onChange={(dates) => {
              if (dates) {
                setDateRange([dayjs(dates[0]).format("YYYY-MM-DD"), dayjs(dates[1]).format("YYYY-MM-DD")]);
              } else {
                setDateRange(null);
              }
            }}
          />
          <Search
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey={(record) => record.id} // Use id as rowKey
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
            style: { display: "flex", justifyContent: "center" },
          }}
          bordered
        />
      </Space>
    </Card>
  );
};

export default OrdersDashboard;
