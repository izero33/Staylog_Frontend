/**
 * 공용 api 호출
 */
import api from ".";
/**
 * 백엔드에서 특정 테이블의 다음 PK ID를 미리 발급받습니다.
 * @param tableName - ID를 발급받을 테이블의 이름 (예: "ACCOMMODATION", "BOARD")
 * @returns 발급된 ID (number)
 */
export const fetchDraftIdForTable = async (tableName: string): Promise<number> => {
  const response = await api.post<number>(`/v1/common/draft/${tableName}`);
  return response;
};