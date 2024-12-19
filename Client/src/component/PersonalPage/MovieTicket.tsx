import React, { useState, useEffect } from "react";
import { Card, Button, Typography, Image, Space, Row, Col, DatePicker } from "antd";
import {
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  TagOutlined,
  CreditCardOutlined,
  BarcodeOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import instance from "../../server";
import moment from "moment";

import Footer from "../Footer/Footer";
import { Combo } from "../../interface/Combo";
import { Showtime } from "../../interface/Showtimes";
import { Seat } from "../../interface/Seat";
import Skeleton from "react-loading-skeleton"; // Import Skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import CSS for Skeleton
import Header from "../Header/Hearder";

const { Title, Text } = Typography;

interface Order {
  id: number;
  booking_code: string;
  qrcode: string;
  showtime: Showtime;
  seats: Seat[];
  amount: number;
  combos: Combo[];
  pay_method: {
    pay_method_name: string;
  };
  status: string;
}

const OrderHistoryApp: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // State for loading status

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(amount)
      .replace("₫", "VND"); // Thay "₫" bằng "VND"
  };

  useEffect(() => {
    setLoading(true); // Start loading
    instance
      .get("/order") // Endpoint API
      .then((response) => {
        const mappedOrders = response.data.data.map((order: any) => ({
          id: order.id,
          booking_code: order.booking_code,
          qrcode: order.qrcode,
          showtime: {
            ...order.showtime,
            movie: order.showtime.movie,
            room: order.showtime.room,
          },
          seats: order.seats,
          amount: order.amount,
          combos: order.combos,
          pay_method: order.pay_method,
          status: order.status,
        }));
        setOrders(mappedOrders);
        setFilteredOrders(mappedOrders); // Show all orders initially
        setLoading(false); // Stop loading
        // console.log(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        setLoading(false); // Stop loading on error
      });
  }, []);

  const handleDateFilter = (date: moment.Moment | null, dateString: string | string[]) => {
    const filterDate = Array.isArray(dateString) ? dateString[0] : dateString;
    setSelectedDate(filterDate); // Gán giá trị vào state (selectedDate có kiểu string)

    if (filterDate) {
      const filtered = orders.filter(
        (order) => order.showtime.showtime_date === filterDate
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleBackToOrders = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <Header />
      <div
        style={{
          padding: "30px",
          maxWidth: "1200px",
          margin: "0 auto",
          background: "#f8f9fa",
          borderRadius: "10px",
          marginTop: "20px",
        }}
      >
        {!selectedOrder ? (
          <div>
            <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
              Lịch Sử Mua Hàng
            </Title>

            {/* Lọc theo ngày */}
            <DatePicker
              style={{
                marginBottom: "20px",
                width: "100%",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              onChange={handleDateFilter}
              value={selectedDate ? moment(selectedDate, "YYYY-MM-DD") : null}
              format="YYYY-MM-DD"
            />
            {loading ? (
              <Skeleton height={100} count={5} style={{ marginBottom: "20px" }} />
            ) : filteredOrders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#1890ff",
                  fontSize: "18px",
                  marginTop: "20px",
                }}
              >
                Bạn chưa có đơn hàng nào
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  hoverable
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    marginBottom: "20px",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
                    backgroundColor: "#fff",
                    transition: "transform 0.3s ease",
                  }}
                  
                >
                  <Row gutter={16} align="middle" justify="space-between">
                    <Col xs={24} sm={6} style={{ textAlign: "center" }}>
                      {loading ? (
                        <Skeleton width={120} height={180} />
                      ) : (
                        <Image
                          src={order.showtime.movie.poster || undefined}
                          alt={order.showtime.movie.movie_name}
                          width={120}
                          style={{ borderRadius: "10px" }}
                        />
                      )}
                    </Col>
                    <Col xs={24} sm={18} className="order-info">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Title level={4} style={{ margin: 0, fontWeight: 600 }}>
                          {loading ? <Skeleton width={200} /> : order.showtime.movie.movie_name}
                        </Title>
                        <Text>
                          {loading ? (
                            <Skeleton width={150} />
                          ) : (
                            <>
                              <EnvironmentOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
                              <b>Phòng chiếu :</b> {order.showtime.room.room_name}
                            </>
                          )}
                        </Text>
                        <Text>
                          {loading ? (
                            <Skeleton width={200} />
                          ) : (
                            <>
                              <CalendarOutlined style={{ marginRight: "8px", color: "#faad14" }} />
                              <b>Thời gian:</b> {order.showtime.showtime_date} - {order.showtime.showtime_start.slice(0,5)}
                            </>
                          )}
                        </Text>
                        <Text>
                          {loading ? (
                            <Skeleton width={150} />
                          ) : (
                            <>
                              <TeamOutlined style={{ marginRight: "8px", color: "#52c41a" }} />
                              <b>Ghế:</b> {order.seats.map((s) => s.seat_name).join(", ")}
                            </>
                          )}
                        </Text>
                     
                        <Text style={{ fontSize: "16px" }}>
                              <FieldTimeOutlined style={{ marginRight: "10px", color: "#fa541c" }} />
                              <b>Trạng thái:</b> {order.status}
                            </Text>
                            <Text style={{ fontWeight: 600 }}>
                          <b>Tổng:</b> {formatCurrency(order.amount)}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToOrders}
              style={{
                marginBottom: "20px",
                fontSize: "16px",
                borderRadius: "5px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              Back to Orders
            </Button>
            <Card
              style={{
                marginTop: "20px",
                borderRadius: "10px",
                padding: "20px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                background: "#ffffff",
              }}
            >
              <Row gutter={24}>
                <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                  {loading ? (
                    <Skeleton width={180} height={270} />
                  ) : (
                    <Image
                      src={selectedOrder.showtime.movie.poster || undefined}
                      alt="Movie Poster"
                      width={180}
                      style={{
                        margin: "0 auto 20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      }}
                    />
                  )}
                </Col>

                <Col xs={24} sm={16}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={16}>
                      <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        {loading ? (
                          <Skeleton count={6} />
                        ) : (
                          <>
                            <Text style={{ fontSize: "16px" }}>
                              <EnvironmentOutlined style={{ marginRight: "10px", color: "#1890ff" }} />
                              <b>Phòng:</b> {selectedOrder.showtime.room.room_name}
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <CalendarOutlined style={{ marginRight: "10px", color: "#faad14" }} />
                              <b>Thời gian:</b>{selectedOrder.showtime.showtime_start.slice(0,5) } - {selectedOrder.showtime.showtime_date} 
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <TeamOutlined style={{ marginRight: "10px", color: "#52c41a" }} />
                              <b>Ghế:</b> {selectedOrder.seats.map((s) => s.seat_name).join(", ")}
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <TagOutlined style={{ marginRight: "10px", color: "#d48806" }} />
                              <b>Combo:</b> {selectedOrder.combos && selectedOrder.combos.length > 0 ? selectedOrder.combos.map((c: any) => `${c.combo_name}`).join(", ") : "Không có combo"}
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <BarcodeOutlined style={{ marginRight: "10px", color: "#722ed1" }} />
                              <b>Mã đơn hàng:</b> {selectedOrder.booking_code}
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <CreditCardOutlined style={{ marginRight: "10px", color: "#13c2c2" }} />
                              <b>Phương thức thanh toán:</b> {selectedOrder.pay_method.pay_method_name}
                            </Text>
                            <Text style={{ fontSize: "16px" }}>
                              <FieldTimeOutlined style={{ marginRight: "10px", color: "#fa541c" }} />
                              <b>Trạng thái:</b> {selectedOrder.status}
                            </Text>
                          </>
                        )}
                      </Space>
                    </Col>

                    <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                      {loading ? (
                        <Skeleton width={120} height={120} />
                      ) : (
                        <Image
                          src={selectedOrder.qrcode}
                          alt="QR Code"
                          width={120}
                          style={{
                            margin: "0 auto",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                          }}
                        />
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default OrderHistoryApp;
