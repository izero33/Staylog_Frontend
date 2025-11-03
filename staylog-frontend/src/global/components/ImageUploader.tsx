import React, { useState, useRef, useCallback, useEffect } from 'react';
import api from '../api';
import { Flipper, Flipped } from 'react-flip-toolkit';
import '../css/ImageUploaderCustom.css'; // Custom CSS for dropzone

// 파일 객체 구조 정의
interface DroppedFile {
  id: string;
  file: File;
  preview: string;
}

// 메인 컴포넌트의 Props 인터페이스
export interface ImageUploaderProps {
  targetType: string;
  targetId: number | string;
  onUploadComplete: (uploadedImages: any) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ targetType, targetId, onUploadComplete }) => {
  const [selectedFiles, setSelectedFiles] = useState<DroppedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- 파일 처리 --- //
  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files)
      .filter(file => file.type.startsWith('image/')) // 이미지 파일만 선택되도록 필터링
      .map(file => ({
        id: `${file.name}-${new Date().getTime()}`,
        file,
        preview: URL.createObjectURL(file),
      }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    const fileToRemove = selectedFiles.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- 모든 파일 삭제 --- //
  const clearAllFiles = () => {
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    setSelectedFiles([]);
  };

  // --- 버튼 기반 순서 변경 --- //
  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === selectedFiles.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newFiles = [...selectedFiles];
    const [movedItem] = newFiles.splice(index, 1);
    newFiles.splice(newIndex, 0, movedItem);

    setSelectedFiles(newFiles);
  };

  // --- 드래그 앤 드롭 핸들러 (전체 섹션에 적용) --- //
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, []);

  // --- 입력 클릭 --- //
  const onDropzoneClick = () => { if (!isUploading) inputRef.current?.click(); };

  // 언마운트 시 Blob URL 정리
  useEffect(() => {
    return () => { selectedFiles.forEach(file => URL.revokeObjectURL(file.preview)); };
  }, [selectedFiles]);

  // --- 업로드 로직 --- //
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('targetType', targetType);
    formData.append('targetId', String(targetId));
    selectedFiles.forEach(item => {
      formData.append('files', item.file);
    });

    try {
      const response = await api.post('/v1/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadComplete(response);
      setSelectedFiles([]);
    } catch (err) {
      console.error('업로드 실패:', err);
      setError('업로드 실패. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={`p-3 rounded-3 ${isDraggingOver ? 'dragging-over' : ''} custom-dropzone`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className="p-4 border-2 border-dashed rounded-3 text-center border-info"
        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={onDropzoneClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => handleFileSelection(e.target.files)}
          disabled={isUploading}
        />
        <p className="mb-0">Drag & drop images here, or click to select files</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-end mb-2">
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={clearAllFiles}>
              모두 삭제
            </button>
          </div>
          <Flipper flipKey={selectedFiles.map(item => item.id).join('-')}> {/* Flipper 렌더링을 위해 flipKey 사용 */}
            <ul className="list-group">
              {selectedFiles.map((item, index) => (
                <Flipped key={item.id} flipId={item.id}>
                  <li
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <span className="me-3 fw-bold">{index + 1}</span> {/* 순서 번호 */}
                      <img src={item.preview} alt={item.file.name} className="img-thumbnail me-3" style={{ width: '100px', height: 'auto' }} />
                      <span className="text-truncate" style={{ maxWidth: '300px' }}>{item.file.name}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <div className="btn-group-vertical me-2" role="group">
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveFile(index, 'up')} disabled={index === 0}>
                          ▲
                        </button>
                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => moveFile(index, 'down')} disabled={index === selectedFiles.length - 1}>
                          ▼
                        </button>
                      </div>
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFile(item.id)}>X</button>
                    </div>
                  </li>
                </Flipped>
              ))}
            </ul>
          </Flipper>
        </div>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}

      {selectedFiles.length > 0 && (
        <button onClick={handleUpload} className="btn btn-primary mt-3 w-100" disabled={isUploading}>
          {isUploading ? 'Processing...' : `Upload ${selectedFiles.length} image(s)`}
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
