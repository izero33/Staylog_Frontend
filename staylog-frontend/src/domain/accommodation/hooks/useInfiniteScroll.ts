import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  threshold?: number; // 0.0 ~ 1.0, 요소가 얼마나 보일 때 트리거할지
}

/**
 * 무한 스크롤을 위한 커스텀 훅
 * Intersection Observer API를 사용하여 타겟 요소가 뷰포트에 들어올 때 콜백 실행
 */
function useInfiniteScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 1.0
}: UseInfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;

      // 타겟이 보이고, 로딩 중이 아니며, 더 불러올 데이터가 있을 때 실행
      if (target.isIntersecting && !loading && hasMore) {
        onLoadMore();
      }
    },
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    // Intersection Observer 생성
    const option = {
      root: null, // 뷰포트를 root로 사용
      rootMargin: '0px',
      threshold,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    // 타겟 요소 관찰 시작
    const currentTarget = targetRef.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    // 클린업
    return () => {
      if (observerRef.current && currentTarget) {
        observerRef.current.unobserve(currentTarget);
      }
    };
  }, [handleObserver, threshold]);

  return targetRef;
}

export default useInfiniteScroll;
