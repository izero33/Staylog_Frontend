// ReactQuillEditor.tsx
import { useMemo, useRef, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
import "../css/quill.custom.css";
import { imageUploadApi } from '../api/imageApi';
import { handleImageUpload } from '../utils/imageHandler';

interface ReactQuillEditorProps {
  style?: React.CSSProperties;
  value: string;
  onChange: (value: string) => void;
  targetType: string;   // 예: "BOARD" | "PROFILE" | "TEMP"
  targetId: string;     
}

function ReactQuillEditor({ style, value, onChange, targetType, targetId }: ReactQuillEditorProps) {
  const quillRef = useRef<ReactQuill | null>(null);

  // 이미지 버튼 핸들러
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) return alert('이미지만 업로드');
      if (file.size > 10 * 1024 * 1024) return alert('최대 10MB');

      const editor = quillRef.current?.getEditor?.();
      if (!editor) return;

      const index = editor.getSelection()?.index ?? editor.getLength();

      try {
        // 백 스펙대로 호출
        const resp = await imageUploadApi({ imgs: file, targetType, targetId });
        const imgUrl = resp[0]?.imageUrl; // 배열 첫 항목 사용

        if (!imgUrl) {
          console.error("응답에 imageUrl 없음:", resp);
          return alert("업로드 응답 형식이 예상과 달라요.");
        }

        editor.insertEmbed(index, 'image', imgUrl, 'user');
        editor.setSelection(index + 1);
        editor.focus();
      } catch (e) {
        console.error(e);
        alert('이미지 업로드에 실패했어요.');
      }
    };
  }, [targetType, targetId]);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: { image: () => handleImageUpload(quillRef, targetType, targetId), },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'indent',
    'color', 'background',
    'link', 'image', 'video',
    'code-block',
  ];

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      theme="snow"
      placeholder="내용을 입력하세요..."
      className="quill-box"
      style={style}
    />
  );
}

export default ReactQuillEditor;
