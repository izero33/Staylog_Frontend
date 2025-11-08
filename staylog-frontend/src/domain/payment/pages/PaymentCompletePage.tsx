// src/domain/payment/pages/PaymentCompletePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Row, Col, Spinner } from 'react-bootstrap';
import { confirmPayment } from '../api';
import { getBooking } from '../../booking/api';
import type { PaymentResultResponse } from '../types';
import type { BookingDetailResponse } from '../../booking/types';
import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';

function PaymentCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<PaymentResultResponse | null>(null);
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CommonCodes에서 결제 상태 및 결제 수단 코드 가져오기
  const paymentStatusCodes = useCommonCodeSelector('paymentStatus');
  const paymentMethodCodes = useCommonCodeSelector('paymentMethods');

  //  Hash Router 호환: URL 파라미터 파싱
  // Toss는 successUrl에 쿼리를 붙이는데, Hash Router에서는 # 앞이나 뒤에 올 수 있음
  const getUrlParams = () => {
    // 1. useSearchParams로 시도 (# 뒤에 쿼리가 있는 경우)
    let paymentKey = searchParams.get('paymentKey');
    let orderId = searchParams.get('orderId');
    let amount = searchParams.get('amount');

    // 2. 못 찾으면 window.location.search에서 시도 (# 앞에 쿼리가 있는 경우)
    if (!paymentKey || !orderId || !amount) {
      const params = new URLSearchParams(window.location.search);
      paymentKey = params.get('paymentKey');
      orderId = params.get('orderId');
      amount = params.get('amount');
    }

    console.log('[결제 완료 페이지] URL 파라미터:', { paymentKey, orderId, amount });
    console.log('[결제 완료 페이지] window.location.href:', window.location.href);

    return { paymentKey, orderId, amount };
  };

  const { paymentKey, orderId, amount } = getUrlParams();

  useEffect(() => {
    const processPayment = async () => {
      // 필수 파라미터 검증
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 결제 승인 API 호출
        const result = await confirmPayment({
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        setPaymentResult(result);

        // 예약 정보 조회 (orderId에서 bookingId 추출 필요)
        // orderId 형식이 "ORDER_{timestamp}_{uuid}" 라고 가정
        // 백엔드에서 bookingNum으로 예약을 조회할 수 있도록 해야 함
        // 임시로 bookingId는 result에서 가져올 수 있다고 가정
        // 실제로는 confirmPayment 응답에 bookingId가 포함되어야 함

        // 예약 정보를 가져오기 위해 임시로 사용
        // TODO: 백엔드 API에서 orderId로 예약 조회 엔드포인트 추가 필요
        // const bookingData = await getBookingByOrderId(orderId);
        // setBooking(bookingData);

      } catch (err: any) {
        console.error('결제 승인 실패:', err);
        console.error('에러 응답 데이터:', err.response?.data);

        const errorMessage = err.response?.data?.message || '결제 승인에 실패했습니다.';
        const errorCode = err.response?.data?.code;

        setError(`${errorMessage}${errorCode ? ` (코드: ${errorCode})` : ''}`);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [paymentKey, orderId, amount]);

  // 로딩 중
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-3">결제 처리 중...</p>
      </Container>
    );
  }

  // 결제 성공 여부 확인 (CommonCodes 기반)
  const isPaid = paymentResult?.paymentStatus &&
    paymentStatusCodes.some(code =>
      code.codeId === paymentResult.paymentStatus &&
      (code.codeId === 'PAY_PAID' || code.codeName.includes('결제완료'))
    );
  console.log('결제 결과 : ', paymentStatusCodes);
  console.log('결제 결과 : ', paymentResult?.paymentStatus);
  console.log("isPaid :", isPaid);

  // 에러 발생 또는 결제 실패
  if (error || !paymentResult || !isPaid) {
    return (
      <Container className="my-5">
        <Card className="text-center">
          <Card.Body className="py-5">
            <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
            <h2 className="mt-4">결제 실패</h2>
            <p className="text-muted mt-3">
              {error || paymentResult?.failureReason || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
              홈으로
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // 결제 성공
  return (
    <Container className="my-5">
      <Card>
        <Card.Body className="p-4">
          {/* 제목 */}
          <h2 className="text-center mb-4">결제가 완료되었습니다.</h2>

          {/* 예약자 성함 */}
          <div className="mb-4 text-center">
            <h5>예약자 성함: <span className="fw-bold">{booking?.guestName || '테스트1'}</span></h5>
          </div>

          {/* 예약 정보 카드 */}
          <Card className="mb-4 border">
            <Card.Body>
              <Row className="mb-3">
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>체크인:</strong> {booking?.checkIn || '2025년 11월 07일'}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>체크아웃:</strong> {booking?.checkOut || '2025년 11월 11일'}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>숙소명:</strong> {booking?.accommodationName || '신비호텔'}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="mb-2">
                    <strong>객실명:</strong> {booking?.roomName || 'Panorama spa'}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>성인:</strong> {booking?.adults || 2}
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>아이:</strong> {booking?.children || 0}
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="mb-2">
                    <strong>영유아:</strong> {booking?.infants || 0}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <div className="mb-2">
                    <strong>총 인원:</strong> {booking?.totalGuestCount || 2}
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <div className="mb-2">
                    <strong>추가 침대:</strong> 0 / 유아침대: 0
                  </div>
                </Col>
              </Row>

              <Row>
                <Col>
                  <div>
                    <strong>고객 요청사항:</strong>
                    <div className="border rounded p-2 mt-2 bg-light">
                      null
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* 결제 정보 */}
          <Card className="mb-4 border">
            <Card.Body>
              <div className="mb-3">
                <strong>결제 수단:</strong>{' '}
                {paymentMethodCodes.find(code => code.codeId === paymentResult.method)?.codeName || paymentResult.method}
              </div>
              <div className="mb-3">
                <strong>최종 결제 금액:</strong>{' '}
                <span className="text-primary fs-5 fw-bold">
                  {paymentResult.amount.toLocaleString()}원
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* 버튼 */}
          <Row className="mt-4">
            <Col xs={6}>
              <Button
                variant="dark"
                size="lg"
                className="w-100"
                onClick={() => navigate('/')}
              >
                홈으로
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={() => navigate('/mypage/reservations')}
              >
                예약내역
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PaymentCompletePage;
