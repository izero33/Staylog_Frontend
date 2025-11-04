// src/components/common/AlertModal.tsx
import { Modal, Button, ModalFooter } from "react-bootstrap";

// type AlertType = "success" | "error" | "info"; // 추후 필요 시 타입 확장 가능(타입별 모달 색상 구분 옵션)

interface AlertModalProps {
    show: boolean; // 모달 표시 여부
    message: string; // 표시할 메시지
    onClose: () => void; // 닫기 이벤트
    confirmText?: string;// 확인 버튼 텍스트 (기본: "확인")
    //type?: AlertType; // 추후 필요 시 타입 확장 가능(타입별 모달 색상 구분 옵션)
}

/**
 * Mypage 공통 알림 모달 컴포넌트
 * message만 바꿔서 재활용 가능. 
 * 닫기 버튼(X) 클릭이나 “확인” 클릭 시 onClose() 실행. props로 버튼 텍스트(confirmText)도 커스터마이징 가능.
 * @description 성공, 오류, 안내 등의 알림에 공통적으로 사용 가능
 * @example <AlertModal show={show} message="저장되었습니다." onClose={handleClose} />
 */
function AlertModal({ show, message, onClose, confirmText = "확인" }: AlertModalProps) {
    return (
        <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false} animation={true}>
        {/* 상단 헤더 */}
        <Modal.Header closeButton className="border-0 pb-0" style={{backgroundColor:"#212529", color: "#fff", borderTopLeftRadius: "10px", borderTopRightRadius: "10px",}} >
            <Modal.Title className="fs-6 fw-semibold">알림</Modal.Title>   
        </Modal.Header>
        {/* 모달 본문 */}
        <Modal.Body className="text-center py-4" style={{ fontSize: "1rem", color: "#212529" }}>
            <p className="mb-0" style={{ whiteSpace: "pre-line", wordBreak: "keep-all" }}>{message}</p>
        </Modal.Body>
        {/* 모달 하단 버튼 */}
        <Modal.Footer className="border-0 d-flex justify-content-center pb-4">  
            <Button variant="dark" onClick={onClose} className="px-4 py-2 rounded-3 fw-semibold">
                {confirmText}
            </Button>
        </Modal.Footer>

        </Modal>
    );
}

export default AlertModal;
