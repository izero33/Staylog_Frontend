import Comments from "./Comments";

function CommentsPage() {
  const boardId = 1; // 필요하면 URL params로 받을 수도 있음
  return (
    <div style={{ padding: "16px" }}>
      <h2>댓글 페이지</h2>
      <Comments boardId={boardId} />
    </div>
  );
}

export default CommentsPage;
