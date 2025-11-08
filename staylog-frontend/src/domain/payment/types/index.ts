// src/domain/payment/types/index.ts

/**
 * 결제 준비 요청 (POST /v1/payments/prepare)
 */
export interface PreparePaymentRequest {
  bookingId: number;
  method: string;              // "PAY_CARD", "PAY_VIRTUAL_ACCOUNT", "PAY_BANK_TRANSFER" 등
  amount: number;              // 할인 전 원래 금액
  couponId?: number;           // 쿠폰 ID (선택 사항)
}

/**
 * 결제 준비 응답
 */
export interface PreparePaymentResponse {
  paymentId: number;
  orderId: string;             // bookingNum (Toss에 전달할 주문번호)
  amount: number;              // 최종 결제 금액 (쿠폰 할인 후)
  method: string;
  clientKey: string;           // Toss SDK 초기화용 클라이언트 키
  customerName: string;
}

/**
 * 결제 승인 요청 (POST /v1/payments/confirm)
 */
export interface ConfirmPaymentRequest {
  paymentKey: string;          // Toss에서 발급한 결제 키
  orderId: string;             // bookingNum (주문번호)
  amount: number;              // 검증용 금액
}

/**
 * 결제 결과 응답
 */
export interface PaymentResultResponse {
  paymentId: number;
  paymentKey: string;
  orderId: string;
  amount: number;
  method: string;
  paymentStatus: string;       // "PAY_PAID", "PAY_FAILED"
  reservationStatus: string;   // "RES_CONFIRMED", "RES_CANCELED"
  requestedAt: string;
  approvedAt: string;
  failureReason?: string;      // 실패 사유 (실패 시)
}

/**
 * 결제 상태 코드
 *
 * ⚠️ 주의: 이 enum은 참고용입니다.
 * 실제 런타임에서는 백엔드 CommonCodes에서 제공되는 값을 사용해야 합니다.
 *
 * 사용 방법:
 * ```typescript
 * import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';
 *
 * const paymentStatusCodes = useCommonCodeSelector('paymentStatus');
 * const isPaid = paymentStatusCodes.some(code => code.codeId === 'PAY_PAID');
 * ```
 */
export enum PaymentStatus {
  READY = 'PAY_READY',         // 결제 준비
  PAID = 'PAY_PAID',           // 결제 완료
  FAILED = 'PAY_FAILED',       // 결제 실패
  REFUND = 'PAY_REFUND',       // 환불 완료
}

/**
 * 결제 수단
 *
 * ⚠️ 주의: 이 enum은 참고용입니다.
 * 실제 런타임에서는 백엔드 CommonCodes에서 제공되는 값을 사용해야 합니다.
 *
 * 사용 방법:
 * ```typescript
 * import useCommonCodeSelector from '../../common/hooks/useCommonCodeSelector';
 *
 * const paymentMethodCodes = useCommonCodeSelector('paymentMethods');
 * const methodName = paymentMethodCodes.find(code => code.codeId === 'PAY_CARD')?.codeName;
 * ```
 */
export enum PaymentMethod {
  CARD = 'PAY_CARD',                     // 신용/체크카드
  VIRTUAL_ACCOUNT = 'PAY_VIRTUAL_ACCOUNT', // 가상계좌
  BANK_TRANSFER = 'PAY_BANK_TRANSFER',    // 계좌이체
  KAKAOPAY = 'PAY_KAKAOPAY',              // 카카오페이
  NAVERPAY = 'PAY_NAVERPAY',              // 네이버페이
  TOSS = 'PAY_TOSS',                      // 토스
  MOBILE = 'PAY_MOBILE',                  // 휴대폰결제
  EASY = 'PAY_EASY',                      // 간편결제
}
