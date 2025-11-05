import React from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { format } from 'date-fns';
import type { couponType } from '../types/couponTypes';

// 부모로부터 coupon 객체를 props로 받기 위한 인터페이스
interface CouponCardProps {
   coupon: couponType;
}

function UnavailableCouponCard({ coupon }: CouponCardProps) {

   const isActuallyUsed = coupon.isUsed === 'Y';
   const badgeBg = isActuallyUsed ? "secondary" : "dark";
   const badgeText = isActuallyUsed ? "사용완료" : "기간만료";

   const dateText = isActuallyUsed && coupon.usedAt
      ? `${format(new Date(coupon.usedAt), 'yyyy. MM. dd')} 사용`
      : `${format(new Date(coupon.expiredAt), 'yyyy. MM. dd')} 만료`;

   const cardClass = isActuallyUsed ? "used" : "expired";

   return (
      <Card className={`mb-3 shadow-sm coupon-card ${cardClass}`}>
         <Card.Body className="text-muted">
            <Row className="align-items-center">
               <Col xs={3} className="text-center border-end border-dashed">
                  <Badge bg={badgeBg} className="mb-2">{badgeText}</Badge>
                  <h2 className="fw-bold mb-0">
                     {coupon.discount}
                     <span className="fs-5">%</span>
                  </h2>
               </Col>
               <Col xs={9}>
                  <Card.Title className="fw-bold mb-1 fs-6">{coupon.name}</Card.Title>
                  <Card.Text as="small" className="text-muted">
                     <i className="bi bi-calendar-check"></i> {dateText}
                  </Card.Text>
               </Col>
            </Row>
         </Card.Body>
      </Card>
   );
}

export default UnavailableCouponCard;