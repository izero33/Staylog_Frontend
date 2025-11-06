import { useState } from "react";
import { Button } from "react-bootstrap";

interface CommentFormProps {
    parentId ?: number; // 답글인 겅우 부모 댓글의 고유 번호
    OriginalContent?: string; // 수정하는 경우 해당 댓글의 원래 내용을 초기값으로 전달한다
    onSubmit : (content : string, parentId ?: number) => void; // 등록 버튼 클릭 시 호출
    onCancel ?: () => void; // 수정 취소 버튼 클릭 시 호출
}

const CommentForm = ({ parentId, OriginalContent = "", onSubmit, onCancel } : CommentFormProps) => {
    // 댓글, 답글 입력 상태 관리
    const [content, setContent] = useState(OriginalContent);

    // 폼 제출
    const handleSubmit = (e : React.FormEvent) => {
        e.preventDefault(); // 기본으로 제출하는 동작을 방지
        if (!content.trim()) return; // 댓글이나 답글 내용을 작성하지 않고 제출하지 못하게 한다
        onSubmit(content, parentId); // 내용 전달
        setContent(""); // 입력 초기화
    };

    return <>
        <form onSubmit={handleSubmit} className="mb-3 w-100">
            {/* 댓글과 답글을 입력*/}
            <textarea className="form-control mb-2" rows={4} value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? "답글 내용을 입력하세요" : "댓글 내용을 입력하세요"}
                style={{ resize : "none" }}/>
            <div className="d-flex justify-content-end gap-2">
                <Button type="submit" variant="dark" size="sm">등록</Button>
                {/* 수정하는 경우 취소 버튼 보여주기 */}
                {onCancel && 
                    <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                        취소
                    </Button>
                }
            </div>
        </form>
    </>
};

export default CommentForm;
