import { useEffect, useState } from 'react';
import { Tabs, Tab, Alert, Badge } from 'react-bootstrap';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import api from '../../../global/api';
import AvailableCouponCard from '../components/availableCouponCard';
import UnavailableCouponCard from '../components/UnavailableCouponCard';
import type { couponType } from '../types/couponTypes';
// 💡 공통 타입 import

interface CouponFormProps {
   onClose?: () => void; // 모달 닫기 콜백
   // 💡 'view': 마이페이지(조회), 'select': 결제창(선택)
   mode?: 'coupon-view' | 'coupon-select';
   // 💡 쿠폰 선택 시 부모에게 선택된 쿠폰 정보를 전달할 콜백
   onSelect?: (coupon: couponType) => void;
}

// 💡 props에 mode와 onSelect 추가, mode의 기본값은 'view'
function CouponForm({ onClose, mode, onSelect }: CouponFormProps) {
   
   const userId = useGetUserIdFromToken();

   const [availableCoupon, setAvailableCoupon] = useState<couponType[]>([]);
   const [unavailableCoupon, setUnavailableCoupon] = useState<couponType[]>([]);

   // 쿠폰 목록 조회
   useEffect(() => {
      if (!userId) {
         return;
      }
      (async () => {
         try {
            const availableResponse = await api.get<couponType[]>(`v1/coupon/${userId}/available`);
            setAvailableCoupon(availableResponse);

            const unavailableResponse = await api.get<couponType[]>(`v1/coupon/${userId}/unavailable`);
            setUnavailableCoupon(unavailableResponse);
         } catch (err) {
            console.log(err);
         }
      })()
   }, [userId]);


   return (
      <div className="coupon-container p-3" style={{ backgroundColor: '#f8f9fa' }}>

         <Tabs defaultActiveKey="available" id="coupon-tabs" className="mb-3" fill>

            {/* 1. 사용 가능 쿠폰 탭 */}
            <Tab
               eventKey="available"
               title={
                  <span>
                     <i className="bi bi-ticket-perforated"></i> 사용 가능 쿠폰{' '}
                     <Badge pill bg="primary">{availableCoupon.length}</Badge>
                  </span>
               }
            >
               <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {availableCoupon.length === 0 ? (
                     <Alert variant="secondary" className="text-center mt-3">
                        <i className="bi bi-emoji-frown"></i> 사용 가능한 쿠폰이 없습니다.
                     </Alert>
                  ) : (
                     availableCoupon.map((item) => (
                        <AvailableCouponCard
                           key={item.couponId}
                           coupon={item}
                           // 💡 mode와 onSelect 함수를 자식에게 전달
                           mode={mode}
                           onSelect={onSelect}
                        />
                     ))
                  )}
               </div>
            </Tab>


            {/* 2. 사용 완료 / 만료 탭 */}
            <Tab
               eventKey="used"
               title={
                  <span>
                     <i className="bi bi-archive"></i> 사용 완료·만료{' '}
                     <Badge pill bg="secondary">{unavailableCoupon.length}</Badge>
                  </span>
               }
            >
               <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {unavailableCoupon.length === 0 ? (
                     <Alert variant="secondary" className="text-center mt-3">
                        <i className="bi bi-info-circle"></i> 사용 완료/만료된 쿠폰이 없습니다.
                     </Alert>
                  ) : (
                     unavailableCoupon.map((item) => (
                        <UnavailableCouponCard
                           key={item.couponId}
                           coupon={item}
                        />
                     ))
                  )}
               </div>
            </Tab>
         </Tabs>

      </div>
   );
}

export default CouponForm;