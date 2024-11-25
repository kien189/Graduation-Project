import "./App.css";
import { Route, Routes } from "react-router-dom";

import OrderPage from "./component/Oders/OrderPage";
import OrderCheckout from "./component/Pay/OderCheckOut";
import CinemaSeatSelection from "./component/SeatMap/CinemaSeatSelection";
import Headerticket from "./component/Headerticket/Headerticket";
import RegisterCinema from "./Page/Client/RegisterCinema";
import LoginCinema from "./Page/Client/LoginCinema";
import Dashboard from "./Page/Admin/Dashboard/Dashboard";
import User from "./Page/Admin/User/UserManager";
import ShowtimesManager from "./Page/Admin/Showtimes/ShowtimesManager";
import OrdersManager from "./Page/Admin/Orders/OrdersManager";

import PostsManager from "./Page/Admin/Posts/PostsManager";
import CategoriesManager from "./Page/Admin/Categories/CategoriesManager";
import CountriesManager from "./Page/Admin/Countries/CountriesManager";
import ComboManager from "./Page/Admin/Combo/ComboManager";
import CinemasManager from "./Page/Admin/Cinemas/CinemasManager";
import MoviesManager from "./Page/Admin/Movies/MoviesManager";
import SchedulesManager from "./Page/Admin/Schedules/SchedulesManager";
import RevenueByCinemaManager from "./Page/Admin/RevenueByCinema/RevenueByCinemaManager";
import RevenueByMoviesManager from "./Page/Admin/RevenueByMoviesManager/RevenueByMoviesManager";
import EmailConfirm from "./component/EmailConfirm/EmailConfirm";
import UserAddManager from "./Page/Admin/User/UserAdd";
import Home from "./Page/Home";
import Bookcinematickets from "./Page/Client/Bookcinematickets";
import CinemasFormManager from "./Page/Admin/Cinemas/CinemasForm";
import ComboFormManager from "./Page/Admin/Combo/ComboForm";
import ShowtimesFormManager from "./Page/Admin/Showtimes/ShowtimesForm";
import MoviesManagerForm from "./Page/Admin/Movies/MoviesForm";
import PaymentCallback from "./component/Pay/PaymentCallback";
import PostsFormManager from "./Page/Admin/Posts/PostForm";
import LichChieu from "./component/MovieDetail/LichChieu";
import DanhGia from "./component/MovieDetail/DanhGia";
import TinTuc from "./component/MovieDetail/TinTuc";
import { ContentMovie } from "./component/MovieDetail/ContentMovie";
import CountriesFormManager from "./Page/Admin/Countries/CountriesForm";
import MoviesAddManager from "./Page/Admin/Movies/MoviesForm";
import CategoriesFormManager from "./Page/Admin/Categories/CategoriesForm";
import MuaVe from "./component/MovieDetail/MuaVe";
import SerachMovies from "./component/SerachMovies/SerachMovies";

import Personal from "./component/PersonalPage/Personal";
import ChangePassword from "./component/PersonalPage/ChangePassword";
import Profile from "./component/PersonalPage/Profile";
import PrivateRoute from "./PrivateRoute";

import MovieShowing from "./component/Movies/MovieShowing";
import SupportCenter from "./component/Support/Support";
import PostDetail from "./component/Post/PostDetail";
import Credits from "./component/PersonalPage/Credits";
import Deponsit from "./component/PersonalPage/Deposit";
import ForgetPass from "./component/Login/ForgetPass";

import AdminLogin from "./component/Admin/Login/LoginAdmin";
import PostDetailManager from "./component/Admin/PostsDasboard/PostDetailManager";

import EarlyMovie from "./component/Movies/EarlyMovie";
import ResetPassword from "./component/Login/ResetPasswod";
import Otp from "./component/Login/Otp";
import NotFound from "./component/NotFoud/NotFound";
import ResetPasswod from "./component/Login/ResetPasswod";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from '../src/server/queryClient'; 

