import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate để điều hướng
import Header from "../Header/Hearder";
import Footer from "../Footer/Footer";
import Headerticket from "../Headerticket/Headerticket";
import "./CinemaSeatSelection.css";
import instance from "../../server";
import { message, notification, Spin } from "antd";
import { Modal } from "antd";
import { Movie } from "../../interface/Movie";
import initializeEcho from "../../server/realtime";
import Echo from "laravel-echo";
import { Cinema } from "../../interface/Cinema";
import { SeatMap } from "../../interface/SeatMapp";
import AgeWarningModal from "./AgeWarningModal";

interface Showtime {
  id: number;
  movie_id: number;
  movie: Movie;
  room_id: number;
  room: {
    id: string;
    room_name: string;
    cinema: Cinema;
    seat_map: SeatMap;
    cinema_id: string;

  };
  showtime_date: string;
  showtime_start: string;
  showtime_end: string;
  price: number;
  status: number;
  created_at: string;
  updated_at: string;
}
const CinemaSeatSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Khai báo useNavigate để điều hướng
  const { movieName, cinemaName, showtime, showtimeId, cinemaId, price } =
    location.state || {};

  const [selectedSeats, setSelectedSeats] = useState<Map<string, number[]>>(
    new Map()
  );
  const [userSeatsMap, setUserSeatsMap] = useState<Map<number, Set<string>>>(new Map());

  const [loading, setLoading] = useState(true); // Add loading state
  const [reservedSeats, setReservedSeats] = useState<Set<string>>(new Set());
  const [showtimeData, setShowtimeData] = useState<Showtime>();
  const [seatData, setSeatData] = useState<SeatMap>({
    seat_structure: [],
    matrix_row: 0,
    matrix_column: 0,
  });

  const [error, setError] = useState("");

  const [echoInstance, setEchoInstance] = useState<Echo<"pusher"> | null>(null);

  useEffect(() => {
    const fetchRoomAndSeats = async () => {
      try {
        const response = await instance.get(`/showtimes/${showtimeId}`);
        const seatLayoutData = response.data.data;

        const seatStructure = seatLayoutData?.room?.seat_map?.seat_structure;

        setShowtimeData(seatLayoutData);

        setSeatData({
          seat_structure: seatStructure,
          matrix_row: seatLayoutData?.room?.seat_map?.matrix_row || 0,
          matrix_column: seatLayoutData?.room?.seat_map?.matrix_column || 0,
        });

        try {
          const seatResponse = await instance.get(`/seat/${showtimeId}`);
          const reservedSeatSet: Set<string> = new Set();

          if (Array.isArray(seatResponse.data?.data)) {
            seatResponse.data.data.forEach((seat: any) => {
              if (seat.seat_type === "Standard") {
                reservedSeatSet.add(seat.seat_name);
              }
            });
          }

          setReservedSeats(reservedSeatSet);
        } catch (error) {
          console.error("Error fetching seat data:", error);
          setReservedSeats(new Set()); // Trả về Set rỗng nếu có lỗi
        } finally {
          setLoading(false); // Đảm bảo loading dừng lại dù có lỗi hay không
        }
        return seatLayoutData?.room_id;
      } catch (error) {
        console.error("Error fetching room or seat data", error);
        setError("Không thể tải dữ liệu, vui lòng thử lại!");
        setLoading(false);
        return null;
      }
    };




    const setupRealtime = async (roomId: string) => {
      try {
        const echo = await initializeEcho();
        // console.log("Connected to Pusher!", echo);
        if (!roomId) {
          console.error("Room ID is missing!");
          return;
        }
        if (!roomId) {
          console.error("Room ID is missing!");
          return;
        }
        if (echo) {
          const channel = echo.private(`seats-${roomId}`); // Dùng roomId đã truyền vào
          // console.log("Connected to channel:", channel);

          // Lắng nghe sự kiện SeatSelected
          channel.listen("SeatSelected", (eventData: any) => {
            const { seats, userId } = eventData;
            console.log("Received seats:", seats);
            updateSeatsSelection(seats, userId);
          });
        }
      } catch (error) {
        console.error("Failed to setup realtime connection:", error);
      }
    };

    fetchRoomAndSeats()
      .then((roomId) => {
        // console.log("Fetched roomId:", roomId);
        if (roomId && !echoInstance) {
          setupRealtime(roomId); // Truyền roomId vào hàm setupRealtime
        }
      })
      .catch((error) => {
        console.error("Error initializing data", error);
      });

    return () => {
      if (echoInstance) {
        echoInstance.disconnect();
        setEchoInstance(null);
      }
    };
  }, [showtimeId, echoInstance]);
  const updateSeatsSelection = (selectedSeats: string[], userId: number) => {
    setUserSeatsMap((prevMap) => {
      const updatedMap = new Map(prevMap);

      // Cập nhật ghế được chọn của userId hiện tại
      updatedMap.set(userId, new Set(selectedSeats));

      // Gộp tất cả các trạng thái từ updatedMap
      const allSelectedSeats = new Map<string, { isSelected: boolean; userId: number }>();

      updatedMap.forEach((seats, id) => {
        seats.forEach((seat) => {
          allSelectedSeats.set(seat, {
            isSelected: true,
            userId: id,
          });
        });
      });

      // Cập nhật seat_structure với trạng thái gộp
      setSeatData((prevSeatData) => {
        if (!prevSeatData || !prevSeatData.seat_structure) {
          console.error("Seat structure is not available or empty!");
          return prevSeatData;
        }

        const updatedSeatStructure = prevSeatData.seat_structure.map((seat) => {
          const seatKey = `${seat.row}-${seat.column}`;
          const seatStatus = allSelectedSeats.get(seatKey);

          if (seatStatus) {
            return {
              ...seat,
              isSelected: seatStatus.isSelected,
              isDisabled: seatStatus.userId !== parseInt(localStorage.getItem("user_id") || "0", 10),
            };
          } else {
            return {
              ...seat,
              isSelected: false,
              isDisabled: false,
            };
          }
        });

        return {
          ...prevSeatData,
          seat_structure: updatedSeatStructure,
        };
      });

      return updatedMap;
    });
  };






  const { seat_structure, matrix_row, matrix_column } = seatData;

  // Tạo mảng các hàng (A, B, C, ...) dựa trên số lượng hàng
  const rows = Array.from({ length: matrix_row }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  // Tạo mảng các cột
  const columns = Array.from({ length: matrix_column }, (_, i) => i + 1);

  const handleSeatClick = (row: string, col: number) => {
    const seat = seat_structure.find((s) => s.row === row && s.column === col);

    if (!seat) {
      console.error(`Seat not found for row ${row}, column ${col}`);
      return;
    }

    const seatLabel = seat.label;

    if (reservedSeats.has(seatLabel)) {
      message.warning("Ghế này đã được đặt.");
      return;
    }

    // Lấy ghế liên kết
    const linkedSeatLabel = seat.linkedSeat;
    const linkedSeat = seat_structure.find((s) => s.label === linkedSeatLabel);

    const newSelectedSeats = new Map(selectedSeats);

    const currentIndices = newSelectedSeats.get(row) || [];
    if (currentIndices.includes(col)) {
      // Bỏ chọn ghế
      newSelectedSeats.set(
        row,
        currentIndices.filter((index) => index !== col)
      );

      // Nếu ghế có liên kết, bỏ chọn ghế liên kết
      if (linkedSeat) {
        const linkedRow = linkedSeat.row;
        const linkedCol = linkedSeat.column;
        const linkedIndices = newSelectedSeats.get(linkedRow) || [];
        newSelectedSeats.set(
          linkedRow,
          linkedIndices.filter((index) => index !== linkedCol)
        );
      }
    } else {
      const selectedSeatsCount = Array.from(newSelectedSeats.values()).flat().length;
      if (selectedSeatsCount >= 8) {
        Modal.warning({
          title: "Chỉ cho phép đặt tối đa 8 ghế trong 1 lần đặt vé.",
          content: "Vui lòng chọn lại, bạn chỉ có thể chọn tối đa 8 ghế.",
          onOk() { },
        });
        return; // Không cho phép chọn thêm ghế
      }
      newSelectedSeats.set(row, [...currentIndices, col]);

      // Nếu ghế có liên kết, chọn cả ghế liên kết
      if (linkedSeat) {
        const linkedRow = linkedSeat.row;
        const linkedCol = linkedSeat.column;
        const linkedIndices = newSelectedSeats.get(linkedRow) || [];
        newSelectedSeats.set(linkedRow, [...linkedIndices, linkedCol]);
      }
    }

    setSelectedSeats(newSelectedSeats);

    // Chuyển dữ liệu ghế đã chọn thành dạng mảng ghế
    const updatedSelectedSeats = Array.from(newSelectedSeats.entries()).flatMap(
      ([row, indices]) => indices.map((colIndex) => `${row}-${colIndex}`) // Bỏ +1 nếu không cần thiết
    );


    instance
      .post(`/seat-selection/${showtimeData?.room.id}`, {
        seats: updatedSelectedSeats,
      })
      .then((response) => {
        console.log("API response:", response.data);
      })
      .catch((error) => {
        console.error("Error while saving seats:", error);
      });
  };

  const calculatePrice = () => {
    let totalPrice = 0;

    selectedSeats.forEach((indices, row) => {
      indices.forEach((col) => {
        // Tìm ghế trong seat_structure dựa trên hàng (row) và cột (col)
        const seat = seatData.seat_structure.find(
          (s) => s.row === row && s.column === col
        );

        if (!seat) return; // Nếu không tìm thấy ghế, bỏ qua

        // Tính giá vé dựa trên loại ghế
        if (seat.type === "VIP") {
          totalPrice += price * 1.3; // Giá vé cho ghế VIP
        } else if (seat.type === "Couple") {
          totalPrice += price * 1.3 * 2; // Giá vé cho ghế đôi (giá đôi)
        } else {
          totalPrice += price; // Giá vé cho ghế thường
        }
      });
    });

    return totalPrice;
  };

  const totalPrice = calculatePrice();

  const getTotalSeatsInRow = (row: string) => {
    return seat_structure.filter((seat) => seat.row === row).length;
  };
  const totalSeatsInRows: Record<string, number> = rows.reduce(
    (acc, row) => ({
      ...acc,
      [row]: getTotalSeatsInRow(row), // Tính tổng số ghế của từng hàng
    }),
    {}
  );

  // const rows = Object.keys(seatData.seats);
  // const columns = seatData.room.seat_layout.columns;
  const handleSubmit = async () => {
    const selectedSeatsArray = Array.from(selectedSeats.entries()).flatMap(
      ([row, indices]) =>
        indices.map((index) => {
          const seat = seat_structure.find(
            (s) => s.row === row && s.column === index
          );

          // Bao gồm cả linkedSeat
          return {
            seat_name: seat?.label || `${row}${index}`,
            room_id: showtimeData?.room.id,
            showtime_id: showtimeId,
            seat_row: row.charCodeAt(0) - 65 + 1,
            seat_column: index,
          };
        })
    );

    const payload = {
      cinemaId,
      showtimeId,
      seats: selectedSeatsArray,
      totalSeatsInRows,
    };

    try {
      const response = await instance.post("/selectSeats", payload);

      if (response.status === 200) {
        navigate("/orders", {
          state: {
            movieName,
            cinemaName,
            showtime,
            showtimeId,
            cinemaId,
            roomId: showtimeData?.room.id,
            seats: selectedSeatsArray,
            totalPrice,
          },
        });
      } else if (response.data.message === "Some seats already exist.") {
        message.error(
          "Một số ghế đã được đặt trước. Chuyển về trang chủ sau 3 giây!",
          3
        );
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        console.error("Error: API call successful but status is not 200");
      }
    } catch (error: any) {
      if (error.response) {
        // Lấy thông báo lỗi từ backend
        const backendMessage = error.response.data?.message || "Đã xảy ra lỗi không xác định.";

        // Kiểm tra các mã lỗi cụ thể nếu cần
        if (error.response.status === 401) {
          message.warning("Vui lòng đăng nhập để tiếp tục.");
          navigate("/login"); // Chuyển đến trang đăng nhập
        } else if (error.response.status === 402) {
          const missingSeat = error.response.data?.data?.missing_seats;

          // Nếu thông báo lỗi liên quan đến ghế
          if (
            backendMessage ===
            "Please select consecutive seats without gaps." ||
            backendMessage === "Please select consecutive seats up to the last seat of the row."
          ) {
            Modal.error({
              title: "Lỗi chọn ghế",
              content: `Vui lòng không để trống ghế ${missingSeat || "Không xác định"
                }`,
              icon: null,
              className: "custom-error-modal",
            });
            return; // Dừng ở đây để không hiển thị modal mặc định
          }
        }

        // Hiển thị thông báo lỗi mặc định từ backend
        Modal.error({
          title: "Lỗi",
          content: backendMessage, // Sử dụng thông báo từ backend
          icon: null,
          className: "custom-error-modal",
        });
      } else {
        // Trường hợp không có phản hồi từ server
        Modal.error({
          title: "Lỗi kết nối",
          content: "Không thể kết nối tới máy chủ, vui lòng kiểm tra lại kết nối.",
        });
      }
    }

  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Spin tip="Đang Tải Dữ Liệu Khu Vực..." size="large" />
      </div>
    );
  }
  // Hiển thị thông báo lỗi nếu có lỗi trong việc chọn ghế hoặc submit API
  if (error) {
    return <div>{error}</div>;
  }


  return (
    <>
      <Header />
      <Headerticket />
      <AgeWarningModal />
      <div className="box-map">
        <div className="container container-map">
          <div className="seat-info-box">
            <div className="seat-map-box ">
              <div className="screen">MÀN HÌNH</div>
              <div
                className="mapseat"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginRight: "70px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {/* Render cột tên hàng */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      right: "64px",
                    }}
                  >
                    {rows.map((row) => (
                      <div
                        key={row}
                        style={{
                          width: "50px",
                          height: "30px",
                          marginBottom: "10px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: "bold",
                          color: "#fff",
                          border: "1px solid black",
                          backgroundColor: "#727575",
                        }}
                      >
                        {row}
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    {rows.map((row) => {
                      return (
                        <div
                          key={row}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            marginBottom: "10px",
                          }}
                        >
                          {columns.map((col) => {
                            const seatLabel = `${row}${col}`;

                            const seat = seat_structure.find(
                              (s) => s.row === row && s.column === col
                            );

                            const isReserved = reservedSeats.has(seatLabel);
                            const isLinkedSelected =
                              seat?.linkedSeat &&
                              Array.from(selectedSeats.entries()).some(
                                ([selectedRow, selectedCols]) => {
                                  const linkedSeat = seat_structure.find(
                                    (s) => s.label === seat.linkedSeat
                                  );
                                  return (
                                    linkedSeat?.row === selectedRow &&
                                    selectedCols.includes(linkedSeat?.column)
                                  );
                                }
                              );
                            const isSelected =
                              (selectedSeats.has(row) &&
                                selectedSeats.get(row)?.includes(col)) ||
                              isLinkedSelected ||
                              seat?.isSelected;

                            const isDisabled = seat?.isDisabled || false; // Thêm điều kiện isDisabled từ seat
                            const seatType = seat?.type || "Regular";
                            const isSeatEmpty = !seat;

                            return (
                              <div
                                key={seatLabel}
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  background: isDisabled
                                    ? "repeating-linear-gradient(45deg, hsla(0, 0%, 60%, .4), hsla(0, 0%, 60%, .4) 10px, hsla(0, 0%, 60%, .6) 0, hsla(0, 0%, 60%, .6) 20px)"
                                    : isSelected
                                      ? "#00bfff" // Ghế đang chọn
                                      : isReserved
                                        ? "#999999" // Ghế đã đặt
                                        : seatType === "VIP"
                                          ? "gold" // Ghế VIP
                                          : seatType === "Couple"
                                            ? "linear-gradient(45deg, gray 50%, rgb(56, 53, 53) 50%)" // Ghế đôi
                                            : isSeatEmpty
                                              ? "white"
                                              : "lightgray", // Ghế thông thường
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  fontSize: "10px",
                                  borderRadius: "5px",
                                  color: isSeatEmpty ? "transparent" : "#727575",
                                  fontFamily: "LaTo",
                                  fontWeight: "600",
                                  marginRight: "5px",
                                  cursor: isDisabled ? "not-allowed" : "pointer", // Thêm kiểu cursor cho ghế bị vô hiệu hóa
                                  border: isSeatEmpty ? "none" : "1px solid #ddd",
                                  opacity: isDisabled ? 0.5 : 1, // Giảm độ mờ nếu bị vô hiệu hóa
                                  pointerEvents: isDisabled ? "none" : "auto", // Ngăn click nếu bị vô hiệu hóa
                                }}
                                onClick={() => !isDisabled && handleSeatClick(row, col)} // Chặn click nếu bị vô hiệu hóa
                              >
                                {seat ? seat.label : ""}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>


                </div>
              </div>

              <div className="legend">
                <div>
                  <span className="seat selected"></span> Ghế bạn chọn
                </div>
                <div>
                  <span className="seat vip"></span> Ghế vip
                </div>
                <div>
                  <span className="seat couple-seat"></span> Ghế đôi
                </div>
                <div>
                  <span className="seat reserved"></span> Đã bán
                </div>
              </div>
            </div>
            <div className="thongtinphim">
              <div className="details-box1">
                <p className="title-phim">{showtimeData?.movie.movie_name}</p>
                <p>
                  Rạp:<span> {showtimeData?.room.cinema.cinema_name}</span>
                </p>
                <p>
                  Suất: <span>{showtime.split(":").slice(0, 2).join(":")}</span>

                </p>
                <p>
                  Phòng chiếu: <span>{showtimeData?.room.room_name}</span>
                </p>
                <p>
                  Ghế:{" "}
                  {Array.from(selectedSeats.entries())
                    .flatMap(
                      ([row, cols]) =>
                        cols
                          .map((col) => {
                            const seat = seat_structure.find(
                              (s) => s.row === row && s.column === col
                            );
                            return seat ? seat.label : null; // Lấy label nếu ghế tồn tại
                          })
                          .filter(Boolean) // Loại bỏ giá trị null hoặc undefined
                    )
                    .join(", ")}
                </p>
              </div>
              <div className="price-box1">
                <div className="price">
                  Tổng đơn hàng
                  <br />
                  <span>
                    {totalPrice.toLocaleString("vi-VN", {
                      minimumFractionDigits: 0, // No extra decimal places if not needed
                      maximumFractionDigits: 3, // Show up to 3 decimal places
                    })} VNĐ
                  </span>
                </div>

              </div>
              <div className="actionst1">
                <button className="back-btn1">←</button>
                <button
                  className="continue-btn1"
                  onClick={handleSubmit}
                  disabled={
                    Array.from(selectedSeats.values()).flat().length === 0
                  }
                >
                  Tiếp Tục
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
export default CinemaSeatSelection;
