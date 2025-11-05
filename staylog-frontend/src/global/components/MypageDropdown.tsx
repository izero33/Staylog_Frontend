// src/global/components/MypageDropdown.tsx
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Redux 디스패치 훅 import
import { logout } from "../../domain/auth/api"; // 로그아웃 API 함수 import
import { useState } from "react";
import type { ModalMode } from "../types";
import Modal from "./Modal";

interface MypageDropdownProps {
  onClose: () => void; // Navbar.tsx 에서 넘겨준 onClose 받는다.
}

function MypageDropdown({ onClose }: MypageDropdownProps) {
        const navigate = useNavigate();
        const dispatch = useDispatch(); // Redux 디스패치 훅 사용

    // 드롭다운 메뉴 선택 핸들러 (로그아웃)
    const handleLogout = async () => {
        try {
        // 1) 백엔드에 refreshToken 삭제 요청
        await logout();

        // 2) 프론트 상태 초기화 (redux userInfo, auth 등 비우기)
        dispatch({ type: "LOGOUT" });

        // 3) 혹시 모를 로컬 스토리지 토큰도 제거
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // 4) 드롭다운 닫기
        onClose();

        // 5) 메인 or 로그인으로 이동
        navigate("/");
        } catch (err) {
        console.error("로그아웃 실패:", err);
        alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // ✅ 드롭다운 메뉴 선택 핸들러
    const handleSelect = (eventKey: string | null) => {
        if (!eventKey) return;

        // 🔴 로그아웃일 때는 따로 처리
        if (eventKey === "logout") {
        void handleLogout();
        return;
        }

        // ✅ 나머지는 /mypage/... 로 이동
        navigate(`/mypage/${eventKey}`);
        onClose();
    }; 


    // ====== 쿠폰함 모달을 사용하기 위한 상태값과 함수 ======

    // 모달 활성화 관리 상태값
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // 모달 모드 상태값
    const [modalMode, setModalMode] = useState<ModalMode>('coupon-view');

    // 모드값을 인자로 받고 모달창을 여는 함수
    function openModal(mode: ModalMode) {
        setModalMode(mode);
        setIsModalOpen(true);
    }

    // 모달창을 닫는 함수 (Modal 컴포넌트로 전달됨)
    function closeModal() {
        setIsModalOpen(false);
    }


    return (
        <>
        <Dropdown align="end" onSelect={handleSelect}>
        {/* 아이콘이 토글 역할을 하도록 만든다 */}
        <Dropdown.Toggle
            variant="light"
            id="mypage-dropdown"
            className="border-0 bg-transparent p-0"
        >
            <i className="bi bi-person-circle" style={{ fontSize: "32px" }}></i>
        </Dropdown.Toggle>

        {/* react-bootstrap이 자동으로 아이콘 기준 위치를 움직이게 한다 */}
        <Dropdown.Menu className="shadow-sm mt-2">
            <Dropdown.Header className="fw-bold text-center">마이페이지</Dropdown.Header>
            <Dropdown.Divider />

            <Dropdown.Item eventKey="member">회원 정보</Dropdown.Item>
            <Dropdown.Item eventKey="reservations">예약 정보</Dropdown.Item>
            <Dropdown.Item eventKey="reviews">리뷰 내역</Dropdown.Item>
            <Dropdown.Item eventKey="inquiries">문의 내역</Dropdown.Item>
            <Dropdown.Item onClick={() => openModal('coupon-view')}>내 쿠폰함</Dropdown.Item>
            <Dropdown.Item onClick={() => openModal('coupon-select')}>내 쿠폰함22</Dropdown.Item>

            <Dropdown.Divider />
            <Dropdown.Item eventKey="logout" className="text-danger text-center fw-semibold">로그아웃</Dropdown.Item>
        </Dropdown.Menu>
        </Dropdown>

        {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} />
        }

        </>
    );
}

export default MypageDropdown;
