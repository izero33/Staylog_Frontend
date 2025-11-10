// src/features/mypage/types/mypageTypes.ts
export interface MemberInfo {
   userId: number;  // 회원 고유 ID
   loginId: string;  // 로그인 ID
   password?: string; // 비밀번호 (해시된 형태 & 비밀번호 변경 시 재사용) 
   nickname: string; // 닉네임
   name: string; // 실명
   email: string; // 이메일
   phone?: string; // 전화번호 (선택적 필드)
   profileImageUrl?: string; // 프로필 이미지 URL (선택적 필드로 추가)
   birthDate?: string; // 생년월일 (YYYY-MM-DD 형식, 선택적 필드)
   gender?: 'M' | 'F' | 'O'; // 성별 (선택적 필드)
   createdAt: string; // 회원가입일
   updatedAt: string; // 회원정보 수정일
};

export interface Reservations {
   reservationId: number;
   stayName: string;
   checkIn: string;
   checkOut: string;
   status: 'upcoming' | 'completed' | 'cancelled'; //'pending' | 'confirmed' | 'canceled';
};

export type ReservationModalProps = {
   open: boolean;
   bookingId: number | null;
   onClose: () => void;
};

export type ReservationDetail = {
   bookingId: number;
   bookingNum: string | null; // 회원에게 보여지는 예약번호
   userName: string | null;
   guestName: string | null;
   phone: string | null;
   accommodationId: number | null;
   accommodationName: string | null;
   roomId: number | null;
   roomName: string | null;
   createdAt: string; // 예약일
   checkIn: string; // 체크인
   checkOut: string; // 체크아웃
   status: string; // RES_PENDING | RES_CONFIRMED | RES_CANCELED | RES_COMPLETED
   /** 투숙 인원 */
   adults: number | null;
   children: number | null;
   infants: number | null;
   totalGuestCount: number | null;
   /** 결제 금액 및 결제 방식 */
   payId: number | null;
   amount: number | null;
   paymentMethod: string | null;
   paidAt: string | null;
   statusLogs?: Array<{ at: string; from?: string | null; to: string; by?: string | null }>;
   paymentLogs?: Array<{ at: string; action: string; amount?: number | null; note?: string | null }>;
};


// 백엔드 ReviewInfoResponse DTO 와 필드명을 일치시킴.
// 'myWrittenReview'와 'availableToWrite' 타입에 따라 필드가 다르므로, 타입 정의
export interface Reviews {
   // 공통
   accommodationName: string;
   bookingNum?: string;
   // 'availableToWrite'
   bookingId?: number;
   checkIn?: string;
   checkOut?: string;
   // 'myWrittenReview'
   reviewId?: number;
   title?: string;
   rating?: number;
   createdAt?: string;
}


export interface Comments {
   commentId: number;
   postTitle: string;
   content: string;
   createdAt: string;
}
