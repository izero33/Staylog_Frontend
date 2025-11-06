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
}

export interface Reservations {
   reservationId: number;
   stayName: string;
   checkIn: string;
   checkOut: string;
   status: 'upcoming' | 'completed' | 'cancelled'; //'pending' | 'confirmed' | 'canceled';
}

export interface Reviews {
   reviewId: number;
   stayName: string;
   content: string;
   rating: number;
   isWrite: 'Y' | 'N';
}

// export interface inquiries {
//    inquiryId: number;
//    category: string;
//    title: string;
//    content: string;
//    createdAt: string;
// }

export interface Comments {
   commentId: number;
   postTitle: string;
   content: string;
   createdAt: string;
}
