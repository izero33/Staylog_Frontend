/** 공통 SuccessResponse 제네릭 타입 */
export type SuccessResponse<T> = {
  code: string;
  message: string;
  data: T;
};


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
  finalAmount?: number | null;
  status: string;
  statusName?: string;   // 서버에서 내려주는 한글명
  statusColor?: string;  // COMMON_CODE.ATTR1
};

// BE 응답 (권장)
type ReservationListPayload = {
  items: AdminReservation[];
  totalCount: number;
};

export type ReservationListResponse = SuccessResponse<ReservationListPayload>;




