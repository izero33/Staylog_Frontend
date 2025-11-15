// src/domain/payment/api/index.ts
import api from '../../../global/api';
import type {
  PreparePaymentRequest,
  PreparePaymentResponse,
  ConfirmPaymentRequest,
  PaymentResultResponse
} from '../types';

/**
 * 결제 준비
 * POST /v1/payments/prepare
 *
 * @param request - 결제 준비 요청 (bookingId, method, amount, couponId)
 * @returns 결제 준비 정보 (orderId, clientKey 등 Toss SDK 초기화에 필요한 정보)
 */
export const preparePayment = async (
  request: PreparePaymentRequest
): Promise<PreparePaymentResponse> => {
  return await api.post('/v1/payments/prepare', request);
};

/**
 * 결제 승인
 * POST /v1/payments/confirm
 *
 * @param request - 결제 승인 요청 (paymentKey, orderId, amount)
 * @returns 결제 결과 (paymentStatus, reservationStatus 포함)
 */
export const confirmPayment = async (
  request: ConfirmPaymentRequest
): Promise<PaymentResultResponse> => {
  return await api.post('/v1/payments/confirm', request);
};
