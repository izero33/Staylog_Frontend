import React from 'react';
// 💡 Button 추가
import { Badge, Card, Col, Row, Button } from "react-bootstrap";
import { format, differenceInDays } from 'date-fns';
import type { couponType } from '../types/couponTypes';

// 부모로부터 받을 props 인터페이스
interface CouponCardProps {
   coupon: couponType;
   mode: 'coupon-view' | 'coupon-select' | undefined;
   onSelect?: (coupon: couponType) => void; // 💡 onSelect 추가 (optional)
}

function AvailableCouponCard({ coupon, mode, onSelect }: CouponCardProps) {
   
   // D-day 계산
   const today = new Date();
   const expiryDate = new Date(coupon.expiredAt);
   const dDay = differenceInDays(expiryDate, today);

   // D-day 뱃지 색상 결정
   const dDayBadge = dDay <= 7 ? "danger" : "warning";
   const dDayText = dDay < 0 ? '만료' : (dDay === 0 ? 'D-DAY' : `D-${dDay}`);

   const discountColor = "text-primary";

   return (
      <Card className="mb-3 shadow-sm coupon-card available">
         <Card.Body>
            <Row className="align-items-center">
               {/* 왼쪽: 할인율 */}
               <Col xs={3} className="text-center border-end border-dashed">
                  <h2 className={`fw-bold ${discountColor} mb-0`}>
                     {coupon.discount}
                     <span className="fs-5">%</span>
                  </h2>
                  <Badge bg={dDayBadge} pill>{dDayText}</Badge>
               </Col>

               {/* 오른쪽: 쿠폰 상세 */}
               <Col xs={9}>
                  <Card.Title className="fw-bold mb-1 fs-6">{coupon.name}</Card.Title>
                  <Card.Text as="small" className="text-muted">
                     <i className="bi bi-calendar-check"></i>
                     {format(expiryDate, 'yyyy. MM. dd')} 까지
                  </Card.Text>

                  {/* 💡 
                            mode가 'select'이고 onSelect 함수가 존재할 때만 
                            "사용하기" 버튼을 렌더링합니다.
                        */}
                  {mode === 'coupon-select' && onSelect && (
                     <div className="text-end mt-2">
                        <Button
                           variant="primary"
                           size="sm"
                           onClick={() => onSelect(coupon)} // 💡 클릭 시 onSelect 호출
                        >
                           <i className="bi bi-check-circle"></i> 사용하기
                        </Button>
                     </div>
                  )}
               </Col>
            </Row>
         </Card.Body>
      </Card>
   );
}

export default AvailableCouponCard;