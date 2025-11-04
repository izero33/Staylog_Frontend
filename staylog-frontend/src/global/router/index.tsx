// src/global/router/index.tsx
import { createHashRouter, type RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import LoginForm from "../../domain/auth/pages/LoginForm";
import App from "../../App";
import SignupForm from "../../domain/auth/pages/SignupForm";
import RoomDetail from "../../domain/accommodation/pages/RoomDetail";
import AdminLayout from "../../domain/admin/components/AdminLayout";
import AdminUserPage from "../../domain/admin/pages/AdminUserPage";
import AdminAccommodationPage from "../../domain/admin/pages/AdminAccommodationPage";
import AdminReservationPage from "../../domain/admin/pages/AdminReservationPage";
import AdminRoomPage from "../../domain/admin/pages/AdminRoomPage";
// import { ReservationProvider } from "../../domain/accommodation/hooks/useReservation"; // 사용되지 않아 주석 유지
import AccommodationDetail from "../../domain/accommodation/pages/AccommodationDetail";
// 게시판 관련 페이지
import Journal from "../../domain/board/pages/Journal";
import Review from "../../domain/board/pages/Review";
import ReviewDetail from "../../domain/board/pages/ReviewDetail";
import BoardForm from "../../domain/board/pages/BoardForm";
import AccommodationListPage from "../../domain/accommodation/pages/AccommodationListPage";
import MyPage from "../../domain/mypage/pages";
import MemberInfoSection from "../../domain/mypage/pages/MemberInfoSection";
import ReservationSection from "../../domain/mypage/pages/ReservationSection";
import ReviewSection from "../../domain/mypage/pages/ReviewSection";
import InquirySection from "../../domain/mypage/pages/InquirySection";
import TestForm from "../pages/TestForm"; // Import TestForm
import TestLoadImage from "../pages/TestLoadImage";


// routes 배열: 중첩되지 않는 최상위 경로만 포함 (Admin, Mypage 라우트 객체는 분리)
const routes: RouteObject[] = [
  { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
  { path: "/", element: <Home /> },
  { path: "/login", element: <LoginForm /> },
  { path: "/review", element: <Review /> },
  { path: "/journal", element: <Journal /> },
  { path: "/boardForm", element: <BoardForm /> },
  { path: "/review/:boardId", element: <ReviewDetail /> },
  { path: "/signup", element: <SignupForm /> },
  { path: "/accommodations", element: <AccommodationListPage /> }, // 숙소 리스트 페이지
  { path: "/accommodations/:id", element:<AccommodationDetail />},
  { path: "/room/:roomId", element: <RoomDetail />},
  { path: "/test-form", element: <TestForm /> },
  { path: "/test-load", element: <TestLoadImage /> },
];

// Admin 중첩 라우트 객체를 별도로 정의
const adminRoute: RouteObject = {
    path: "admin", // 부모 경로는 상대 경로로 사용
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminUserPage /> },  // /admin 기본 페이지
      { path: "user", element: <AdminUserPage /> },
      { path: "accommodations", element: <AdminAccommodationPage /> },
      { path: "accommodations/:accommodationId/rooms", element: <AdminRoomPage /> },
      { path: "reservations", element: <AdminReservationPage /> },
      { path: "reviews", element: <div>리뷰 게시판 관리 페이지</div> },
      { path: "journals", element: <div>저널 게시판 관리 페이지</div> },
    ],
};

// 마이페이지 - 중첩 라우트 객체를 별도로 정의 (부모/자식 라우트 구조)
const mypageRoute: RouteObject = {  
    path: "mypage",
    element: <MyPage />,
    children: [
        { index: true, element: <MemberInfoSection /> }, 
        { path: "member", element: <MemberInfoSection /> },
        { path: "reservations", element: <ReservationSection /> },
        { path: "reviews", element: <ReviewSection /> },
        { path: "inquiries", element: <InquirySection /> },
    ],
};


// router 객체 생성 시, 모든 경로를 <App />의 children으로 통합하여 매핑
const router = createHashRouter([{
    path: "/",
    element: <App />, // <App />을 최상위 레이아웃으로 설정
    children: [
        // 일반 경로 매핑
        ...routes.map((route) => ({
            // path가 "/"인 경우 index: true로 처리하고, path는 제거합니다.
            index: route.path === "/",
            path: route.path === "/" ? undefined : route.path?.startsWith('/') ? route.path.substring(1) : route.path, // / 제거하고 상대 경로로 변환
            element: route.element,
        })),
        // 중첩 Admin 경로 추가
        adminRoute,
        mypageRoute

    ]
}]);

export default router;