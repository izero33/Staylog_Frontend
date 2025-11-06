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

function CheckoutForm() {

   const {isModalOpen, modalMode, openModal, closeModal} = useModal<ModalMode>('none')

   const [couponInfo, setCouponInfo] = useState<couponType | null>(null)

   function handleApplyCoupon(coupon: couponType) {
      setCouponInfo(coupon); // 쿠폰 정보 state 설정
      closeModal();          // 로직 처리 후 모달 닫기
   }

   useEffect(() => {
      // couponInfo가 들어오는지 확인
      console.log(couponInfo);
      
   }, [couponInfo])

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
                              <Form.Control type="text" defaultValue="김개발" readOnly />
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
                        <div className="d-flex gap-3">
                           <Form.Check
                              type="radio"
                              id="payment-card"
                              name="paymentMethod"
                              label="신용/체크카드"
                              defaultChecked
                           />
                           <Form.Check
                              type="radio"
                              id="payment-transfer"
                              name="paymentMethod"
                              label="무통장 입금"
                           />
                           <Form.Check
                              type="radio"
                              id="payment-simple"
                              name="paymentMethod"
                              label="간편 결제"
                           />
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
                     <Card.Title>제주 오션뷰 펜션</Card.Title>
                     <Card.Text>
                        디럭스 오션뷰 (2인 기준)
                     </Card.Text>
                     <Card.Text className="text-muted">
                        2025. 12. 24. (수) - 2025. 12. 26. (금) · 2박
                     </Card.Text>
                  </Card.Body>

                  <ListGroup variant="flush">
                     {/* ----- 결제 금액 ----- */}
                     <ListGroup.Item>
                        <h5 className="mb-3">결제 금액</h5>
                        <div className="d-flex justify-content-between mb-2">
                           <span>총 숙박 금액</span>
                           <span>400,000원</span>
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

                        {/* 쿠폰 적용 시 보일 UI (주석 처리) */}
                        {/* <div className="d-flex justify-content-between mb-2 text-danger">
                  <span className="ms-3">ㄴ 10% 할인 쿠폰</span>
                  <span>-40,000원</span>
                </div>
                */}

                        <div className="d-flex justify-content-between mb-3">
                           <span>수수료</span>
                           <span>0원</span>
                        </div>

                        <hr />

                        <div className="d-flex justify-content-between fw-bold h5">
                           <span>최종 결제 금액</span>
                           <span>360,000원</span>
                        </div>
                     </ListGroup.Item>

                     {/* ----- 최종 결제 버튼 ----- */}
                     <ListGroup.Item>
                        <Button variant="primary" size="lg" className="w-100">
                           360,000원 결제하기
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