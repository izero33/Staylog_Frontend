import React, { useState, useCallback } from 'react';
import ImageUploader, * as ImageUploaderTypes from '../components/ImageManager'; // ImageUploader 경로에 맞게 수정
import api from '../api'; // API 클라이언트 경로에 맞게 수정

const TestForm2: React.FC = () => {
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

export default TestForm2;
