import React, { useState, useEffect } from "react";
import instance from "../../server";
import "./CinemaSelector.css";
import { Cinema } from "../../interface/Cinema";
import { Actor } from "../../interface/Actor";
import { Movie } from "../../interface/Movie";
import { useNavigate } from "react-router-dom"; 
import dayjs from "dayjs";
import { useCountryContext } from "../../Context/CountriesContext";
import { Spin } from 'antd';  // Import Spin từ Ant Design
import { UserProfile } from "../../interface/UserProfile";



  const CinemaSelector: React.FC = () => {
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [actors, setActors] = useState<Actor[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedCity, setSelectedCity] = useState<number >();
    
    const [selectedCinema, setSelectedCinema] = useState<number>();
    const [selectedDate, setSelectedDate] = useState<string>("");
  
    const [filteredCinemas, setFilteredCinemas] = useState<Cinema[]>([]);
    const [loading, setLoading] = useState<boolean>(false);  
  
    const userProfilea: UserProfile | null = JSON.parse(localStorage.getItem("user_profile") || "null");
    const userRoles = userProfilea?.roles || [];
    const isAdmin = userRoles.length > 0 && userRoles[0]?.name === "staff";
  
    const navigate = useNavigate();
    
    // Lấy danh sách vị trí từ CountryContext
    const {
      state: { countries: locations },
    } = useCountryContext();
  
    const getCurrentDate = (): string => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
  
    const generateDateList = (): string[] => {
      return Array.from({ length: 7 }, (_, i) =>
        dayjs().add(i, "day").format("YYYY-MM-DD")
      );
    };
  
    useEffect(() => {
      const fetchCinemas = async () => {
        try {

            const response = await instance.get("/cinema");
            const cinemaData = response.data.data;
            if (Array.isArray(cinemaData)) {
                setCinemas(cinemaData);
            } else {
                console.error("Unexpected response format:", response);
                setCinemas([]);
            }
        } catch (error) {
            console.error("Error fetching cinemas:", error);
            setCinemas([]);
        }
    };
    
    
      const fetchActors = async () => {
        try {
          const response = await instance.get("/actor");
          setActors(response.data.data || []);
        } catch (error) {
          console.error("không có dữ liệu:", error);
          setActors([]);
        }
      };
    
      fetchActors();
      fetchCinemas();
      setSelectedDate(getCurrentDate());
    }, []);
  
    useEffect(() => {
      if (cinemas.length > 0 && locations.length > 0) {
          const sortedLocations = locations
              .map((location) => ({
                  ...location,
                  cinemaCount: cinemas.filter(
                      (cinema) => cinema.location_id === location.id
                  ).length,
              }))
              .sort((a, b) => b.cinemaCount - a.cinemaCount);
  
          const locationWithMostCinemas = sortedLocations[0];
          if (locationWithMostCinemas) {
              setSelectedCity(locationWithMostCinemas.id);
          }
      }
  }, [cinemas, locations]);
  
    useEffect(() => {
      if (cinemas.length > 0) {
        const sortedLocations = locations
          .map((location) => ({
            ...location,
            cinemaCount: cinemas.filter(
              (cinema) => cinema.location_id === location.id
            ).length,
          }))
          .sort((a, b) => b.cinemaCount - a.cinemaCount);
  
        const locationWithMostCinemas = sortedLocations[0];

        setSelectedCity(locationWithMostCinemas.id);
     
     
      }
    }, [cinemas, locations]);
  
    const sortedLocations = locations
      .map((location) => ({
        ...location,
        cinemaCount: cinemas.filter(
          (cinema) => cinema.location_id === location.id
        ).length,
      }))
      .sort((a, b) => b.cinemaCount - a.cinemaCount);
  
    const filteredLocations = sortedLocations.filter((location) =>
      cinemas.some((cinema) => cinema.location_id === location.id)
    );
  
    useEffect(() => {
      if (selectedCity) {
        const filtered = cinemas.filter(
          (cinema) => cinema.location_id === selectedCity
        );
        setFilteredCinemas(filtered);
        if (filtered.length > 0) {
          setSelectedCinema(filtered[0].id); 
        }
      } else {
        setFilteredCinemas(cinemas);
      }
    }, [selectedCity, cinemas]);
  
    useEffect(() => {
      const fetchMoviesForSelectedCinemaAndDate = async () => {
        if (selectedCinema && selectedDate) {
          try {
            const cinemaResponse = await instance.get(`/filterByDate`, {
              params: {
                cinema_id: selectedCinema,
                showtime_date: selectedDate,
              },
            });
  
            const cinemaMovies = cinemaResponse.data?.data || [];
            setMovies(cinemaMovies);
          } catch (error) {
            setMovies([]);
          }
        }
      };
  
      fetchMoviesForSelectedCinemaAndDate();
    }, [selectedCinema, selectedDate]);
  
    const selectedCinemaDetails = cinemas.find(
      (cinema) => cinema.id === selectedCinema
    );
  
    // Kiểm tra xem có dữ liệu khu vực hay không, nếu chưa có thì hiển thị loading
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
  
    // If the user is an admin, only show the first location and first cinema
const displayLocations = isAdmin ? filteredLocations.slice(0, 1) : filteredLocations;
    const displayCinemas = isAdmin && selectedCity ? cinemas.filter(cinema => cinema.location_id === selectedCity).slice(0, 1) : filteredCinemas;
    return (
      <div className="div-content">
        <h2 className="titles">Mua vé theo rạp</h2>
        <div className="container">
          <div className="locations">
            <h3 className="khuvuc">Khu vực</h3>
            <ul className="list-tp">
              <div className="list">
                {displayLocations.map((location) => (
                  <li
                    key={location.id}
                    className={`city ${selectedCity === location.id ? "selected" : ""}`}
                    onClick={() => setSelectedCity(location.id)}
                  >
                    {location.location_name}
                    <span className="cinema-count">{location.cinemaCount}</span>
                  </li>
                ))}
              </div>
              {!isAdmin && (
                <select
                  className="city-selects"
                  value={selectedCity ?? ""}
                  onChange={(e) => setSelectedCity(Number(e.target.value))}
                >
                  <option className="city-selects-option" value="">
                    Chọn khu vực
                  </option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.location_name}
                    </option>
                  ))}
                </select>
              )}
            </ul>
          </div>
  
          <div className="cinemas">
            <h3 className="khuvuc">Rạp</h3>
            <ul className="list-tp">
              <div className="list">
                {displayCinemas.map((cinema) => (
                  <li
                    key={cinema.id}
                    className={`cinema ${selectedCinema === cinema.id ? "selected" : ""}`}
                    onClick={() => setSelectedCinema(cinema.id )}
                  >
                    {cinema.cinema_name}
                  </li>
                ))}
              </div>
              {!isAdmin && (
                <select
                  className="city-selects"
                  value={selectedCinema ?? ""}
                  onChange={(e) => setSelectedCinema(Number(e.target.value))}
                >
                  <option className="city-selects-option" value="">
                    Chọn rạp
                  </option>
                  {filteredCinemas.map((cinema) => (
                    <option key={cinema.id} value={cinema.id}>
                      {cinema.cinema_name}
                    </option>
                  ))}
                </select>
              )}
            </ul>
          </div>
  
          <div className="showtimes">
            <div className="calendar-custom-1">
              {generateDateList().map((date) => (
                <div
                  key={date}
                  className={`date-custom-1 ${selectedDate === date ? "active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{dayjs(date).format("DD/MM")}</span>
                  <small>{dayjs(date).day() === 0 ? "CN" : `Thứ ${dayjs(date).day() + 1}`}</small>
                </div>
              ))}
            </div>
  
            {movies.length > 0 ? (
              <div className="movies">
                {movies.map((movieData) => {
                  const movie = movieData;
  
                  const sortedShowtimes = movieData.showtimes.sort((a: any, b: any) => {
                    const timeA = dayjs(`${selectedDate} ${a.showtime_start}`, "YYYY-MM-DD HH:mm");
                    const timeB = dayjs(`${selectedDate} ${b.showtime_start}`, "YYYY-MM-DD HH:mm");
                    return timeA.isBefore(timeB) ? -1 : 1;
                  });
  
                  return (
                    <div key={movie.id} className="movie">
                      <img src={movie.poster ?? undefined} alt={movie.movie_name} />
                      <div className="details">
                        <h4>{movie.movie_name}</h4>
                        <p>Thời gian: {movie.duration}</p>
                        <p>Giới hạn tuổi: {movie.age_limit}+</p>
                        <div className="showtimes-list">
                          {sortedShowtimes.map((showtime: any) => (
                            <button
                              key={showtime.id}
                              disabled={dayjs(`${selectedDate} ${showtime.showtime_start}`).isBefore(dayjs())}
                              onClick={() =>
                                navigate("/seat", {
                                  state: {
                                    movieName: movie.movie_name,
                                    cinemaName: selectedCinemaDetails?.cinema_name,
                                    showtime: showtime.showtime_start,
                                    showtimeId: showtime.id,
                                    cinemaId: selectedCinemaDetails?.id,
                                    price: showtime.price,
                                  },
                                })
                              }
                            >
                              {showtime.showtime_start.slice(0, 5)}
                              <p> {`${showtime.price / 1000}k`}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-showtime-message">Không có suất chiếu</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  

  
export default CinemaSelector;
