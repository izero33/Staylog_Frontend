// Quill Toolbar 설정 예시

export const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    ["link", "image", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"], // formatting 초기화 버튼
  ],
};

export const quillFormats = [
  "header",
  "bold", "italic", "underline",
  "link", "image", "code-block",
  "list", "bullet",
];
