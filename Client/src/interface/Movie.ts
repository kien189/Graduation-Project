import { Actor } from "./Actor";

import { Cinema } from "./Cinema";
import { Director } from "./Director";
import { MovieCategory } from "./MovieCategory";

export interface Movie {
    id: number;
    movie_name: string;
    poster: string | null;
    thumbnail: string | null;
    duration: string | null;
    release_date: string | null;
    age_limit: number | null;
    description: string | null;
    trailer: string | null;
    country: string ;
    rating: string | null;
    views: number | null;
    like: number | null;
    status: number; // Số nguyên từ API trả về (1: Show, 0: Hidden)
    actor: Actor[];
    movie_category: MovieCategory[]; // Mảng các đối tượng danh mục phim chứa category_name
    director: Director[];
    movie_in_cinemas: Cinema[];
    [key: string]: any; // Có thể thêm các thuộc tính khác từ API nếu cần
}
