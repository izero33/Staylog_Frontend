// src/domain/common/commoncodes.ts
import api from "../api";

export interface CommonCode {
  codeId: string;
  codeName: string;
  parentId?: string;
  description?: string;
}

/**
 * 특정 parentId(예: REGION_TYPE) 기준으로 공통코드 목록 조회
 */
export const getCommonCodes = async (parentId: string): Promise<CommonCode[]> => {
  try {
    const res = await api.get(`/v1/common-codes/${parentId}`);
    return res.data?.data || res.data || [];
  } catch (err) {
    console.error("공통코드 조회 실패:", err);
    return [];
  }
};
