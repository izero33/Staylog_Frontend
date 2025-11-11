import { useEffect, useRef, useState, useCallback } from "react";
import api from "../../../global/api";
import type { HomeAccommodationListRequest } from "../types/home";
import type { HomeAccommodationListResponse } from "../types/homeList";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Card } from "react-bootstrap";
import "swiper/css";
import "swiper/css/navigation";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../global/hooks/getImageUrl";
import "../css/HomeListSection.css";

type HomeListSectionProps = HomeAccommodationListRequest & {
  title?: string;
};

function HomeListSection({
  regionCode,
  sort,
  offset = 0,
  limit = 3,
  title,
}: HomeListSectionProps) {
  const [list, setList] = useState<HomeAccommodationListResponse>([]);
  const [pageOffset, setPageOffset] = useState(offset);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const inFlightRef = useRef(false);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const navigate = useNavigate();

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingRef.current = loading; }, [loading]);


  // 별 렌더
  const renderStars = (ratingNum: number = 0) => {
    const full = Math.floor(ratingNum);
    const hasHalf = ratingNum - full >= 0.5;
    return Array.from({ length: 5 }).map((_, index) => {
      if (index < full) return <i key={index} className="bi bi-star-fill me-1" />;
      if (index === full && hasHalf) return <i key={index} className="bi bi-star-half me-1" />;
      return <i key={index} className="bi bi-star me-1" />;
    });
  };

  // 이미지
  const AccommodationImage = ({ id }: { id: number }) => {
    const src = getImageUrl("ACCOMMODATION", id);
    return (
      <Card.Img
        variant="top"
        src={src}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://placehold.co/1200x800/F0F3F7/99AAB5?text=No+Image";
        }}
        style={{ height: 300, objectFit: "cover", width: "100%" }}
        className="border-0"
        loading="lazy"
      />
    );
  };

  const fetchPage = useCallback(
    async (nextOffset: number) => {
      if (loadingRef.current || inFlightRef.current || !hasMoreRef.current) return;

      inFlightRef.current = true;
      setLoading(true);
      try {
        const params = { regionCode, sort, offset: nextOffset, limit };
        const data: HomeAccommodationListResponse = await api.get("v1/home", { params });

        setList(prev => (nextOffset === 0 ? data : [...prev, ...data]));

        if (!Array.isArray(data) || data.length < limit) {
          setHasMore(false); // hasMoreRef는 위 useEffect로 동기화됨
        }
      } catch (err) {
        console.error("Home list fetch error:", err);
      } finally {
        setLoading(false);
        inFlightRef.current = false;
      }
    },
    [regionCode, sort, limit] // ⬅️ 안정적인 의존성만 남김
  );

  // regionCode/sort 바뀌면 리셋 후 1페이지 로드
  useEffect(() => {
    setList([]);
    setPageOffset(0);
    setHasMore(true);
  }, [regionCode, sort, limit]);

  // 오프셋 변경 시 데이터 로드
  useEffect(() => {
    fetchPage(pageOffset);
  }, [pageOffset, fetchPage]);

  
  const handleReachEnd = () => {
    //  스와이퍼 끝에 닿았을 때 다음 페이지 요청 (ref 가드)
    if (inFlightRef.current || !hasMoreRef.current) return;
    setPageOffset(prev => prev + limit);
  }

  return (
    <>
      {title && <h3 className="mb-3">{title}</h3>}
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        navigation
        grabCursor={true}
        slidesPerGroup={3}
        loop={false}
        onReachEnd={handleReachEnd}
        className="mb-5"
        breakpoints={{
          0: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 12 },
          576: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 14 },
          992: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 16 },
        }}
      >
        {list.map((item) => (
          <SwiperSlide key={item.accommodationId}>
            <Card
              className="home-card border-0"
              onClick={() => navigate(`/accommodations/${item.accommodationId}`)}
            >
              <AccommodationImage id={item.accommodationId} />
              <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text as="div">
                  <div className="mb-2" style={{ color: "#ffbe26ff" }}>
                    {renderStars(item.ratingAvg ?? 0)}
                    <span>{item.reviewCnt}</span>
                  </div>
                </Card.Text>
                <div className="d-flex">
                  <Card.Text as="div" style={{ fontWeight: 700, color: "#202020ff" }}>
                    <p>{item.minPrice?.toLocaleString()}원</p>
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

      {/* 간단 로딩/끝 UI (선택) */}
      {/* {loading && <div className="text-muted">불러오는 중…</div>}
      {!hasMore && list.length > 0 && (
        <div className="text-muted">마지막 페이지입니다.</div>
      )} */}
    </>
  );
}

export default HomeListSection;
