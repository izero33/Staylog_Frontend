import { useEffect, useState } from "react";
import api from "../../../../global/api";
import type { CommentsType } from "../../types/CommentsType";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import { Button, Card, Container } from "react-bootstrap";
import "../../pages/Comments.css";

interface CommentsProps {
    boardId : number; // 댓글이 달린 게시글 번호
    userId?: number;
}

const Comments = ({ boardId, userId }: CommentsProps) => {
    // 댓글 목록 상태
    const [comments, setComments] = useState<CommentsType[]>([]);
    // 현재 수정 중인 댓글 상태
    const [editingComment, setEditingComment] = useState<CommentsType | null>(null);
    // 댓글 페이지 맨 위로 가기
    const [goToUp, setGoToUp] = useState(false);

    // 댓글 목록 조회
    const CommentList = async () => {
        try {
            //  Api 호출
            const res = await api.get(`/v1/boards/${boardId}/comments`, {
                params: userId ? { userId } : {}
            });
            setComments(res);
        } catch (err) {
            console.error("댓글 조회 실패 : ", err);
        }
    };

    // 게시글 번호에 따른 댓글 조회
    useEffect(() => {
        CommentList();
    }, [boardId, userId]);

    // 댓글 쪽 맨 위로 가게 하기
    useEffect(() => {
        const handleScroll = () => {
            setGoToUp(window.scrollY > 200); // 200px 이상 스크롤 시 표시
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 새로운 댓글 등록
    const handleAdd = async (content: string, parentId?: number) => {
        if (!userId) {
            alert("로그인한 회원만 댓글 작성이 가능합니다");
            return;
        }

        try {
            await api.post(`/v1/comments`, { 
                boardId, 
                content, 
                parentId, 
                userId,
            });

            // 등록 후 댓글 목록 새로고침
            CommentList();
        } catch (err) {
            console.error("댓글 등록 실패 : ", err);
        }
    };

    // 댓글 수정
    const handleUpdate = async (commentId: number, content: string) => {
        try {
            await api.post(`/v1/comments/update/${commentId}`, { content });
            // 수정 완료 후 수정 모드에서 벗어나기, 댓글 목록 새로고침
            setEditingComment(null);
            CommentList();
        } catch (err) {
            console.error("댓글 수정 실패:", err);
        }
    };
    
    // 댓글 삭제
    const handleDelete = async (commentId: number) => {
        try {
            await api.post(`/v1/comments/delete/${commentId}`);
            // 삭제 후 댓글 목록 새로고침
            CommentList();
        } catch (err) {
            console.error("댓글 삭제 실패 : ", err);
        }
    };

    return <>
        {/* 댓글 입력 폼 */}
        <CommentForm onSubmit={handleAdd} />
        <div className="mt-4 mb-4" style={{ borderBottom: "1px solid #dee2e6" }} />
        
        {/* 댓글이 존재하지 않는다면 */}
        <Container className="p-2 shadow d-flex flex-column justify-content-center align-items-center"
            style={{
                backgroundColor: "#f8f9fa",
                borderRadius: 8,
                minHeight: comments.length === 0 ? "7rem" : "auto"
            }}>
            {comments.length === 0 && (
                <div className="text-center">
                    <i className="bi bi-chat-square-dots" style={{ fontSize : "1.5rem" , color: "#666e75ff" }}></i>
                    <p className="mt-2" style={{ color : "#666e75ff" }}>등록된 댓글이 없습니다</p>
                </div>
            )}

            {/* 댓글 목록 */}
            <div style={{ width: "100%" }}>
                {comments.map((comment) => (
                    <Comment
                        key={`${comment.commentId}-${String(userId)}`}
                        userId={userId}
                        comment={comment}
                        editingComment={editingComment}
                        onEdit={() => setEditingComment(comment)}
                        onDelete={() => handleDelete(comment.commentId)}
                        onUpdate={handleUpdate}
                        onReply={handleAdd}/>
                ))}
            </div>

            {/* 맨 위로 가게 하는 버튼*/}
            {goToUp && (
                <Button size="sm" onClick={scrollToTop}
                    className="position-fixed me-2 mb-2 bottom-0 end-0 border-0 bg-transparent shadow-none">
                    <i className="bi bi-arrow-up-square-fill" style={{ fontSize : "2.5rem", color : "#252525ff"}}></i>
                </Button>
            )}
        </Container>
    </>
};

export default Comments;