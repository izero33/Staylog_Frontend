import QuillEditor2 from "../../../global/components/QuillEditor";
import { useEffect, useState } from "react";
import api from "../../../global/api"; // baseURL이 서버(9090)로 또는 Vite proxy 사용

function BoardForm2() {
  const [targetId, setTargetId] = useState<number | null>(null);
  const [content, setContent] = useState("");
  const targetType = "BOARD";

  useEffect(() => {
    // 즉시실행 async 함수로 호출까지!
    (async () => {
      try {
        const res = await api.post( "v1/images/imageId/draft" );
        console.log("boardId(targetId):", res);
        if (typeof res !== "number") throw new Error("invalid id");
        setTargetId(res); // 숫자만 저장
      } catch (err) {
        console.error("boardId 요청 실패:", err);
      }
    })();
  }, []); // 의존성 배열 필수

  return (
    <div>
      <h3>게시글 작성</h3>
      {targetId !== null ? (
        <QuillEditor2
          value={content}
          onChange={setContent}
          targetType={targetType}
          targetId={targetId}
        />
      ) : (
        <div>에디터 준비중...</div>
      )}
    </div>
  );
}

export default BoardForm2;
