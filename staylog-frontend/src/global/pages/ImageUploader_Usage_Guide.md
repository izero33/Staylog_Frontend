ImageUploader 컴포넌트 사용 설명서

`ImageUploader` 컴포넌트는 이미지 파일 선택, 미리보기, 순서 변경 및 업로드 기능을 제공합니다. 부모 컴포넌트의 폼 제출 로직과 연동하여 특정 대상(`targetType`, `targetId`)에 이미지를 연결하고 업로드할 수 있도록 설계되었습니다.

**필수 Props:**

   * `targetType: string`
       * 역할: 업로드될 이미지가 연결될 대상의 유형을 지정합니다 (예: 'post', 'product',
         'user'). 백엔드에서 이미지를 분류하고 관리하는 데 사용됩니다.
       * 필수 여부: 필수
   * `targetId: string`
       * 역할: 업로드될 이미지가 연결될 대상의 고유 ID를 지정합니다. 일반적으로 부모
         컴포넌트에서 기본 폼 데이터 제출 후 백엔드로부터 생성된 ID를 사용합니다.
       * 필수 여부: 필수 (이미지 업로드 시점에 유효한 ID가 있어야 함)
   * `onFilesChange: (files: DroppedFile[]) => void`
       * 역할: ImageUploader 내부에서 선택된 파일 목록이 변경될 때마다 호출되는 콜백
         함수입니다. 부모 컴포넌트에서 현재 선택된 파일 목록을 추적하는 데 사용됩니다.
       * 필수 여부: 필수
   * `uploadTrigger?: number`
       * 역할: ImageUploader에게 이미지 업로드를 시작하도록 지시하는 트리거입니다. 부모
         컴포넌트에서 이 prop의 값을 변경(예: 1씩 증가)하여 업로드를 시작합니다. 기본 폼
         데이터 제출이 성공하고 targetId가 확보된 후에 사용됩니다.
       * 필수 여부: 선택 사항 (하지만 이미지 업로드 기능을 사용하려면 필요)
   * `onUploadComplete?: (uploadedImages: any[]) => void`
       * 역할: 이미지 업로드가 성공적으로 완료되었을 때 호출되는 콜백 함수입니다. 업로드된
         이미지에 대한 정보를 매개변수로 받습니다. 부모 컴포넌트에서 업로드 성공 후 추가
         로직을 처리하는 데 사용됩니다.
       * 필수 여부: 선택 사항 (업로드 성공 후 처리가 필요하다면 필요)
   * `onUploadError?: (error: string) => void`
       * 역할: 이미지 업로드 중 오류가 발생했을 때 호출되는 콜백 함수입니다. 오류 메시지를
         매개변수로 받습니다. 부모 컴포넌트에서 오류 처리를 하는 데 사용됩니다.
       * 필수 여부: 선택 사항 (업로드 오류 처리가 필요하다면 필요)
   * `clearTrigger?: number`
       * 역할: ImageUploader의 내부 상태(선택된 파일 목록)를 초기화하도록 지시하는
         트리거입니다. 부모 컴포넌트에서 이 prop의 값을 변경(예: 1씩 증가)하여
         ImageUploader의 파일 목록을 지웁니다. 폼 제출 완료 후 또는 특정 상황에서
         ImageUploader를 초기화할 때 사용됩니다.
       * 필수 여부: 선택 사항 (하지만 폼 초기화 후 이미지 드롭존을 비우려면 필요)

**업로드 흐름:**

`ImageUploader`는 부모 컴포넌트와 연동하여 2단계 제출 프로세스를 지원합니다.

1.  **1단계: 기본 폼 데이터 제출 및 `targetId` 확보**
    *   부모 컴포넌트에서 이미지와 관련된 기본 폼 데이터(예: 게시글 제목, 내용)를 먼저 백엔드에 제출합니다.
    *   백엔드는 이 데이터를 저장하고, 새로 생성된 엔티티의 고유 ID(`targetId`)를 반환합니다.
2.  **2단계: `ImageUploader`를 통한 이미지 업로드**
    *   `targetId`가 확보되면, 부모 컴포넌트는 이 `targetId`와 `targetType`을 `ImageUploader`에 전달합니다.
    *   부모 컴포넌트는 `uploadTrigger` prop의 값을 변경하여 `ImageUploader`에게 이미지 업로드를 시작하도록 지시합니다.
    *   `ImageUploader`는 내부적으로 선택된 파일들을 `targetType` 및 `targetId`와 함께 백엔드 API(`POST /v1/images/upload`)로 전송합니다.
    *   업로드 결과는 `onUploadComplete` 또는 `onUploadError` 콜백을 통해 부모 컴포넌트에 전달됩니다.
    *   업로드 완료 후, 부모 컴포넌트는 `clearTrigger`를 변경하여 `ImageUploader`의 파일 목록을 초기화할 수 있습니다.

