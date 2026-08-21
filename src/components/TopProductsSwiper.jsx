import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import { IoFlame } from "react-icons/io5"
import Card from "./card"

const TopProductsSwiper = ({ products, loading, registered, counts, onUpdate }) => {
  return (
    <Swiper
      className="!z-0"
      spaceBetween={12}
      slidesPerView={2.2}
      breakpoints={{
        640: { slidesPerView: 3.2 },
        768: { slidesPerView: 4.2 },
        1024: { slidesPerView: 5 },
      }}
    >
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <SwiperSlide key={i}>
              <Card loading={true} />
            </SwiperSlide>
          ))
        : products.map(p => (
            <SwiperSlide key={p.id}>
              <div className="relative">
                <span className="absolute top-1 left-1 z-10 w-6 h-6 rounded-full bg-orange-500 shadow flex items-center justify-center">
                  <IoFlame className="text-white text-sm" />
                </span>
                <Card
                  product={p}
                  productInCart={counts[p.id]}
                  onUpdate={onUpdate}
                  loading={false}
                  registered={registered}
                />
              </div>
            </SwiperSlide>
          ))}
    </Swiper>
  )
}

export default TopProductsSwiper
