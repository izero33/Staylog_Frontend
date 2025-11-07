import { useEffect, useRef, useState } from "react"
import api from "../../../global/api"
import type { HomeAccommodationListRequest } from "../types/home";

import type { HomeAccommodationListResponse } from "../types/homeList";
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Card } from "react-bootstrap";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";

type HomeListSectionProps = HomeAccommodationListRequest & {
  title?: string;
};


function HomeListSection({ regionCode, sort, offset = 0, limit = 20, title }: HomeListSectionProps) {


  const [list, setList] = useState<HomeAccommodationListResponse>([]);
  const [pageOffset, setPageOffset] = useState(offset);

  useEffect(() => {
    api.get('v1/home', { params: { regionCode, sort, offset: pageOffset, limit } })
      .then(data => setList(data))
      .catch(err => {
        console.error(err);
      })
  }, [regionCode, sort, pageOffset, limit])

  const navigate = useNavigate();


  return <>


    <Swiper
      modules={[Navigation]}
      slidesPerView={3}         // 한 화면에 카드 3개
      spaceBetween={16}         // 카드 사이 간격
      navigation                 // ← → 버튼 자동 생성
      pagination={{ clickable: true }} // 아래 점 UI
      grabCursor={true}         // 마우스로 잡고 드래그 가능
    >
      {list.map(item => (
        <SwiperSlide key={item.accommodationId}>
          <Card className="home-card" onClick={() => navigate(`/accommodations/${item.accommodationId}`)} >
            <Card.Img
              variant="top"
              src={item.imageUrl || "https://via.placeholder.com/320x200"}
              style={{ height: 180, objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
              <div className="d-flex">
              <Card.Text style={{ fontWeight: 700, color: "#ff385c" }}>
                <p>{item.minPrice?.toLocaleString()}원 / 박</p>
              </Card.Text>
              <Card.Text>
                <p className="ms-4">{item.regionName}</p>
              </Card.Text>
              </div>
            </Card.Body>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>





  </>
}

export default HomeListSection;