**예시 사용법 (`ParentComponent.tsx`):**

```typescript
import React, { useState, useCallback } from 'react';
import ImageUploader, * as ImageUploaderTypes from './ImageUploader'; // ImageUploader 경로에 맞게 수정
import api from './api'; // API 클라이언트 경로에 맞게 수정

const ParentComponent: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<ImageUploaderTypes.DroppedFile[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [postTargetId, setPostTargetId] = useState<string | null>(null); // 게시글 ID
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0); // 이미지 업로드 트리거
  const [imageClearTrigger, setImageClearTrigger] = useState<number>(0); // 이미지 업로더 초기화 트리거

  // ImageUploader에서 파일 목록이 변경될 때 호출
  const handleFilesChange = useCallback((files: ImageUploaderTypes.DroppedFile[]) => {
    setSelectedImages(files);
  }, []);

  // 이미지 업로드 성공 시 호출
  const handleImageUploadComplete = useCallback((uploadedImages: any[]) => {
    setSubmissionStatus(`이미지 업로드 성공! 업로드된 이미지: ${JSON.stringify(uploadedImages)}`);
    // 폼 초기화
    setTitle('');
    setContent('');
    setSelectedImages([]);
    setPostTargetId(null);
    setImageUploadTrigger(0);
    setImageClearTrigger(prev => prev + 1); // ImageUploader 초기화
  }, []);

  // 이미지 업로드 실패 시 호출
  const handleImageUploadError = useCallback((errorMessage: string) => {
    setSubmissionStatus(`이미지 업로드 실패: ${errorMessage}`);
    // 오류 발생 시 targetId 및 트리거 초기화
    setPostTargetId(null);
    setImageUploadTrigger(0);
    setImageClearTrigger(prev => prev + 1); // ImageUploader 초기화
  }, []);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('기본 데이터 전송 중...');

    if (!title || !content) {
      setSubmissionStatus('오류: 제목과 내용을 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    let createdPostId: number | null = null;

    try {
      // 1단계: 기본 폼 데이터 전송 및 게시글 ID 받기
      const basicFormData = new FormData();
      basicFormData.append('title', title);
      basicFormData.append('content', content);

      // 가상의 백엔드 엔드포인트: /posts/create
      // 이 엔드포인트는 게시글 데이터를 받아 생성된 postId를 반환한다고 가정합니다.
      const basicFormResponse = await api.post('/posts/create', basicFormData);
      createdPostId = basicFormResponse.postId; // 백엔드 응답에서 postId 추출
      setSubmissionStatus(`기본 데이터 전송 성공! 생성된 게시글 ID: ${createdPostId}`);

      if (createdPostId !== null) {
        setPostTargetId(String(createdPostId)); // ImageUploader를 위한 targetId 설정
        if (selectedImages.length > 0) {
          setSubmissionStatus('이미지 업로드 준비 중...');
          setImageUploadTrigger(prev => prev + 1); // ImageUploader가 업로드하도록 트리거
        } else {
          setSubmissionStatus(`게시글 제출 성공! (이미지 없음) 생성된 ID: ${createdPostId}`);
          // 이미지 없이 성공적으로 제출 후 폼 초기화
          setTitle('');
          setContent('');
          setSelectedImages([]);
          setPostTargetId(null);
          setImageUploadTrigger(0);
          setImageClearTrigger(prev => prev + 1); // ImageUploader 초기화
        }
      }
    } catch (error: any) {
      console.error('제출 실패:', error);
      const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      setSubmissionStatus(`제출 실패: ${errorMessage}`);
      // 오류 발생 시 targetId 및 트리거 초기화
      setPostTargetId(null);
      setImageUploadTrigger(0);
      setImageClearTrigger(prev => prev + 1); // ImageUploader 초기화
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>새 게시글 작성</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">제목</label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">내용</label>
          <textarea
            className="form-control"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="게시글 내용을 입력하세요"
            rows={5}
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label">이미지</label>
          <ImageUploader
            onFilesChange={handleFilesChange}
            targetType="post" // 예시: 'post' 타입으로 지정
            targetId={postTargetId || ''} // 게시글 ID가 없을 경우 빈 문자열 전달
            uploadTrigger={imageUploadTrigger}
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
            clearTrigger={imageClearTrigger}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !title || !content}>
          게시글 제출
        </button>

        {submissionStatus && (
          <div className="mt-3 alert alert-info" role="alert">
            {submissionStatus}
          </div>
        )}
      </form>
    </div>
  );
};

export default ParentComponent;
```