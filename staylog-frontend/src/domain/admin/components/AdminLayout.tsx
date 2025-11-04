import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

function AdminLayout() {
  const BASE_PATH = "/admin";
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const OFFCANVAS_ID = "adminOffcanvas";

  const navLinkClass = ({ isActive, isPending }: { isActive: boolean; isPending: boolean }) =>
    `nav-link py-2 ${isActive ? "fw-bold text-primary bg-light" : "text-muted"} ${isPending ? "pending" : ""}`;

  // Bootstrap Offcanvas 수동 닫기 (모바일 전용)
  const closeOffcanvas = () => {
    const el = document.getElementById(OFFCANVAS_ID);
    const inst = (window as any)?.bootstrap?.Offcanvas?.getOrCreateInstance(el);
    inst?.hide();
  };

  // 모바일 메뉴 클릭: 먼저 닫고 → navigate
  const go = (path: string) => () => {
    closeOffcanvas();
    navigate(path);
  };

  // 현재 경로를 기반으로 모바일 메뉴 활성화 표시
  const isActivePath = (path: string) =>
    pathname === path || (path !== BASE_PATH && pathname.startsWith(path));

  return (
    <>
      {/* 📱 모바일 상단: 햄버거 버튼 */}
      <div className="d-lg-none px-3 py-2 border-bottom bg-white sticky-top">
        <button
          className="btn btn-outline-secondary"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target={`#${OFFCANVAS_ID}`}
          aria-controls={OFFCANVAS_ID}
        >
          ☰ 메뉴
        </button>
      </div>

      {/* 🖥️ 데스크톱 레이아웃 */}
      <div className="row g-0">
        {/* 사이드바 (데스크톱 고정) */}
        <div className="col-lg-auto d-none d-lg-block border-end admin-slim bg-light">
          <div className="sticky-top" style={{ top: "80px" }}>
            <div className="p-2">
              <ul className="nav nav-pills flex-column">
                <li className="nav-item mb-1">
                  <NavLink to={`${BASE_PATH}`} className={navLinkClass} end>
                    회원관리
                  </NavLink>
                </li>
                <li className="nav-item mb-1">
                  <NavLink to={`${BASE_PATH}/accommodations`} className={navLinkClass}>
                    숙소관리
                  </NavLink>
                </li>
                <li className="nav-item mb-1">
                  <NavLink to={`${BASE_PATH}/reservations`} className={navLinkClass}>
                    예약관리
                  </NavLink>
                </li>
                <li className="nav-item mb-1">
                  <NavLink to={`${BASE_PATH}/reviews`} className={navLinkClass}>
                    리뷰 게시판 관리
                  </NavLink>
                </li>
                <li className="nav-item mb-1">
                  <NavLink to={`${BASE_PATH}/journals`} className={navLinkClass}>
                    저널 게시판 관리
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="col-lg p-3">
          <Outlet />
        </div>
      </div>

      {/* 📱 모바일 Offcanvas 메뉴 */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        id={OFFCANVAS_ID}
        aria-labelledby="adminOffcanvasLabel"
        data-bs-backdrop="true"
        data-bs-scroll="true"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="adminOffcanvasLabel">
            관리 메뉴
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>

        <div className="offcanvas-body p-0">
          <nav className="nav flex-column">
            <a
              role="button"
              className={`nav-link py-3 px-3 border-bottom ${isActivePath(`${BASE_PATH}`) ? "fw-bold text-primary bg-light" : "text-muted"}`}
              onClick={go(`${BASE_PATH}`)}
            >
              회원관리
            </a>
            <a
              role="button"
              className={`nav-link py-3 px-3 border-bottom ${isActivePath(`${BASE_PATH}/accommodations`) ? "fw-bold text-primary bg-light" : "text-muted"}`}
              onClick={go(`${BASE_PATH}/accommodations`)}
            >
              숙소관리
            </a>
            <a
              role="button"
              className={`nav-link py-3 px-3 border-bottom ${isActivePath(`${BASE_PATH}/reservations`) ? "fw-bold text-primary bg-light" : "text-muted"}`}
              onClick={go(`${BASE_PATH}/reservations`)}
            >
              예약관리
            </a>
            <a
              role="button"
              className={`nav-link py-3 px-3 border-bottom ${isActivePath(`${BASE_PATH}/reviews`) ? "fw-bold text-primary bg-light" : "text-muted"}`}
              onClick={go(`${BASE_PATH}/reviews`)}
            >
              리뷰 게시판 관리
            </a>
            <a
              role="button"
              className={`nav-link py-3 px-3 ${isActivePath(`${BASE_PATH}/journals`) ? "fw-bold text-primary bg-light" : "text-muted"}`}
              onClick={go(`${BASE_PATH}/journals`)}
            >
              저널 게시판 관리
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}

export default AdminLayout;
