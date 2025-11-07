// MypageSideBar.tsx
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface SideBarProps {
   activeMenu: string;
   setActiveMenu: (key: string) => void;
}

function MypageSideBar({ activeMenu, setActiveMenu }: SideBarProps) {
   const navigate = useNavigate();


   const menus = [
      { key: "member", label: "회원 정보" },
      { key: "reservations", label: "예약 정보" },
      { key: "reviews", label: "리뷰 내역" },
   ];

   const handleClick = (key: string) => {
   setActiveMenu(key);               // 상태 변경
   navigate(`/mypage/${key}`);       // URL 변경
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

