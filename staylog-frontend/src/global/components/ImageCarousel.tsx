import React, { useState, useEffect } from 'react';
import { Carousel, Modal, CloseButton } from 'react-bootstrap';
import { fetchImagesByTarget } from '../api/imageApi';
import type { ImageData } from '../types/image';
import '../css/ImageCarousel.css';
import useMediaQuery from '../hooks/useMediaQuery';

interface ImageCarouselProps {
  targetType: string;
  targetId: number;
  aspectRatio?: '16:9' | '21:9' | '4:3' | '1:1';
  width?: string;
  rounded?: boolean;
  indicatorType?: 'progressbar' | 'numbers-only';
  arrowsOnHover?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  targetType,
  targetId,
  aspectRatio = '16:9',
  width = '100%',
  rounded = false,
  indicatorType = 'progressbar',
  arrowsOnHover = false,
}) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // 메인 캐러셀 인덱스
  const [modalActiveIndex, setModalActiveIndex] = useState(0); // 모달 캐러셀 인덱스

  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        const response = await fetchImagesByTarget(targetType, targetId);
        setImages(response.images);
      } catch (err) {
        setError('이미지를 불러오는 데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (targetId) {
      loadImages();
    }
  }, [targetType, targetId]);

  const openModal = (index: number) => {
    setActiveIndex(index); // 메인 캐러셀 인덱스도 동기화 (선택 사항)
    setModalActiveIndex(index); // 모달 캐러셀 인덱스 설정
    setShowModal(true);
  };

  const handleModalClose = () => setShowModal(false);

  const handleCarouselItemClick = (index: number) => {
    if (indicatorType !== 'numbers-only') {
      openModal(index);
    }
  };

  const getDynamicAspectRatioClass = () => {
    if (isMobile) {
      return 'aspect-ratio-1-1';
    } 
    else if (isTablet) {
      if (aspectRatio === '1:1' || aspectRatio === '4:3') {
        return `aspect-ratio-${aspectRatio.replace(':', '-')}`;
      }
      return 'aspect-ratio-16-9';
    }
    
    return `aspect-ratio-${aspectRatio.replace(':', '-')}`;
  };

  if (loading) {
    return <div>Loading images...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (images.length === 0) {
    return <div>No images found.</div>;
  }

  return (
    <>
      <div 
        style={{ width }} 
        className={`position-relative ${arrowsOnHover ? 'arrows-on-hover' : ''}`}
      >
        <div className={rounded ? 'carousel-rounded-lg overflow-hidden' : ''}>
          <Carousel
            indicators={false}
            activeIndex={activeIndex}
            onSelect={(selectedIndex) => setActiveIndex(selectedIndex)}
          >
            {images.map((image, index) => (
              <Carousel.Item 
                key={image.imageId} 
                onClick={() => handleCarouselItemClick(index)} 
                style={{ cursor: indicatorType !== 'numbers-only' ? 'pointer' : 'default' }}
              >
                <div className={`carousel-image-wrapper ${getDynamicAspectRatioClass()}`}>
                  <img
                    className="d-block w-100 h-100"
                    src={image.imageUrl}
                    alt={image.originalName || `Slide ${index + 1}`}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        {/* 진행 바 + 숫자 인디케이터 */}
        {indicatorType === 'progressbar' && images.length > 0 && (
          <div className="carousel-progressbar-container">
            <div className="carousel-progressbar-track">
              <div
                className="carousel-progressbar-bar"
                style={{ width: `${((activeIndex + 1) / images.length) * 100}%` }}
              />
            </div>
            <div className="carousel-progressbar-numbers">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        )}

        {/* 숫자만 + 더보기 버튼 인디케이터 */}
        {indicatorType === 'numbers-only' && images.length > 0 && (
          <div className="carousel-numbers-only-container">
            <span className="carousel-numbers-only-text">
              {activeIndex + 1} / {images.length}
            </span>
            <span className="carousel-numbers-only-divider">|</span>
            <button 
              className="carousel-view-more-btn" 
              onClick={() => openModal(activeIndex)}
            >
              더보기
            </button>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={handleModalClose} size="xl" centered>
        <Modal.Body className="p-0 position-relative"> 
          <CloseButton 
            variant="white" 
            onClick={handleModalClose} 
            className="modal-close-button" 
          />

          <Carousel 
            activeIndex={modalActiveIndex} // modalActiveIndex 사용
            onSelect={(selectedIndex) => setModalActiveIndex(selectedIndex)} // setModalActiveIndex 사용
            interval={null}
            indicators={false}
          >
            {images.map((image, index) => (
              <Carousel.Item key={image.imageId}>
                <img
                  className="d-block w-100"
                  src={image.imageUrl}
                  alt={image.originalName || `Slide ${index + 1}`}
                  style={{ maxHeight: '90vh', objectFit: 'contain' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>

          {/* 모달 내부 숫자 인디케이터 */}
          {images.length > 0 && (
            <div className="modal-carousel-indicators">
              {modalActiveIndex + 1} / {images.length} {/* modalActiveIndex 사용 */}
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ImageCarousel;