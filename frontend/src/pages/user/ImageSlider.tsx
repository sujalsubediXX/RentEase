import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export const ImageSlider = ({ images }: { images: string[] }) => {
  return (
    <Swiper spaceBetween={10} slidesPerView={1} className="w-full h-full" >
      {images.map((img, i) => (
        <SwiperSlide key={i}>
          <img
            src={img}
            className="w-full h-full object-cover rounded-t-xl "
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};