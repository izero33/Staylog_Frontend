// src/domain/mypage/pages/index.tsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import MypageSideBar from "../components/MypageSideBar";
import { fetchMemberInfo } from "../api/mypageApi";
import type { MemberInfo } from "../types/mypageTypes";
import type { RootState } from "../../../global/store/types";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";


function index() {
   // 모든 훅은 컴포넌트 최상단에서 선언
   // 토큰에서 userId 가져오기
   const userId = useGetUserIdFromToken();
   
   // Redux에서 로그인한 상태의 닉네임 가져오기 (isLoggedIn은 MyPage에서 직접 사용하지 않음)
   const reduxNickname = useSelector((state: RootState) => state.userInfo?.nickname);   
   
   // 회원정보 상태값
   const [member, setMember] = useState<MemberInfo | null>(null);

   // 회원정보 조회 (userId가 유효할 때만 재조회)
   useEffect(() => {
      if (!userId) {
         // userId가 없으면 회원 정보를 불러올 수 없으므로 member 상태를 초기화
         setMember(null);
         return;
      }
      // Access Token은 api.interceptors.request에서 자동 추가됨
      fetchMemberInfo(userId)
         .then((data) => setMember(data))
         .catch((err) => {
            console.error("회원정보 조회 실패:", err);
            // 이 alert는 전역 인증 처리 훅에서 담당하므로 여기서는 제거
            // alert("회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
            setMember(null); // 에러 발생 시 member 상태 초기화
      });
   }, [userId]); // userId 변경 시에만 실행

   // userId가 없으면 (로그인되지 않은 상태), 아무것도 렌더링하지 않고 전역 인증 훅이 리디렉션하도록 맡김
   if (!userId) {
      return null;
   }

   // userId는 있지만 member 정보가 아직 로딩 중일 때
   if (!member) {
      return <p className="text-center mt-5">회원 정보를 불러오는 중...</p>;
   }

   return (
      <Card className="shadow-sm border-0 w-100">
      <Card.Body className="p-4">
         {/* 상단 인삿말 영역 */}
         <div className="mb-4 text-center text-md-center">
               <h3 className="fw-bold"> {reduxNickname || member.nickname} 님 반가워요 👋 </h3>
               <p className="text-muted mb-0">
                  {new Date(member.createdAt).getFullYear()}년부터 StayLog를 함께하고 있어요.
               </p>
               <hr />
         </div>


      <div className="container my-5">
         <Container fluid className="bg-light min-vh-100">
            <Row>
               
               {/* 왼쪽 사이드 메뉴 */}
               <Col xs={12} md={3} lg={2} className="p-0 bg-white border-end">
                  <MypageSideBar/>
               </Col>

               {/* 오른쪽 콘텐츠 */}
                  {/* 회원정보/예약/리뷰/문의 섹션 - 여기서 하위 라우트가 자동 렌더링됨 */}
                  <Col xs={12} md={9} lg={10} className="d-flex flex-column justify-content-center align-items-center text-center px-0 px-md-3">
                     <Outlet />  
                  </Col>
            </Row>
         </Container>
      </div>
      </Card.Body>
      </Card>
   );
}

export default index;