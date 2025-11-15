// src/global/types/Paginationtypes.ts
/**
 * 페이지 요청 파라미터
 */
export interface PageRequest {
    pageNum: number;      // 현재 페이지 번호 (기본값: 1)
    pageSize: number;     // 페이지당 항목 수 (기본값: 10)
}

/**
 * 페이지 응답 정보
 */
export interface PageResponse {
    pageNum: number;      // 현재 페이지 번호
    pageSize: number;     // 페이지당 항목 수
    totalCount: number;   // 전체 항목 수
    totalPage: number;    // 전체 페이지 수
    startPage: number;    // 현재 그룹의 시작 페이지
    endPage: number;      // 현재 그룹의 끝 페이지
    offset: number;       // DB OFFSET
}