import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const CategorySwiper = ({ categories, handleCategoryClick }) => {
  return (
    <Swiper
      className="!z-0"
      spaceBetween={16} // slide orasidagi masofa
      slidesPerView={2} // mobil uchun 2 ta
      breakpoints={{
        640: { slidesPerView: 4 }, // sm ekran
        768: { slidesPerView: 6 }, // md ekran
      }}
    >
      {categories?.data?.map((cat, index) => (
        <SwiperSlide key={index}>
          <div
            onClick={() => handleCategoryClick(cat.Id)}
            className={`cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-300 ${
              cat.active
                ? "text-[rgb(22,113,98)]"
                : "text-gray-800 dark:text-white"
            }`}
          >
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 shadow-md overflow-hidden ${
                cat.active ? "bg-[rgb(22,113,98)]" : "bg-gray-100"
              }`}
            >
              <img
                src={cat.image || "/src/assets/no-photo.jpg"}
                alt={cat.name}
                className="w-25 h-25 object-contain"
              />
            </div>
            <p className="text-sm font-medium z-0">
              {cat.name.length > 20 ? cat.name.slice(0, 30) + "..." : cat.name}
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CategorySwiper;
