import React, { useState, useCallback } from 'react';
import ImageUploader, * as ImageUploaderTypes from '../components/ImageManager';
import api from '../api';

const TestForm: React.FC = () => {
  const [targetType, setTargetType] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<ImageUploaderTypes.DroppedFile[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0); // 업로드 트리거를 위한 새로운 상태
  const [imageClearTrigger, setImageClearTrigger] = useState<number>(0); // 이미지 업로더 초기화 트리거

  const handleFilesChange = useCallback((files: ImageUploaderTypes.DroppedFile[]) => {
    setSelectedImages(files);
  }, []);

  const handleImageUploadComplete = useCallback((uploadedImages: any[]) => {
    setSubmissionStatus(`이미지 업로드 성공! 업로드된 이미지: ${JSON.stringify(uploadedImages)}`);
    // 이미지와 함께 성공적으로 제출 후 폼 초기화
    setTargetType('');
    setTargetId(''); // targetId도 초기화
    setSelectedImages([]);
    setImageUploadTrigger(0);
    setImageClearTrigger(prev => prev + 1); // 초기화 트리거 증가
  }, []);

  const handleImageUploadError = useCallback((errorMessage: string) => {
    setSubmissionStatus(`이미지 업로드 실패: ${errorMessage}`);
    // 선택적으로 폼 초기화 또는 재시도 허용
    setTargetType(''); // targetType도 초기화
    setTargetId(''); // targetId도 초기화
    setImageUploadTrigger(0); // 트리거 초기화
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus('기본 데이터 전송 중...');

    if (!targetType || !targetId) { // TargetType과 TargetId 모두 유효성 검사
      setSubmissionStatus('오류: Target Type과 Target ID를 모두 입력해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      setSubmissionStatus('이미지 업로드 준비 중...');
      // createdTtId 로직 제거, targetId를 직접 사용
      // setCurrentTargetId(targetId); // 이젠 필요 없음, ImageUploader에 직접 targetId 전달

      if (selectedImages.length > 0) {
        setImageUploadTrigger(prev => prev + 1); // ImageUploader가 업로드하도록 트리거
      } else {
        setSubmissionStatus(`폼 제출 성공! (이미지 없음) Target Type: ${targetType}, Target ID: ${targetId}`);
        // 이미지 없이 성공적으로 제출 후 폼 초기화
        setTargetType('');
        setTargetId(''); // targetId도 초기화
        setSelectedImages([]);
        // setCurrentTargetId(null); // 제거
        setImageUploadTrigger(0);
        setImageClearTrigger(prev => prev + 1); // 초기화 트리거 증가
      }
    } catch (error: any) { // error type changed to any for broader catch
      console.error('제출 실패:', error);
      const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
      setSubmissionStatus(`제출 실패: ${errorMessage}`);
      // 오류 발생 시 targetId 및 트리거 초기화
      setTargetType('');
      setTargetId('');
      setImageUploadTrigger(0);
      setImageClearTrigger(prev => prev + 1); // 초기화 트리거 증가
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
            onFilesChange={handleFilesChange}
            targetType={targetType}
            targetId={targetId} // 직접 입력받은 targetId 사용
            uploadTrigger={imageUploadTrigger}
            onUploadComplete={handleImageUploadComplete}
            onUploadError={handleImageUploadError}
            clearTrigger={imageClearTrigger} // 새로운 초기화 트리거 전달
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !targetType || (selectedImages.length === 0 && !targetType)}> 
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