import RoomsManager from "./Page/Admin/Rooms/RoomsManager";
import RoomsFormManager from "./Page/Admin/Rooms/RoomsForm";
import Video from "./component/News/Video";
import FilmNews from "./component/News/FilmNews";
import MovieTicket from "./component/PersonalPage/MovieTicket";
import ActorManager from "./Page/Admin/Actor/ActorManager";
import ActorForm from "./Page/Admin/Actor/ActorForm";
import DirectorManager from "./Page/Admin/Director/DirectorManager";
import DirectorFormManager from "./Page/Admin/Director/DirectorForm";
import UpcomingMovies from "./component/Movies/UpcomingMovies";
import PageTitleUpdater from "./component/PageTitleUpdater/PageTitleUpdater";





function App() {

  return (
    <>
      <QueryClientProvider client={queryClient}>
       <PageTitleUpdater/>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/buy-ticket" element={<Bookcinematickets />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/pay" element={<OrderCheckout />} />
        <Route path="/seat" element={<CinemaSeatSelection />} />
        <Route path="/movie-detail/:slug" element={<ContentMovie />} />
        <Route path="/schedule/:slug" element={<LichChieu />} />
        <Route path="/reviews/:slug" element={<DanhGia />} />
        <Route path="/news/:slug" element={<TinTuc />} />
        <Route path="/buy-now/:slug" element={<MuaVe />} />
        <Route path="/headerticket" element={<Headerticket />} />
        <Route path="/confirm" element={<EmailConfirm />} />
        <Route path="/payment-callback" element={<PaymentCallback />} />
        <Route path="/*" element={<NotFound />} />


        <Route path="/filmnews" element={<FilmNews/>} />
        <Route path="/video" element={<Video />} />
        <Route path="/sp" element={<SupportCenter />} />
        <Route path="/postdetail/:id" element={<PostDetail />} />



        <Route path="/movie/search/:movie_name" element={<SerachMovies />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Personal" element={<Personal />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/ChangePassword" element={<ChangePassword />} />
   
        <Route path="/register" element={<RegisterCinema />} />
        <Route path="/login" element={<LoginCinema />} />
        <Route path="/movieshowing" element={<MovieShowing/>} />
        <Route path="/movieticket" element={<MovieTicket />} />
        <Route path="/deponsit" element={<Deponsit/>} />
        <Route path="/forgetpass" element={<ForgetPass/>} />
        <Route path="/otp" element={<Otp/>} />
        <Route path="/resetPassword" element={<ResetPasswod/>} />
      
    
       
        <Route path="/upcoming-movies" element={<UpcomingMovies />} />
        <Route path="/movieshowing" element={<MovieShowing />} />
        <Route path="/movieticket" element={<MovieTicket />} />

        <Route path="/deponsit" element={<Deponsit />} />
        <Route path="/forgetpass" element={<ForgetPass />} />


        <Route path="/otp" element={<Otp />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/earlymovie" element={<EarlyMovie />} />
        <Route path="/resetpass" element={<ResetPasswod />} />





        {/* Phân quyền cho các route admin */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin','manager','staff']}><AdminLogin/></PrivateRoute>}/>
        <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['admin','manager','staff']}><Dashboard /></PrivateRoute>} />
        <Route path="/admin/user" element={<PrivateRoute allowedRoles={['admin']}><User /></PrivateRoute>} />
        <Route path="/admin/user/roles" element={<PrivateRoute allowedRoles={['admin']}><UserAddManager /></PrivateRoute>} />
        <Route path="/admin/actor" element={<PrivateRoute allowedRoles={['admin']}><ActorManager/></PrivateRoute>} />
        <Route path="/admin/actor/add" element={<PrivateRoute allowedRoles={['admin']}><ActorForm/></PrivateRoute>} />
        <Route path="/admin/actor/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><ActorForm/></PrivateRoute>} />
        <Route path="/admin/director" element={<PrivateRoute allowedRoles={['admin']}><DirectorManager/></PrivateRoute>} />
        <Route path="/admin/director/add" element={<PrivateRoute allowedRoles={['admin']}><DirectorFormManager/></PrivateRoute>} />
        <Route path="/admin/director/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><DirectorFormManager/></PrivateRoute>} />
        <Route path="/admin/showtimes" element={<PrivateRoute allowedRoles={['admin']}><ShowtimesManager /></PrivateRoute>} />
        <Route path="/admin/showtimes/add" element={<PrivateRoute allowedRoles={['admin']}><ShowtimesFormManager /></PrivateRoute>} />
        <Route path="/admin/showtimes/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><ShowtimesFormManager /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute allowedRoles={['admin']}><OrdersManager /></PrivateRoute>} />
      
        <Route path="/admin/posts" element={<PrivateRoute allowedRoles={['admin']}><PostsManager /></PrivateRoute>} />
        <Route path="/admin/posts/:postId" element={<PrivateRoute allowedRoles={['admin']}><PostDetailManager /></PrivateRoute>} />
        <Route path="/admin/posts/add" element={<PrivateRoute allowedRoles={['admin']}><PostsFormManager /></PrivateRoute>} />
        <Route path="/admin/posts/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><PostsFormManager /></PrivateRoute>} />
        <Route path="/admin/categories" element={<PrivateRoute allowedRoles={['admin']}><CategoriesManager /></PrivateRoute>} />
        <Route path="/admin/categories/add" element={<PrivateRoute allowedRoles={['admin']}><CategoriesFormManager /></PrivateRoute>} />
        <Route path="/admin/categories/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><CategoriesFormManager /></PrivateRoute>} />
        <Route path="/admin/countries" element={<PrivateRoute allowedRoles={['admin']}><CountriesManager /></PrivateRoute>} />
        <Route path="/admin/countries/add" element={<PrivateRoute allowedRoles={['admin']}><CountriesFormManager /></PrivateRoute>} />
        <Route path="/admin/countries/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><CountriesFormManager /></PrivateRoute>} />
        <Route path="/admin/combo" element={<PrivateRoute allowedRoles={['admin']}><ComboManager /></PrivateRoute>} />
        <Route path="/admin/combo/add" element={<PrivateRoute allowedRoles={['admin']}><ComboFormManager /></PrivateRoute>} />
        <Route path="/admin/combo/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><ComboFormManager /></PrivateRoute>} />
        <Route path="/admin/cinemas" element={<PrivateRoute allowedRoles={['admin']}><CinemasManager /></PrivateRoute>} />
        <Route path="/admin/cinemas/add" element={<PrivateRoute allowedRoles={['admin']}><CinemasFormManager /></PrivateRoute>} />
        <Route path="/admin/cinemas/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><CinemasFormManager /></PrivateRoute>} />
        <Route path="/admin/rooms" element={<PrivateRoute allowedRoles={['admin']}><RoomsManager/></PrivateRoute>} />
        <Route path="/admin/rooms/add" element={<PrivateRoute allowedRoles={['admin']}><RoomsFormManager/></PrivateRoute>} />
        <Route path="/admin/rooms/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><RoomsFormManager/></PrivateRoute>} />
        <Route path="/admin/movies" element={<PrivateRoute allowedRoles={['admin']}><MoviesManager /></PrivateRoute>} />
        <Route path="/admin/movies/add" element={<PrivateRoute allowedRoles={['admin']}><MoviesManagerForm /></PrivateRoute>} />
        <Route path="/admin/movies/edit/:id" element={<PrivateRoute allowedRoles={['admin']}><MoviesAddManager /></PrivateRoute>} />
        <Route path="/admin/schedules" element={<PrivateRoute allowedRoles={['admin']}><SchedulesManager /></PrivateRoute>} />
        <Route path="/admin/revenuebycinema" element={<PrivateRoute allowedRoles={['admin']}><RevenueByCinemaManager /></PrivateRoute>} />
        <Route path="/admin/revenuebymovie" element={<PrivateRoute allowedRoles={['admin']}><RevenueByMoviesManager /></PrivateRoute>} />
      </Routes>
      </QueryClientProvider>
    </>
  );
}

export default App;