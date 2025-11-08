// src/domain/booking/types/index.ts

/**
 * 예약 생성 요청 (POST /v1/bookings)
 */
export interface CreateBookingRequest {
  roomId: number;
  checkIn: string;          // "2025-11-07" 형식
  checkOut: string;         // "2025-11-11" 형식
  amount: number;
  paymentMethod?: string;   // "PAY_CARD", "PAY_BANK_TRANSFER", "PAY_VIRTUAL_ACCOUNT" 등
  adults?: number;
  children?: number;
  infants?: number;
}

/**
 * 예약 상세 응답 (GET /v1/bookings/{bookingId})
 */
export interface BookingDetailResponse {
  bookingId: number;
  bookingNum: string;          // 주문번호 (Toss orderId로 사용)
  userId: number;
  roomId: number;
  roomName: string;
  accommodationName: string;
  checkIn: string;             // "2025-11-07"
  checkOut: string;            // "2025-11-11"
  amount: number;              // 할인 전 원래 금액
  finalAmount?: number;        // 쿠폰 할인 적용 후 최종 결제 금액
  status: string;              // "RES_PENDING", "RES_CONFIRMED", etc.
  guestName: string;
  adults: number;
  children: number;
  infants: number;
  totalGuestCount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;           // 예약 만료 시간 (5분 타임아웃)
  paymentId?: number;          // 결제 ID (있는 경우)
  paymentStatus?: string;      // 결제 상태 (있는 경우)
}

/**
 * 예약 상태 코드
 */
export enum ReservationStatus {
  PENDING = 'RES_PENDING',           // 예약 대기 (결제 대기)
  CONFIRMED = 'RES_CONFIRMED',       // 예약 확정 (결제 완료)
  CANCELED = 'RES_CANCELED',         // 예약 취소
  REFUND_REQUESTED = 'RES_REFUND_REQUESTED', // 환불 요청
  REFUNDED = 'RES_REFUNDED',         // 환불 완료
}
