import {
   Container,
   Row,
   Col,
   Form,
   Button,
   Card,
   ListGroup,
   InputGroup // 쿠폰 버튼을 위해 추가
} from 'react-bootstrap';
import Modal from '../../../global/components/Modal';
import type { ModalMode } from '../../../global/types';
import { useModal } from '../../../global/hooks/useModal';
import { useEffect, useState } from 'react';
import type { couponType } from '../../mypage/types/couponTypes';
import { useLocation, useNavigate } from 'react-router-dom';
import type { BookingDetailResponse } from '../../booking/types';
import { preparePayment } from '../api';
import type { PreparePaymentRequest } from '../types';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import useGetNicknameFromToken from '../../auth/hooks/useGetNicknameFromToken';
import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';

/**
 * 백엔드 결제 수단 코드를 Toss Payments SDK v1 결제 수단으로 매핑
 *
 * ⚠️ 중요: Toss Payments SDK v1은 한글 결제 수단명을 사용합니다!
 * https://docs.tosspayments.com/guides/v1/payment-widget
 *
 * @param method - 백엔드 결제 수단 코드 (PAY_CARD, PAY_VIRTUAL_ACCOUNT, PAY_BANK_TRANSFER, PAY_KAKAOPAY 등)
 * @returns Toss Payments SDK v1 결제 수단 ('카드', '가상계좌', '계좌이체', '휴대폰', '간편결제')
 */
function mapPaymentMethodToToss(method: string): string {
   const mapping: Record<string, string> = {
      'PAY_CARD': '카드',                    // 신용/체크카드
      'PAY_VIRTUAL_ACCOUNT': '가상계좌',      // 가상계좌
      'PAY_BANK_TRANSFER': '계좌이체',        // 계좌이체
      'PAY_KAKAOPAY': '카카오페이',            // 간편결제
      'PAY_NAVERPAY': '네이버페이',            // 간편결제
      'PAY_TOSS': '토스페이',                  // 간편결제
      'PAY_EASY': '간편결제',                 // 간편결제 (일반)
      'PAY_MOBILE': '휴대폰',                 // 휴대폰결제
   };
   return mapping[method] || '카드'; // 기본값: 카드
}

