import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"

import "./swiperStyles.css"

import OrganizerCard from "./OrganizerCard"

export interface OrganizerItem {
  id?: string
  type: number
  name: string
  photoUrl: string
  socialNetworks?: { type: string; url: string }[]
}

interface OrganizerProps {
  organizers: OrganizerItem[]
}

export const Organizer = ({ organizers = [] }: OrganizerProps) => {
  const sortedOrganizers = [...organizers].sort((a, b) => b.type - a.type)

  return (
    <div className="circuit-background mx-auto max-w-screen-xl">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop={sortedOrganizers.length > 2}
        modules={[Autoplay, EffectCoverflow, Pagination]}
        className="mySwiper"
        style={{ height: "100%", paddingBottom: "90px" }}
      >
        {sortedOrganizers.map(organizerProps => (
          <SwiperSlide
            key={organizerProps.name}
            style={{
              backgroundPosition: "center",
              backgroundSize: "cover",
              width: "300px",
              height: "360px",
            }}
          >
            <OrganizerCard
              id={organizerProps.id || i.toString()}
              name={organizerProps.name}
              photoUrl={organizerProps.photoUrl}
              socialNetworks={organizerProps.socialNetworks}
              uuid={i + 1}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Organizer
