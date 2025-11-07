
// 쿠폰 데이터 타입을 정의하고 export합니다.
export interface couponType {
   couponId: number;
   userId: number;
   name: string;
   discount: number;
   isUsed: string; // 'Y' | 'N'
   createdAt: string;
   usedAt: string | null; // 사용하지 않았다면 null일 수 있습니다.
   expiredAt: string;
}