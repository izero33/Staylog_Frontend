import React, { useState, useCallback } from 'react';
import { useImageLoader } from '../hooks/useImageLoader';


const TestLoadImage: React.FC = () => {
  const [targetType, setTargetType] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const { images, loading, error, loadImages, clearImages } = useImageLoader();

  const handleLoadImages = useCallback(async () => {
    const res = await loadImages(targetType, targetId);
    console.log(res);
    
  }, [targetType, targetId, loadImages]);

  const handleClear = useCallback(() => {
    setTargetType('');
    setTargetId('');
    clearImages();
  }, [clearImages]);

  return (
    <div className="container mt-5">
      <h2>이미지 불러오기 테스트</h2>
      <div className="mb-3">
        <label htmlFor="targetType" className="form-label">이미지 대상 Type (IMG_FROM_테이블명(대문자)) (예: IMG_FROM_ROOM, IMG_FROM_BOARD)</label>
        <input
          type="text"
          className="form-control"
          id="targetType"
          value={targetType}
          onChange={(e) => setTargetType(e.target.value)}
          placeholder="Target Type을 입력하세요"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="targetId" className="form-label">이미지 대상 ID</label>
        <input
          type="text"
          className="form-control"
          id="targetId"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Target ID를 입력하세요"
        />
      </div>
      <div className="d-flex gap-2 mb-4">
        <button className="btn btn-primary" onClick={handleLoadImages} disabled={loading}>
          {loading ? '불러오는 중...' : '이미지 불러오기'}
        </button>
        <button className="btn btn-secondary" onClick={handleClear} disabled={loading}>
          초기화
        </button>
      </div>

      {loading && <p>이미지를 불러오는 중입니다...</p>}
      {error && <p className="text-danger">오류: {error}</p>}

      {images.length > 0 && (
        <div className="mt-4">
          <h3>불러온 이미지 ({images.length}개)</h3>
          <div className="row">
            {images.map((image) => (
              <div key={image.imageId} className="col-md-3 mb-3">
                <div className="card">
                  <img src={image.imageUrl} className="card-img-top" alt={image.originalName} style={{ height: '150px', objectFit: 'cover' }} />
                  <div className="card-body">
                    <h5 className="card-title">{image.originalName}</h5>
                    <p className="card-text">ID: {image.imageId}</p>
                    <p className="card-text">순서: {image.displayOrder}</p>
                    <p className="card-text">URL: <a href={image.imageUrl} target="_blank" rel="noopener noreferrer">{image.imageUrl}</a></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !loading && !error && (targetType && targetId) && (
        <p>해당 Target Type과 Target ID에 대한 이미지가 없습니다.</p>
      )}
    </div>
  );
};

export default TestLoadImage;
