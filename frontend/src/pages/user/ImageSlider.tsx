import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export const ImageSlider = ({ images }: { images: string[] }) => {
  return (
    <Swiper spaceBetween={10} slidesPerView={1} >
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            className="w-full object-cover rounded-xl "
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};