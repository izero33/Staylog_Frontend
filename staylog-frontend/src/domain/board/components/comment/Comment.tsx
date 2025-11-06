import { useState } from "react";
import type { CommentsType } from "../../types/CommentsType";
import CommentForm from "./CommentForm";
import { Button, Card } from "react-bootstrap";

interface CommentProps {
    currentUserId ?: number; // 로그인한 유저 ID
    comment : CommentsType; // 댓글 데이터
    editingComment : CommentsType|null; // 현재 수정 중인 댓글
    onEdit : () => void; // 수정 버튼 클릭 시 호출
    onDelete: () => void; // 삭제 버튼 클릭 시 호출
    onUpdate : (commentId: number, content: string) => void; // 댓글 내용 수정 후 제출 시 호출
    onReply : (content: string, parentId?: number) => void; // 답글 등록 시 호출
}

const Comment = ({ currentUserId, comment, editingComment, onEdit, onDelete, onUpdate, onReply} : CommentProps) => {
    // 답글 폼 노출 여부 상태
    const [showReply, setShowReply] = useState(false);
    // 현재 댓글이 수정 중인지 여부
    const isEditing = editingComment?.commentId === comment.commentId;
    // 본인 글 여부 확인
    const isOwner = comment.userId === Number(currentUserId);

    return <>
        <Card
            style={{
                // 대댓글이면 들여쓰기
                marginLeft: comment.parentId !== comment.commentId ? 40 : 0,
                marginBottom: 12,
                borderRadius: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                border: "none"
            }}>
            <Card.Body>
                {/* 작성자 정보 영역 */}
                <div className="d-flex align-items-center mb-2">
                    {/* 작성자 프로필 이미지 */}
                    {comment.profileImage ? (
                        <img src={comment.profileImage} alt={comment.nickname} style={{ width : 35, height : 35, borderRadius : "50%", marginRight : 8 }}/>
                    ) : (
                        <i className="bi bi-person-circle" style={{ fontSize : 35, color : "#575757ff", marginRight : 8 }}></i>
                    )}
                    <div>
                        <strong>{comment.nickname}</strong> {/* 작성자 닉네임 */}
                        <div style={{ fontSize: 12, color: "#888" }}>
                            {new Date(comment.createdAt).toLocaleString()} {/* 작성일 */}
                        </div>
                    </div>
                </div>

                {/* 댓글 내용 또는 수정 폼 */}
                {!isEditing ? (
                    <p style={{ marginBottom: 8 }}>{comment.content}</p>
                ) : (
                <CommentForm
                    OriginalContent={comment.content} // 수정 시 기존 내용 초기값
                    onSubmit={(content) => onUpdate(comment.commentId, content)} // 수정 완료 시 호출
                    onCancel={() => onUpdate(comment.commentId, comment.content)}/> // 수정 취소 시 기존 내용 유지
                )}

                {/* 버튼 영역 */}
                <div className="d-flex gap-2">
                    {isOwner ? (
                        <>
                            {/* 본인 글이면 수정과 삭제 버튼 */}
                            <Button size="sm" variant="outline-primary" onClick={onEdit}>
                                수정
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={onDelete}>
                                삭제
                            </Button>
                        </>
                    ) : (
                        // 본인 글이 아니면 답글 버튼
                        <Button size="sm" variant="outline-secondary" onClick={() => setShowReply(!showReply)}>
                            답글
                        </Button>
                    )}
                </div>

                {/* 답글 폼 (로그인한 사용자가 작성한 글이 아닌 경우, showReply 상태일 때만 표시) */}
                {!isOwner && showReply && (
                    <div style={{ marginTop: 8 }}>
                        {/* 부모 댓글 아이디를 전달, 답글 등록*/}
                        <CommentForm onSubmit={(content) => onReply(content, comment.commentId)} parentId={comment.commentId}/>
                    </div>
                )}
            </Card.Body>
        </Card>
    </>
};

export default Comment;