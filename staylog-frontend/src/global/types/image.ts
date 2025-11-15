/**
 * GET /v1/images/{targetType}/{targetId} API의 응답 타입
 */
export interface ImageResponse {
  targetType: string;
  targetId: number;
  images: ImageData[];
}

/**
 * ImageResponse에 포함되는 개별 이미지 데이터 타입
 */
export interface ImageData {
  imageId: number;
  imageUrl: string;
  displayOrder: number;
  originalName: string;
}

/**
 * PUT /v1/images API의 JSON 요청 파트 타입
 */
export interface ImageUpdateRequest {
  targetType: string;
  targetId: number;
  imageOrders: ImageUpdateItemDto[];
}

/**
 * ImageUpdateRequest에 포함되는 이미지 순서 항목 타입
 */
export interface ImageUpdateItemDto {
  imageId: number | null; // 새 이미지는 null
  displayOrder: number;
}