// src/global/components/MypageDropdown.tsx
import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface MypageDropdownProps {
  onClose: () => void; // Navbar.tsx 에서 넘겨준 onClose 받는다.
}

function MypageDropdown({ onClose }: MypageDropdownProps) {
    const navigate = useNavigate();

    // 드롭다운 메뉴 선택 핸들러 (로그아웃)
    const handleSelect = (eventKey: string | null) => {
        if (!eventKey) return;

        if (eventKey === "logout") {
            //localStorage에 저장된 accessToken 제거
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken"); // 혹시 refreshToken도 있으면 같이 삭제

        // 로그아웃 알림
        alert("로그아웃 완료!");
        // 로그아웃 로직 (redux 초기화나 localStorage 삭제 등) 드롭다운 닫고, 메인 페이지로 이동
        onClose(); // 드롭다운 닫기
        navigate("/login"); // 또는 navigate("/") 로 홈으로
        return;
        }

        // /mypage/... 로 이동
        navigate(`/mypage/${eventKey}`);
        onClose(); // 이동 후 드롭다운 닫기
    };    

    return (
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

            <Dropdown.Divider />
            <Dropdown.Item eventKey="logout" className="text-danger text-center fw-semibold">로그아웃</Dropdown.Item>
        </Dropdown.Menu>
        </Dropdown>
    );
}

export default MypageDropdown;