function CheckoutForm() {
   const location = useLocation();
   const navigate = useNavigate();
   const nickname = useGetNicknameFromToken();

   // location state에서 예약 정보 받기
   const booking = location.state?.booking as BookingDetailResponse | undefined;

   // CommonCodes에서 결제 수단 목록 가져오기
   const paymentMethodCodes = useCommonCodeSelector('paymentMethods');

   const {isModalOpen, modalMode, openModal, closeModal} = useModal<ModalMode>('none')

   const [couponInfo, setCouponInfo] = useState<couponType | null>(null)
   const [paymentMethod, setPaymentMethod] = useState<string>('PAY_CARD'); // 결제 수단
   const [isProcessing, setIsProcessing] = useState(false); // 결제 처리 중

   // 🆕 URL 파라미터로 전달된 결제 실패 정보 확인
   useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const errorCode = searchParams.get('code');
      const errorMessage = searchParams.get('message');

      if (errorCode && errorMessage) {
         alert(`결제 실패\n에러 코드: ${errorCode}\n메시지: ${decodeURIComponent(errorMessage)}`);
         console.error('[결제 실패]', { errorCode, errorMessage: decodeURIComponent(errorMessage) });

         // URL에서 에러 파라미터 제거 (다시 alert가 뜨지 않도록)
         window.history.replaceState({}, '', window.location.pathname + window.location.hash.split('?')[0]);
      }
   }, []);

   function handleApplyCoupon(coupon: couponType) {
      setCouponInfo(coupon); // 쿠폰 정보 state 설정
      closeModal();          // 로직 처리 후 모달 닫기
   }

   useEffect(() => {
      // couponInfo가 들어오는지 확인
      console.log(couponInfo);

   }, [couponInfo])

   // 예약 정보가 없으면 홈으로 리다이렉트
   useEffect(() => {
      if (!booking) {
         alert('예약 정보가 없습니다.');
         navigate('/');
      }
   }, [booking, navigate]);

   // 쿠폰 할인 계산
   const discountAmount = couponInfo ? Math.round(booking!.amount * couponInfo.discount / 100) : 0;
   const finalAmount = booking ? booking.amount - discountAmount : 0;

   // 결제 처리 핸들러
   const handlePayment = async () => {
      if (!booking) return;

      setIsProcessing(true);
      try {
         console.log('[결제 시작]', {
            bookingId: booking.bookingId,
            paymentMethod,
            amount: booking.amount,
            couponId: couponInfo?.couponId,
            discountAmount,
            finalAmount,
         });

         // 결제 준비 요청
         const request: PreparePaymentRequest = {
            bookingId: booking.bookingId,
            method: paymentMethod,
            amount: booking.amount, // 할인 전 금액
            couponId: couponInfo?.couponId,
         };

         console.log('[API 요청] /v1/payments/prepare', request);

         const prepareResponse = await preparePayment(request);

         console.log('[API 응답] /v1/payments/prepare', prepareResponse);

         // Toss SDK 연동
         // @ts-ignore
         const tossPayments = window.TossPayments || null;

         if (!tossPayments) {
            alert('결제 모듈 로딩 실패. 페이지를 새로고침해주세요.');
            setIsProcessing(false);
            return;
         }

         console.log('[Toss SDK] TossPayments 로드 완료');

         // Toss Payments 초기화
         const toss = tossPayments(prepareResponse.clientKey);

         console.log('[Toss SDK] 초기화 완료, clientKey:', prepareResponse.clientKey?.substring(0, 20) + '...');

         // 백엔드 결제 수단 코드를 Toss API 형식으로 변환
         const tossPaymentMethod = mapPaymentMethodToToss(paymentMethod);

         // 결제 요청 옵션 구성
         const paymentOptions: any = {
            amount: prepareResponse.amount, // 백엔드가 계산한 최종 금액 (쿠폰 할인 적용 후)
            orderId: prepareResponse.orderId,
            orderName: `${booking.accommodationName} - ${booking.roomName}`,
            customerName: prepareResponse.customerName,
            successUrl: `${window.location.origin}/#/payment/complete`,
            failUrl: `${window.location.origin}/#/checkout`,
         };

         // 가상계좌인 경우 추가 옵션
         if (paymentMethod === 'PAY_VIRTUAL_ACCOUNT') {
            paymentOptions.validHours = 24; // 입금 유효 시간 (24시간)
         }

         console.log('[Toss SDK] requestPayment 호출', {
            method: tossPaymentMethod,
            options: paymentOptions,
         });

         // 결제 수단에 따라 Toss Payments API 호출
         await toss.requestPayment(tossPaymentMethod, paymentOptions);

         console.log('[Toss SDK] requestPayment 완료 (successUrl로 리다이렉트됨)');

      } catch (error: any) {
         console.error('[결제 실패]', error);
         console.error('[에러 상세]', {
            message: error?.message,
            code: error?.code,
            response: error?.response?.data,
         });
         alert(`결제 준비에 실패했습니다.\n\n에러: ${error?.message || '알 수 없는 오류'}`);
      } finally {
         setIsProcessing(false);
      }
   };

   if (!booking) {
      return null;
   }

   return (
      <Container className="my-5">
         <h1 className="mb-4 h2">예약 확인 및 결제</h1>

         <Row>
            <Col lg={7}>
               {/* ----- 예약자 정보 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">예약자 정보</Card.Header>
                  <Card.Body>
                     <Form>
                        <Form.Group as={Row} className="mb-3" controlId="formBookerName">
                           <Form.Label column sm={3}>
                              예약자명
                           </Form.Label>
                           <Col sm={9}>
                              <Form.Control type="text" value={booking.guestName || nickname} readOnly />
                           </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formBookerPhone">
                           <Form.Label column sm={3}>
                              휴대폰 번호
                           </Form.Label>
                           <Col sm={9}>
                              <Form.Control type="tel" placeholder="'-' 없이 입력" />
                           </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3" controlId="formBookerEmail">
                           <Form.Label column sm={3}>
                              이메일
                           </Form.Label>
                           <Col sm={9}>
                              <Form.Control type="email" placeholder="example@google.com" />
                           </Col>
                        </Form.Group>
                     </Form>
                  </Card.Body>
               </Card>

               {/* ----- 결제 수단 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">결제 수단</Card.Header>
                  <Card.Body>
                     <Form>
                        <div className="d-flex gap-3 flex-wrap">
                           {paymentMethodCodes.length > 0 ? (
                              // CommonCodes에서 로드된 결제 수단 표시 (주요 수단만 필터링)
                              paymentMethodCodes
                                 .filter(code => ['PAY_CARD', 'PAY_BANK_TRANSFER', 'PAY_VIRTUAL_ACCOUNT', 'PAY_KAKAOPAY', 'PAY_NAVERPAY', 'PAY_TOSS'].includes(code.codeId))
                                 .map(code => (
                                    <Form.Check
                                       key={code.codeId}
                                       type="radio"
                                       id={`payment-${code.codeId.toLowerCase()}`}
                                       name="paymentMethod"
                                       label={code.codeName}
                                       checked={paymentMethod === code.codeId}
                                       onChange={() => setPaymentMethod(code.codeId)}
                                    />
                                 ))
                           ) : (
                              // Fallback: CommonCodes 로딩 전 기본 옵션
                              <>
                                 <Form.Check
                                    type="radio"
                                    id="payment-card"
                                    name="paymentMethod"
                                    label="신용/체크카드"
                                    checked={paymentMethod === 'PAY_CARD'}
                                    onChange={() => setPaymentMethod('PAY_CARD')}
                                 />
                                 <Form.Check
                                    type="radio"
                                    id="payment-transfer"
                                    name="paymentMethod"
                                    label="계좌이체"
                                    checked={paymentMethod === 'PAY_BANK_TRANSFER'}
                                    onChange={() => setPaymentMethod('PAY_BANK_TRANSFER')}
                                 />
                                 <Form.Check
                                    type="radio"
                                    id="payment-virtual"
                                    name="paymentMethod"
                                    label="가상계좌"
                                    checked={paymentMethod === 'PAY_VIRTUAL_ACCOUNT'}
                                    onChange={() => setPaymentMethod('PAY_VIRTUAL_ACCOUNT')}
                                 />
                              </>
                           )}
                        </div>
                     </Form>
                  </Card.Body>
               </Card>

               {/* ----- 약관 동의 ----- */}
               <Card className="mb-4">
                  <Card.Header as="h5">약관 동의</Card.Header>
                  <Card.Body>
                     <Form.Check
                        type="checkbox"
                        id="terms-all"
                        label="전체 동의"
                        className="fw-bold mb-2"
                     />
                     <hr />
                     <Form.Check
                        type="checkbox"
                        id="terms-1"
                        label="숙소 이용규칙 및 취소/환불 규정 동의 (필수)"
                        className="mb-2"
                     />
                     <Form.Check
                        type="checkbox"
                        id="terms-2"
                        label="개인정보 수집 및 이용 동의 (필수)"
                        className="mb-2"
                     />
                     <Form.Check
                        type="checkbox"
                        id="terms-3"
                        label="마케팅 정보 수신 동의 (선택)"
                     />
                  </Card.Body>
               </Card>
            </Col>



            <Col lg={5}>
               {/* ----- 예약 숙소 정보 ----- */}
               <Card className="mb-4 position-sticky" style={{ top: '20px' }}>
                  <Card.Header as="h5">예약 숙소</Card.Header>
                  <Card.Body>
                     <Card.Title>{booking.accommodationName}</Card.Title>
                     <Card.Text>
                        {booking.roomName} ({booking.totalGuestCount}인 기준)
                     </Card.Text>
                     <Card.Text className="text-muted">
                        {booking.checkIn} - {booking.checkOut}
                     </Card.Text>
                  </Card.Body>

                  <ListGroup variant="flush">
                     {/* ----- 결제 금액 ----- */}
                     <ListGroup.Item>
                        <h5 className="mb-3">결제 금액</h5>
                        <div className="d-flex justify-content-between mb-2">
                           <span>총 숙박 금액</span>
                           <span>{booking.amount.toLocaleString()}원</span>
                        </div>

                        {/* ----- 쿠폰 사용 ----- */}
                        <div className="d-flex justify-content-between mb-2">
                           <span>쿠폰 할인</span>
                           <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => openModal('coupon')}
                           >
                              쿠폰 사용
                           </Button>
                        </div>

                        {/* 쿠폰 적용 시 보일 UI */}
                        {couponInfo && (
                           <div className="d-flex justify-content-between mb-2 text-danger">
                              <span className="ms-3">ㄴ {couponInfo.name}</span>
                              <span>-{discountAmount.toLocaleString()}원</span>
                           </div>
                        )}

                        <div className="d-flex justify-content-between mb-3">
                           <span>수수료</span>
                           <span>0원</span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between fw-bold h5">
                           <span>최종 결제 금액</span>
                           <span>{finalAmount.toLocaleString()}원</span>
                        </div>
                     </ListGroup.Item>

                     {/* ----- 최종 결제 버튼 ----- */}
                     <ListGroup.Item>
                        <Button
                           variant="primary"
                           size="lg"
                           className="w-100"
                           onClick={handlePayment}
                           disabled={isProcessing}
                        >
                           {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
                        </Button>
                     </ListGroup.Item>
                  </ListGroup>
               </Card>
            </Col>
         </Row>

         {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} 
            onUseCoupon={handleApplyCoupon}
            />
        }
      </Container>
   );
}

export default CheckoutForm;