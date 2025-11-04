// src/domain/board/components/QuillEditor.tsx

import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// ✅ 툴바 설정
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block", "link", "image"],
    ["clean"], // formatting 초기화 버튼
  ],
};

// ✅ 허용 포맷
const formats = [
  "header",
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "blockquote", "code-block",
  "link", "image",
];

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder="내용을 입력하세요..."
      style={{ height: "300px", marginBottom: "40px" }}
    />
  );
}
