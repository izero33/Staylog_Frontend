import React, { useState, useCallback } from 'react';
import ImageUploader from '../components/ImageManager'; // ImageUploader -> ImageManager로 이름 변경 (가독성)
import type { ImageData } from '../types/image'; // ImageData 타입 import

const TestForm: React.FC = () => {
  const [targetType, setTargetType] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);

  // onUploadComplete 시그니처 변경: 인자를 받도록 복구
  const handleImageUploadComplete = useCallback((uploadedImages: ImageData[]) => {
    setSubmissionStatus(`이미지 업로드 성공! 업로드된 이미지: ${JSON.stringify(uploadedImages)}`);
    setTargetType('');
    setTargetId('');
    setImageUploadTrigger(0);
  }, []);

  const handleImageUploadError = useCallback((errorMessage: string) => {
    setSubmissionStatus(`이미지 업로드 실패: ${errorMessage}`);
    setTargetType('');
    setTargetId('');
    setImageUploadTrigger(0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('기본 데이터 전송 중...');

    if (!targetType || !targetId) {
      setSubmissionStatus('오류: Target Type과 Target ID를 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      setSubmissionStatus('이미지 업로드 준비 중...');
      setImageUploadTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('제출 실패:', error);
      const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      setSubmissionStatus(`제출 실패: ${errorMessage}`);
      setTargetType('');
      setTargetId('');
      setImageUploadTrigger(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2>이미지 업로드</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="targetType" className="form-label">이미지 업로드 대상 Type (IMG_FROM_테이블명(대문자)) (예: IMG_FROM_ROOM, IMG_FROM_BOARD)</label>
          <input
            type="text"
            className="form-control"
            id="targetType"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            placeholder="이미지 타겟 타입을 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="targetId" className="form-label">이미지 업로드 대상 ID (PK값)</label>
          <input
            type="text"
            className="form-control"
            id="targetId"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            placeholder="이미지 타겟 ID를 입력하세요"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Images</label>
          <ImageUploader
            targetType={targetType}
            targetId={Number(targetId) || null}
            uploadTrigger={imageUploadTrigger}
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !targetType || !targetId}> 
          폼 제출
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

export default TestForm;