/**
 * 이미지 요청 담당 중앙관리 함수
 * @author 고윤제
 */
import api from ".";
import type { ImageResponse, ImageUpdateRequest } from "../types/image";

/**
 * 특정 대상에 속한 이미지 목록을 조회.
 * @param targetType - e.g., "BOARD", "STAY"
 * @param targetId - e.g., 123
 * @returns ImageResponse 객체를 반환하는 Promise
 */
export const fetchImagesByTarget = (targetType: string, targetId: number): Promise<ImageResponse> => {
  // 인터셉터 덕분에 반환 타입은 ImageResponse.
  return api.get(`/v1/images/${targetType}/${targetId}`);
};

/**
 * Quill Editor와 같은 에디터에서 단일 이미지를 업로드하는 데 사용.
 * @param file - 업로드할 이미지 파일
 * @returns 서버에 저장된 이미지의 전체 URL을 반환하는 Promise
 */
export const uploadSingleImageForEditor = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('files', file);
  // 에디터에서 임시로 올리는 이미지는 특정 target을 가지지 않을 수 있음.
  // 'TEMP' 타입과 임시 ID (e.g., 0)를 사용하는 규칙을 정함.
  formData.append('targetType', 'TEMP');
  formData.append('targetId', '0');

  // `saveImages` API는 ImageResponse를 반환.
  const response = await api.post<ImageResponse>('/v1/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  // 응답 받은 이미지 목록에서 첫 번째 이미지의 URL을 반환.
  if (response.images && response.images.length > 0) {
    return response.images[0].imageUrl;
  }

  throw new Error('이미지 업로드에 실패했거나 반환된 이미지 URL이 없습니다.');
};

/**
 * 이미지 목록의 추가, 삭제, 순서 변경을 한 번에 처리.
 * @param request - target 정보와 최종 이미지 순서 목록이 담긴 JSON 객체
 * @param files - 새로 추가할 파일 목록 (optional)
 * @returns Promise<void>
 */
export const updateImageBatch = (request: ImageUpdateRequest, files?: File[]): Promise<void> => {
  const formData = new FormData();

  // 1. JSON 데이터를 'request' 파트로 추가 (Blob으로 변환)
  formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

  // 2. 새로운 파일들을 'files' 파트로 추가
  if (files) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  return api.put('/v1/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * 단일 이미지를 삭제.
 * @param imageId - 삭제할 이미지의 ID
 * @returns Promise<void>
 */
export const deleteSingleImage = (imageId: number): Promise<void> => {
  return api.delete(`/v1/image/${imageId}`);
}
