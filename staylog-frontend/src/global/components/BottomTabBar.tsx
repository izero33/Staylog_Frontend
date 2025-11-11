import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../global/store/types";
import "../../global/css/BottomTabBar.css";

export default function BottomTabBar() {
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.userInfo);
  const role = user?.role?.toLowerCase();

  const requireLogin = (path: string) => {
    if (!user) return navigate("/login", { replace: true, state: { from: path } });
    navigate(path);
  };

  return (
    <nav className="sl-bottom-tab">
      <div className={`sl-tab-grid ${role === "admin" ? "sl-tab-5" : "sl-tab-4"}`}>

        <NavLink to="/" className="sl-tab">
          <i className="bi bi-house-fill" />
          <span>홈</span>
        </NavLink>


        <NavLink to="/journal" className="sl-tab">
          <i className="bi bi-stars" />
          <span>저널</span>
        </NavLink>

        <NavLink to="/review" className="sl-tab">
          <i className="bi bi-chat-square-heart-fill" />
          <span>리뷰</span>
        </NavLink>

        <button className="sl-tab" onClick={() => requireLogin("/mypage")}>
          <i className="bi bi-person-circle" />
          <span>마이</span>
        </button>

        {role === "admin" && (
          <NavLink to="/admin" className="sl-tab">
            <i className="bi bi-shield-lock-fill" />
            <span>관리</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
