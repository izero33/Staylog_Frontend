import { Carousel } from "react-bootstrap";
import HomeListSection from "../../domain/home/components/HomeListSection";
import { useCallback, useEffect, useRef, useState } from "react";
import ImageCarousel from "../components/ImageCarousel";

function Home3() {
  // 렌더할 섹션 정의 (원하는 만큼 추가 가능)
  const sections = [
    {
      title: "여기는 부산, 별점순",
      regionCode: "REGION_BUSAN",
      sort: "rating",
      limit: 6, // 각 섹션 내부에서 가져올 개수 (필요시 9~12로 줄이면 더 가벼움)
    },
    {
      title: "여기는 서울, 리뷰많은 순",
      regionCode: "REGION_SEOUL",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국 최신순",
      regionCode: "",
      sort: "latest",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
    {
      title: "전국, 리뷰많은 순",
      regionCode: "",
      sort: "review",
      limit: 6,
    },
  ];

  // 처음엔 3개만 보여주고, 스크롤 내려오면 3개씩 증가
  const [visibleCount, setVisibleCount] = useState(3);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const lockRef = useRef(false); // 연속 발화 


  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {

    const entry = entries[0];
    if (!entry.isIntersecting) return; //화면에 실제로 들어와야
    if (loadingRef.current) return; //증가중이면 막기
    if (visibleCount >= sections.length) return; //더 늘릴거 없으면 막기

    loadingRef.current = true;

    setVisibleCount((prev) => Math.min(prev + 3, sections.length));

    // 이번 교차는 소진: 반드시 한 번 벗어났다 다시 들어올 때만 다음 증가
    const target = entry.target as Element;
    observerRef.current?.unobserve(target);

    // 다음 페인트 + 레이아웃 반영 이후에 락 해제 (요청 연쇄 방지)
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (sentinelRef.current) observerRef.current?.observe(sentinelRef.current);
        loadingRef.current = false;
      }, 200); // 150ms → 300ms
    });
  }, [visibleCount, sections.length]);



  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (lockRef.current) return;
        if (visibleCount >= sections.length) return;

        lockRef.current = true;
        setVisibleCount(prev => Math.min(prev + 3, sections.length));

        // 레이아웃 반영 후 잠깐 쉬고 락 해제
        requestAnimationFrame(() => {
          setTimeout(() => { lockRef.current = false; }, 300);
        });
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [visibleCount, sections.length]);
  return (
    <>
      <div className="ratio mb-3">
        <ImageCarousel
          targetType="HOME"
          targetId={1}
          indicatorType="progressbar"
          aspectRatio="21:9"
          rounded={true}
        />
      </div>

      {/* 현재 visibleCount 만큼만 섹션 렌더 */}
      {sections.slice(0, visibleCount).map((sec, idx) => (
        <HomeListSection
          key={`${sec.title}-${idx}`}
          title={sec.title}
          regionCode={sec.regionCode as any}
          sort={sec.sort as any}
          limit={sec.limit}
        />
      ))}

      {/* 아직 남은 섹션이 있으면 센티넬 노출 */}
      {visibleCount < sections.length && (
        <div
          ref={sentinelRef}
          style={{ height: 1, margin: 0, padding: 0 }}
          aria-hidden
        />
      )}

    </>
  );
}

export default Home3;