import { useEffect, useState } from "react";
import api from "../../../../global/api";
import type { CommentsType } from "../../types/CommentsType";
import CommentForm from "./CommentForm";
import Comment from "./Comment";
import useGetUserIdFromToken from "../../../auth/hooks/useGetUserIdFromToken";
import { Card, Container } from "react-bootstrap";

interface CommentsProps {
    boardId : number; // 댓글이 달린 게시글 번호
}

const Comments = ({ boardId }: CommentsProps) => {
    // 댓글 목록 상태
    const [comments, setComments] = useState<CommentsType[]>([]);
    // 현재 수정 중인 댓글 상태
    const [editingComment, setEditingComment] = useState<CommentsType | null>(null);
    // 로그인한 유저 아이디
    const userId = useGetUserIdFromToken();

    // 댓글 목록 조회
    const CommentList = async () => {
        try {
            //  Api 호출
            const res = await api.get(`/v1/boards/${boardId}/comments`);
            setComments(res);
        } catch (err) {
            console.error("댓글 조회 실패 : ", err);
        }
    };

    // 게시글 번호에 따른 댓글 조회
    useEffect(() => {
        CommentList();
    }, [boardId]);

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
        <Container className="mt-2 p-2" style={{ maxWidth: 800, backgroundColor: "#f8f9fa", borderRadius : 8 }}>
            {/* 댓글 입력 폼 */}
            <CommentForm onSubmit={handleAdd} />

            {/* 댓글 목록 */}
            <div>
                {comments.map((comment) => (
                    <Comment
                        key={comment.commentId}
                        currentUserId={userId ? Number(userId) : undefined}
                        comment={comment}
                        editingComment={editingComment}
                        onEdit={() => setEditingComment(comment)}
                        onDelete={() => handleDelete(comment.commentId)}
                        onUpdate={handleUpdate}
                        onReply={handleAdd}/>
                ))}
            </div>
        </Container>
    </>
};

export default Comments;