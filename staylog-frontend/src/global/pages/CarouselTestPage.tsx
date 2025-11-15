import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import ImageCarousel from '../components/ImageCarousel'; // ImageCarousel 컴포넌트 import

const CarouselTestPage: React.FC = () => {
  const [targetType, setTargetType] = useState<string>('ACCOMMODATION');
  const [targetId, setTargetId] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '21:9' | '4:3' | '1:1'>('16:9');
  const [width, setWidth] = useState<string>('100%');
  const [rounded, setRounded] = useState<boolean>(false);
  const [indicatorType, setIndicatorType] = useState<'progressbar' | 'numbers-only'>('progressbar'); // 'dots' 제거
  const [arrowsOnHover, setArrowsOnHover] = useState<boolean>(false);

  // ImageCarousel에 실제로 전달될 props 상태
  const [carouselProps, setCarouselProps] = useState<{
    targetType: string;
    targetId: number;
    aspectRatio: '16:9' | '21:9' | '4:3' | '1:1';
    width: string;
    rounded: boolean;
    indicatorType: 'progressbar' | 'numbers-only'; // 'dots' 제거
    arrowsOnHover: boolean;
  } | null>(null);

  const handleLoadCarousel = () => {
    if (!targetType || !targetId) {
      alert('Target Type과 Target ID를 입력해주세요.');
      return;
    }
    setCarouselProps({ targetType, targetId, aspectRatio, width, rounded, indicatorType, arrowsOnHover });
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">캐러셀 테스트</h2>

      <Form className="mb-5 p-4 border rounded-3 bg-light">
        {/* ... Target Type, Target ID ... */}
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formTargetType">
            <Form.Label>Target Type</Form.Label>
            <Form.Control
              type="text"
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              placeholder="예: ACCOMMODATION, ROOM, BOARD"
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formTargetId">
            <Form.Label>Target ID</Form.Label>
            <Form.Control
              type="number"
              value={targetId}
              onChange={(e) => setTargetId(Number(e.target.value))}
              placeholder="예: 1, 2, 3"
            />
          </Form.Group>
        </Row>

        {/* ... Aspect Ratio, Width ... */}
        <Row className="mb-3">
          <Form.Group as={Col} controlId="formAspectRatio">
            <Form.Label>비율</Form.Label>
            <Form.Select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as '16:9' | '21:9' | '4:3' | '1:1')}
            >
              <option value="16:9">16:9</option>
              <option value="21:9">21:9</option>
              <option value="4:3">4:3</option>
              <option value="1:1">1:1</option>
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} controlId="formWidth">
            <Form.Label>가로 폭</Form.Label>
            <Form.Control
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="예: 100%, 500px"
            />
          </Form.Group>
        </Row>

        {/* ... Rounded, Indicator Type, Arrows on Hover ... */}
        <Row className="mb-3">
          <Form.Group as={Col} xs="auto" className="d-flex align-items-center" controlId="formRounded">
            <Form.Check
              type="checkbox"
              label="모서리 둥글게"
              checked={rounded}
              onChange={(e) => setRounded(e.target.checked)}
            />
          </Form.Group>

          <Form.Group as={Col} controlId="formIndicatorType">
            <Form.Label>인디케이터 타입</Form.Label>
            <Form.Select
              value={indicatorType}
              onChange={(e) => setIndicatorType(e.target.value as 'progressbar' | 'numbers-only')}
            >
              <option value="progressbar">진행바</option>
              <option value="numbers-only">숫자만 + 더보기 버튼</option>
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} xs="auto" className="d-flex align-items-center" controlId="formArrowsOnHover">
            <Form.Check
              type="checkbox"
              label="마우스 호버시에만 화살표 표시"
              checked={arrowsOnHover}
              onChange={(e) => setArrowsOnHover(e.target.checked)}
            />
          </Form.Group>
        </Row>

        <Button variant="primary" onClick={handleLoadCarousel}>
          캐러셀 불러오기
        </Button>
      </Form>

      {carouselProps && (
        <div className="mt-5">
          <h3>렌더링된 캐러셀</h3>
          <ImageCarousel
            targetType={carouselProps.targetType}
            targetId={carouselProps.targetId}
            aspectRatio={carouselProps.aspectRatio}
            width={carouselProps.width}
            rounded={carouselProps.rounded}
            indicatorType={carouselProps.indicatorType}
            arrowsOnHover={carouselProps.arrowsOnHover}
          />
        </div>
      )}
    </Container>
  );
};

export default CarouselTestPage;