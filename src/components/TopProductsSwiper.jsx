import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
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
              <Card
                product={p}
                productInCart={counts[p.id]}
                onUpdate={onUpdate}
                loading={false}
                registered={registered}
              />
            </SwiperSlide>
          ))}
    </Swiper>
  )
}

export default TopProductsSwiper
