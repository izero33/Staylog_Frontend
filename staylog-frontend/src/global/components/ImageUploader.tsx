import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import '../css/ImageUploaderCustom.css'; // 드롭존을 위한 커스텀 CSS
import { imageUploadApi } from '../api/imageApi';

// 파일 객체 구조 정의
export interface DroppedFile {
  id: string;
  file: File;
  preview: string;
}

// 메인 컴포넌트의 Props 인터페이스
export interface ImageUploaderProps {
  onFilesChange: (files: DroppedFile[]) => void; // 파일 변경 사항을 부모에게 알리는 콜백
  clearTrigger?: number; // 부모로부터 초기화 트리거를 받음
  targetType: string; // 대상 타입 (예: 'post', 'product')
  targetId: string;   // 대상 ID
  uploadTrigger?: number; // 부모로부터 업로드 트리거를 받음
  onUploadComplete?: (uploadedImages: any[]) => void; // 업로드 완료 시 호출될 콜백
  onUploadError?: (error: string) => void; // 업로드 실패 시 호출될 콜백
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesChange, clearTrigger, targetType, targetId, uploadTrigger, onUploadComplete, onUploadError }) => {
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
  // --- 선택한 이미지 삭제 --- //
  const removeFile = (id: string) => {
    const fileToRemove = selectedFiles.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  // --- 모든 파일 삭제 --- //
  const clearAllFiles = useCallback(() => {
    setSelectedFiles(prevFiles => {
      prevFiles.forEach(file => URL.revokeObjectURL(file.preview));
      return [];
    });
    // 파일 입력 필드의 값 초기화
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []); // inputRef는 useRef로 생성되므로 의존성 배열에 포함할 필요 없음

  // 부모로부터 clearTrigger가 변경되면 상태 초기화
  useEffect(() => {
    // clearTrigger의 값이 변경될 때마다 clearAllFiles를 호출하여 내부 상태를 초기화
    // clearTrigger가 0이 아닌 양수 값으로 변경될 때만 초기화되도록 함
    if (clearTrigger !== undefined && clearTrigger > 0) {
      clearAllFiles();
    }
  }, [clearTrigger, clearAllFiles]);

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

  // 언마운트 시 Blob URL 정리 및 파일 변경 알림
  useEffect(() => {
    onFilesChange(selectedFiles);
    return () => { selectedFiles.forEach(file => URL.revokeObjectURL(file.preview)); };
  }, [selectedFiles, onFilesChange]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError('업로드할 파일이 없습니다.');
      onUploadError?.('업로드할 파일이 없습니다.');
      return;
    }
    if (!targetType || !targetId) {
      const errorMsg = 'Target Type 또는 Target ID가 지정되지 않았습니다.';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsUploading(true);
    setError(null);

    // 실제 File 객체들의 배열을 추출
    const filesToUpload = selectedFiles.map(item => item.file);

    try {
      // 중앙 Api 함수를 호출하여 업로드 실행
      const res = await imageUploadApi({
        imgs: filesToUpload,
        targetType: targetType,
        targetId: targetId
      });

      console.log('업로드 성공: ', res);
      onUploadComplete?.(res);  // 성공 콜백 호출
      clearAllFiles(); // 업로드 성공 후 파일 목록 초기화
    } catch (err: any) {
      console.error('업로드 실패:', err);
      const errorMessage = err.response?.message || '이미지 업로드에 실패했습니다.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, targetType, targetId, onUploadComplete, onUploadError, clearAllFiles]);

  // 부모로부터 uploadTrigger가 변경되면 업로드 시작
  useEffect(() => {
    if (uploadTrigger !== undefined && uploadTrigger > 0) { // 양수 변경 시에만 트리거
      handleUpload();
    }
  }, [uploadTrigger, handleUpload]);

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
        <p className="mb-0">여기로 이미지를 드래그하거나 클릭하여 파일을 선택하세요</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <Flipper flipKey={selectedFiles.map(item => item.id).join('-')}> {/* Flipper 렌더링을 위해 flipKey 사용 */}
            <ul className="list-group">
              {selectedFiles.map((item, index) => (
                <Flipped key={item.id} flipId={item.id}>
                  <li
                    className="list-group-item d-flex justify-content-between"
                    style={{ position: 'relative' }}
                  >
                    <div className="d-flex align-items-center">
                      {/* 순서 변경 버튼 및 순서 번호 */}
                      <div className="d-flex flex-column align-items-center me-3">
                        <button type="button" className="btn btn-sm btn-outline-secondary mb-1 mt-1" onClick={() => moveFile(index, 'up')} disabled={index === 0}>
                          ▲
                        </button>
                        <span className="fw-bold">{index + 1}</span> {/* 순서 번호 */}
                        <button type="button" className="btn btn-sm btn-outline-secondary mb-1 mt-1" onClick={() => moveFile(index, 'down')} disabled={index === selectedFiles.length - 1}>
                          ▼
                        </button>
                      </div>
                      <img src={item.preview} alt={item.file.name} className="img-thumbnail me-3" style={{ width: '100px', height: 'auto' }} />
                      <span className="text-truncate" style={{ maxWidth: '300px' }}>{item.file.name}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeFile(item.id)}
                      style={{ position: 'absolute', top: '5px', right: '5px' }}
                    >
                      X
                    </button>
                  </li>
                </Flipped>
              ))}
            </ul>
          </Flipper>
          <div className="d-flex justify-content-end mt-2">
            <button type="button" className="btn btn-sm btn-danger" onClick={clearAllFiles}>
              모두 삭제
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}

      
    </div>
  );
};

export default ImageUploader;
