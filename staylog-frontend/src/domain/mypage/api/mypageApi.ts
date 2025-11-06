// mypageApi.ts
import api from "../../../global/api";
import type { MemberInfo, Reservations, Reviews } from "../types/mypageTypes";


// 회원정보 조회
export const fetchMemberInfo = async (userId: number): Promise<MemberInfo> => {
  const res = await api.get(`/v1/mypage/member`, { params: { userId } });
  return res;
};

// 회원정보 수정
export const updateMemberInfo = async (member: MemberInfo): Promise<void> => {
  const res = await api.patch(`/v1/mypage/member`, member);
  return res;  
};

// 프로필 이미지 업로드 API (파일 업로드)
export const uploadProfileImage = async (file: File, userId: number): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", String(userId)); // 백엔드 @RequestParam("userId")와 일치

  const res = await api.post("/v1/profile/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res; // return res.data.url; 서버에서 반환된 이미지 URL. SuccessResponse<String> 형태로 data 안에 실제 URL 존재
};

// 예약 내역 조회
export const getReservationList = async (userId: number, status?: string) => {
  const res = await api.get(`/v1/mypage/reservations`, {
    params: { userId, status },
  });
  return res;
};

// 리뷰 내역 조회
export const getReviewList = async (userId: number, type?: string) => {
  const res = await api.get(`/v1/mypage/reviews`, {
    params: { userId, type },
  });
  return res;
};

// 문의 내역 조회
export const getInquiryList = async (userId: number, type?: string) => {
  const res = await api.get(`/v1/mypage/inquiries`, {
    params: { userId, type },
  });
  return res;
};

