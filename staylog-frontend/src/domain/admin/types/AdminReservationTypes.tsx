/** 공통 SuccessResponse 제네릭 타입 */
export type SuccessResponse<T> = {
  code: string;
  message: string;
  data: T;
};

/** 예약 상태 코드(공통코드와 동일한 문자열) */
export const RESERVATION_STATUS = {
  PENDING: "RES_PENDING",                // 예약대기
  CONFIRMED: "RES_CONFIRMED",            // 결제완료
  CANCEL_REQUESTED: "RES_CANCEL_REQUESTED", // 취소요청 (추가 예정)
  CANCELED: "RES_CANCELED",              // 취소완료
  COMPLETED: "RES_COMPLETED",            // 이용완료
  REFUNDED: "RES_REFUNDED",              // 환불됨
} as const;

/** 문자열 리터럴 타입 자동 유추 */
export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

/** 예약 DTO (Admin 전용) */
export type AdminReservation = {
  bookingId: number;
  bookingNum: string;
  userName: string;
  guestName: string;
  accommodationName: string;
  roomName: string;
  checkIn: string | null;
  checkOut: string | null;
  createdAt: string | null;
  amount?: number | null;
  status: ReservationStatus;
  statusName?: string;   // 서버에서 내려주는 한글명
  statusColor?: string;  // COMMON_CODE.ATTR1
};

/** 목록 응답 */
export type ReservationListResponse = SuccessResponse<AdminReservation[]>;
