// src/domain/mypage/pages/index.tsx
import { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
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
   //Redux 에서 로그인 한 상태 확인 (닉네임 가져오기)   
   const nickname = useSelector((state: RootState) => state.userInfo?.nickname);
   // 회원정보 상태값
   const [member, setMember] = useState<MemberInfo | null>(null);
   const [activeMenu, setActiveMenu] = useState("member");


   // 회원정보 조회 (닉네임이 바뀔 때마다 재조회)
   useEffect(() => {
      if (!userId) return;
      // Access Token은 api.interceptors.request에서 자동 추가됨
      fetchMemberInfo(userId)
         .then((data) => setMember(data))
         .catch((err) => {
            console.error("회원정보 조회 실패:", err);
            alert("회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      });
   }, [userId]);

      // 로딩 시 메시지 (null 방지하기 위해서, 조건부 렌더링 추가)
      if (!member) {
         return <p className="text-center mt-5">회원 정보를 불러오는 중...</p>;
      }

   return (
      <div className="container my-5">
         <Container fluid className="bg-light min-vh-100">
            <Row>
               {/* 왼쪽 사이드 메뉴 */}
               <Col xs={12} md={3} lg={2} className="p-0 bg-white border-end">
                  <MypageSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
               </Col>

               {/* 오른쪽 콘텐츠 */}
                  <Col xs={12} md={9} lg={10} className="d-flex flex-column justify-content-center align-items-center text-center">
                     {/* 회원정보/예약/리뷰/문의 섹션 - 여기서 하위 라우트가 자동 렌더링됨 */}
                     <Outlet />  
                  </Col>
            </Row>
         </Container>
      </div>
   );
}

export default index;