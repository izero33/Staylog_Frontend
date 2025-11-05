
export const STATUS_KO: Record<string, string> = {
  PENDING: "대기",
  CONFIRMED: "확정",
  CANCELED: "취소",
  COMPLETED: "완료",
};

// 서버가 한글명을 내려줄 수도 있으니 우선 사용, 없으면 매핑 사용
export const getStatusLabel = (status?: string, statusName?: string) =>
  statusName ?? (status ? STATUS_KO[status] ?? status : "—");
