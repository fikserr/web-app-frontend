import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { Skeleton } from "./ui/skeleton"
import NoImage from '../assets/no-photo.jpg'

const CategorySwiper = ({ categories, handleCategoryClick, loading }) => {

  return (
    <Swiper
      className="!z-0"
      spaceBetween={16}
      slidesPerView={2}
      breakpoints={{
        640: { slidesPerView: 4 },
        768: { slidesPerView: 6 },
      }}
    >
      {loading
        ? // ✅ Skeleton slides chiqadi
        Array.from({ length: 6 }).map((_, i) => (
          <SwiperSlide key={i}>
            <div className="flex flex-col items-center justify-center">
              <Skeleton className="w-24 h-24 rounded-full mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>
          </SwiperSlide>
        ))
        : // ✅ Haqiqiy categorylar chiqadi
        categories?.data?.map((cat, index) => (
          <SwiperSlide key={index}>
            <div
              onClick={() => handleCategoryClick(cat.Id)}
              className={`cursor-pointer flex flex-col items-center justify-center text-center transition-all duration-300 ${cat.active
                ? "text-[rgb(22,113,98)]"
                : "text-gray-800 dark:text-white"
                }`}
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center mb-2 shadow-md overflow-hidden ${cat.active ? "bg-[rgb(22,113,98)]" : "bg-gray-100"
                  }`}
              >
                <img
                  src={cat?.image || NoImage}
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
  )
}

export default CategorySwiper
