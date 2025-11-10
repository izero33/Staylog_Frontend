// MypageSideBar.tsx
import { Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";

function MypageSideBar() {
   const navigate = useNavigate();
   const location = useLocation(); // 현재 위치(URL) 정보를 가져옴

   // 현재 URL 경로에서 마지막 부분을 활성 메뉴 키로 사용 (예: /mypage/reviews -> reviews)
   const activeMenu = location.pathname.split("/").pop() || "member";

   const menus = [
      { key: "member", label: "회원 정보" },
      { key: "reservations", label: "예약 정보" },
      { key: "reviews", label: "리뷰 내역" },
   ];

   const handleClick = (key: string) => {
      navigate(`/mypage/${key}`);
   };

   return (
      <div className="d-flex flex-column">
         <h5 className="fw-bold text-center py-3 border-bottom mb-0">마이페이지</h5>
         {menus.map((menu) => (
            <Button
               key={menu.key}
               variant={activeMenu === menu.key ? "dark" : "light"}
               className={`text-start py-3 px-4 border-bottom rounded-0 ${
                  activeMenu === menu.key ? "text-white" : "text-dark"
               }`}
               onClick={() => handleClick(menu.key)}
            >
               {menu.label}
            </Button>
         ))}
      </div>
   );
}

export default MypageSideBar;
