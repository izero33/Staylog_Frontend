//정나영
//이미지 업로드 요청을 담당하는 함수
//분리해서 게시판, 프로필에서 사용가능
// src/global/api/imageApi.ts
// src/global/api/imageApi.ts
import api from ".";

type UploadParams = {
  // 단일 파일 또는 파일 배열 모두 받을 수 있게
  imgs: File | File[];
  targetType: string; // 예: "BOARD" | "PROFILE"
  targetId: string;   // 게시글 ID 또는 임시 ID(0/음수)
};

type UpdateParams = {
  img: File;
  imageId: number;
}

type ImageResponse = {
  imageId: number;
  targetType: string;
  targetId: string;
  displayOrder: number;
  imageUrl: string;
}

export async function imageUploadApi({ imgs, targetType, targetId }: UploadParams) {
  const formData = new FormData();

  if (Array.isArray(imgs)) {
    imgs.forEach(img => formData.append("files", img));
  } else {
    formData.append("files", imgs);
  }
  formData.append("targetType", targetType);
  formData.append("targetId", targetId);

  const imageRes = await api.post<ImageResponse[]>("/v1/images/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true
  }
  );
  console.log(imageRes);
  
  return imageRes;
}

export async function imageUpdateApi({ img, imageId }: UpdateParams) {
  const formData = new FormData();
  formData.append("files", img);
  formData.append("imageId", String(imageId));

  const imageRes = await api.patch<ImageResponse[]>("/v1/image/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true
  }
  );
  return imageRes;
}
