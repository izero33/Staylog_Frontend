import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Flipper, Flipped } from 'react-flip-toolkit';
import '../css/ImageUploaderCustom.css';
import { fetchImagesByTarget, updateImageBatch } from '../api/imageApi';
import type { ImageData, ImageUpdateItemDto, ImageUpdateRequest } from '../types/image';

// 1. 상태 인터페이스 확장
export interface DroppedFile {
  id: string; // React key를 위한 고유 ID
  file: File | null; // 새로 추가한 파일만 File 객체를 가짐
  preview: string; // 이미지 미리보기 URL
  imageId: number | null; // 서버에 저장된 기존 이미지의 ID
}

export interface ImageManagerProps {
  targetType: string;
  targetId: number | null; // ID가 없을 수도 있으므로 null 허용
  uploadTrigger?: number;
  onUploadComplete?: () => void;
  onUploadError?: (error: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({
  targetType,
  targetId,
  uploadTrigger,
  onUploadComplete,
  onUploadError,
}) => {
  const [items, setItems] = useState<DroppedFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 3. 기존 이미지 로딩 로직
  useEffect(() => {
    if (targetId) {
      const loadInitialImages = async () => {
        setIsLoading(true);
        try {
          const response = await fetchImagesByTarget(targetType, targetId);
          const initialItems = response.images.map((img: ImageData) => ({
            id: `image-${img.imageId}`,
            file: null,
            preview: img.imageUrl,
            imageId: img.imageId,
          }));
          setItems(initialItems);
        } catch (err: any) {
          setError(err.message || '이미지를 불러오는 데 실패했습니다.');
        } finally {
          setIsLoading(false);
        }
      };
      loadInitialImages();
    }
  }, [targetType, targetId]);

  const handleFileSelection = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        id: `file-${file.name}-${new Date().getTime()}`,
        file,
        preview: URL.createObjectURL(file),
        imageId: null,
      }));

    setItems(prev => [...prev, ...newFiles]);
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (itemToRemove && itemToRemove.file) {
      URL.revokeObjectURL(itemToRemove.preview);
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAllItems = useCallback(() => {
    setItems(prevItems => {
      prevItems.forEach(item => {
        if (item.file) URL.revokeObjectURL(item.preview);
      });
      return [];
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);
    setItems(newItems);
  };

  // 4. 저장 로직 변경
  const handleSave = useCallback(async () => {
    if (!targetId) {
      const errorMsg = '저장을 위한 Target ID가 지정되지 않았습니다.';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageOrders: ImageUpdateItemDto[] = items.map((item, index) => ({
        imageId: item.imageId,
        displayOrder: index + 1,
      }));

      const newFiles: File[] = items
        .map(item => item.file)
        .filter((file): file is File => file !== null);

      const request: ImageUpdateRequest = {
        targetType,
        targetId,
        imageOrders,
      };

      await updateImageBatch(request, newFiles);
      
      onUploadComplete?.();
      // 선택적으로 저장 후 목록을 다시 불러올 수 있습니다.
      // loadInitialImages(); 
    } catch (err: any) {
      const errorMessage = err.message || '이미지 저장에 실패했습니다.';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [items, targetType, targetId, onUploadComplete, onUploadError]);

  useEffect(() => {
    if (uploadTrigger !== undefined && uploadTrigger > 0) {
      handleSave();
    }
  }, [uploadTrigger, handleSave]);

  // ... (나머지 JSX 렌더링 부분은 기존과 유사하게 유지) ...
  // (단, selectedFiles를 items로 변경하고, handleUpload를 handleSave로 변경)

  // ... (드래그 앤 드롭 및 기타 핸들러) ...
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileSelection(e.dataTransfer.files);
  }, []);
  const onDropzoneClick = () => { if (!isLoading) inputRef.current?.click(); };

  useEffect(() => {
    return () => {
      items.forEach(item => {
        if (item.file) URL.revokeObjectURL(item.preview);
      });
    };
  }, [items]);

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
          disabled={isLoading}
        />
        <p className="mb-0">여기로 이미지를 드래그하거나 클릭하여 파일을 선택하세요</p>
      </div>

      {isLoading && <p>로딩 중...</p>}

      {items.length > 0 && (
        <div className="mt-4">
          <Flipper flipKey={items.map(item => item.id).join('-')}>
            <ul className="list-group">
              {items.map((item, index) => (
                <Flipped key={item.id} flipId={item.id}>
                  <li
                    className="list-group-item d-flex justify-content-between"
                    style={{ position: 'relative' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="d-flex flex-column align-items-center me-3">
                        <button type="button" className="btn btn-sm btn-outline-secondary mb-1 mt-1" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                          ▲
                        </button>
                        <span className="fw-bold">{index + 1}</span>
                        <button type="button" className="btn btn-sm btn-outline-secondary mb-1 mt-1" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}>
                          ▼
                        </button>
                      </div>
                      <img src={item.preview} alt={item.file?.name || `image-${item.imageId}`} className="img-thumbnail me-3" style={{ width: '100px', height: 'auto' }} />
                      <span className="text-truncate" style={{ maxWidth: '300px' }}>{item.file?.name || `기존 이미지 (${item.imageId})`}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.id)}
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
            <button type="button" className="btn btn-sm btn-danger" onClick={clearAllItems}>
              모두 삭제
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  );
};

export default ImageManager;