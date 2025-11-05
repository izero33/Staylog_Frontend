//정나영
//이미지 업로드 요청을 담당하는 함수
//분리해서 게시판, 프로필에서 사용가능
// src/global/api/imageApi.ts
// src/global/api/imageApi.ts
import axios from "axios";

type UploadParams = {
  img: File;
  targetType: string; // 예: "BOARD" | "PROFILE" | "TEMP"
  targetId: number;   // 게시글 ID 또는 임시 ID(0/음수)
};

// SuccessResponse<List<ImageServeDto>>
type SuccessResponse<T> = { code: string; message: string; data: T };
type ImageServeDto = {
  imageId: number;
  imageUrl: string;   // 백엔드가 "/images/..." 로 내려줌
  targetType: string;
  targetId: number;
  displayOrder: number;
};

export async function imageApi({ img, targetType, targetId }: UploadParams) {
  if (!targetType || targetId === undefined || targetId === null) {
    throw new Error("imageApi: targetType/targetId는 필수입니다.");
  }
  const form = new FormData();
  form.append("files", img);                 // ✅ 백엔드가 files(복수)로 받음
  form.append("targetType", targetType);
  form.append("targetId", String(targetId));

  const { data } = await axios.post<SuccessResponse<ImageServeDto[]>>(
    "/api/v1/images/upload",
    form,
    { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
  );
  return data; // { code, message, data:[{ imageUrl, ...}] }
}
