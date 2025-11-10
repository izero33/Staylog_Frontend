import { useEffect, useState } from "react"
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
import { getImageUrl } from "../../../global/hooks/getImageUrl";
import '../css/HomeListSection.css'

type HomeListSectionProps = HomeAccommodationListRequest & {
  title?: string;
};


function HomeListSection({ regionCode, sort, offset = 0, limit = 3, title }: HomeListSectionProps) {

  const [list, setList] = useState<HomeAccommodationListResponse>([]);
  const [pageOffset, setPageOffset] = useState(offset);

  useEffect(() => {
    api.get('v1/home', { params: { regionCode, sort, offset: pageOffset, limit } })
      .then((data) => {
        console.log('sample item =', data?.[0]); // 여기에 키 이름이 뭐로 오는지 확인
        setList(prev => [...prev, ...data])
      })
      .catch(err => {
        console.error(err);
      })
  }, [regionCode, sort, pageOffset, limit])

  useEffect(() => {
    setList([]);
    setPageOffset(0);
  }, [regionCode, sort]);

  const navigate = useNavigate();

  const AccommodationImage = ({ id }: { id: number }) => {
    const src = getImageUrl("ACCOMMODATION", id);
    return (

      <Card.Img variant="top" src={src} style={{ height: 300, objectFit: "cover", width: "100%" }} className="border-0" />
    );
  };

  return <>

    {<h3 className="mb-3" >{title}</h3>}
    <Swiper
      modules={[Navigation]}
      spaceBetween={16}         // 카드 사이 간격
      navigation                 // ← → 버튼 자동 생성
      pagination={{ clickable: false }} // 아래 점 UI
      grabCursor={true}         // 마우스로 잡고 드래그 가능
      slidesPerGroup={3}
      loop={false}              //loop 끄기 (안 끄면 3개 단위 깨짐)
      onReachEnd={() => setPageOffset(prev => prev + limit)} //다음 오프셋을 요청
      className="mb-5"
      breakpoints={{
        0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
        576: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
        992: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
      }}
    >
      {list.map(item => (
        <SwiperSlide key={item.accommodationId}>
          <Card className="home-card border-0" onClick={() => navigate(`/accommodations/${item.accommodationId}`)}>
            <AccommodationImage id={item.accommodationId} />
            <Card.Body>
              <Card.Title>{item.name}</Card.Title>
              <Card.Text as="div">
                <div className="mb-2" style={{ color: "#ffbe26ff" }}>
                  {(() => {
                    const rating = item.ratingAvg ?? 0;
                    const full = Math.floor(rating);
                    const hasHalf = rating - full >= 0.5;

                    return Array.from({ length: 5 }).map((_, index) => {
                      if (index < full) {
                        return <i key={index} className="bi bi-star-fill me-1"></i>;
                      }
                      if (index === full && hasHalf) {
                        return <i key={index} className="bi bi-star-half me-1"></i>;
                      }
                      return <i key={index} className="bi bi-star me-1"></i>;
                    });
                  })()}
                  <span>{item.reviewCnt}</span>
                </div>
              </Card.Text>
              <div className="d-flex">
                <Card.Text as="div" style={{ fontWeight: 700, color: "#202020ff" }}>
                  <p>{item.minPrice?.toLocaleString()}원 / 박</p>
                </Card.Text>
                <Card.Text as="div">
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















