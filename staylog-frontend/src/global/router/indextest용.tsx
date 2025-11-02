// // src/global/router/index.tsx
// import { createHashRouter, type RouteObject } from "react-router-dom";
// import Home from "../pages/Home";
// import LoginForm from "../../domain/auth/pages/LoginForm";
// import App from "../../App";
// import SignupForm from "../../domain/auth/pages/SignupForm";
// import RoomDetail from "../../domain/accommodation/pages/RoomDetail";
// import AccommodationDetail from "../../domain/accommodation/pages/AccommodationDetail";
// import { ReservationProvider } from "../../domain/accommodation/hooks/useReservation";
// import AdminPage from "../../domain/admin/pages/AdminPage";
// // 마이페이지 관련 import
// import MyPage from "../../domain/mypage/pages";
// import MemberInfoSection from "../../domain/mypage/pages/MemberInfoSection";
// import ReservationSection from "../../domain/mypage/pages/ReservationSection";
// import ReviewSection from "../../domain/mypage/pages/ReviewSection";
// import InquirySection from "../../domain/mypage/pages/InquirySection";


// // routes 배열: 중첩되지 않는 최상위 경로만 포함 (Admin, Mypage 라우트 객체는 분리)
// const routes: RouteObject[] = [
//   { path: "/index.html", element: <Home /> }, // spring boot 최초 실행 정보 추가
//   { path: "/", element: <Home /> },
//   { path: "/login", element: <LoginForm /> },
//   { path: "/signup", element: <SignupForm /> },
//   { path: "/room/:roomId", element: <RoomDetail /> },
//   { path: "/accommodations/:id", element:<AccommodationDetail />},
//   { path: "/admin", element: <AdminPage /> },
// ];  

//   // 마이페이지 - 중첩 라우트 객체를 별도로 정의 (부모/자식 라우트 구조)
//   const mypageRoute: RouteObject = {  
//     path: "/mypage",
//     element: <MyPage />,
//     children: [
//       { path: "member", element: <MemberInfoSection /> },
//       { path: "reservation", element: <ReservationSection /> },
//       { path: "review", element: <ReviewSection /> },
//       { path: "inquiry", element: <InquirySection /> },
//     ],
//   };

// // router 객체 생성 시, 모든 경로를 <App />의 children으로 통합하여 매핑
// const router = createHashRouter([{
//     path: "/",
//     element: <App />, // <App />을 최상위 레이아웃으로 설정
//     children: [
//         // 일반 경로 매핑
//         ...routes.map((route) => ({
//             // path가 "/"인 경우 index: true로 처리하고, path는 제거합니다.
//             index: route.path === "/",
//             path: route.path === "/" ? undefined : route.path?.startsWith('/') ? route.path.substring(1) : route.path, // / 제거하고 상대 경로로 변환
//             element: route.element,
//         })),
//         // 중첩 mypage 경로 추가
//         mypageRoute
//     ]
// }]);

// export default router;