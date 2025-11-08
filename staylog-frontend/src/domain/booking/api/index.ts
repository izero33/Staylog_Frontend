// src/domain/booking/api/index.ts
import api from '../../../global/api';
import type {
  CreateBookingRequest,
  BookingDetailResponse
} from '../types';

/**
 * 예약 생성
 * POST /v1/bookings
 *
 * @param request - 예약 생성 요청 데이터
 * @returns 생성된 예약 정보 (bookingId, bookingNum, expiresAt 포함)
 */
export const createBooking = async (
  request: CreateBookingRequest
): Promise<BookingDetailResponse> => {
  return await api.post('/v1/bookings', request);
};

/**
 * 예약 조회
 * GET /v1/bookings/{bookingId}
 *
 * @param bookingId - 예약 ID
 * @returns 예약 상세 정보
 */
export const getBooking = async (
  bookingId: number
): Promise<BookingDetailResponse> => {
  return await api.get(`/v1/bookings/${bookingId}`);
};
