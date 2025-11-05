// src/utils/imageHandler.ts
//정나영
// src/utils/imageHandler.ts (또는 에디터 컴포넌트 내부)
import { imageApi } from "../api/imageApi";

export async function handleImageUpload(quillRef: any, targetType: string, targetId: number) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file || !quillRef?.current) return;

    try {
      const res = await imageApi({ img: file, targetType, targetId });
      //  백 응답: SuccessResponse<List<ImageServeDto>>
      // { code, message, data: [ { imageUrl: "/images/..." , ... } ] }
      //가장 마지막(방금 저장된) 항목 사용
      const last = res.data?.[res.data.length - 1];
      const imgUrl = last?.imageUrl;

      if (!imgUrl) {
        console.error("응답에 imageUrl이 없음:", res.data);
        alert("업로드 응답 형식이 예상과 다릅니다.");
        return;
      }

      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      const index = range ? range.index : editor.getLength();
      editor.insertEmbed(index, "image", imgUrl, "user");
      editor.setSelection(index + 1);
      editor.focus();
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("이미지 업로드에 실패했어요.");
    }
  });
}
