import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar as BootstrapNavbar, Container, Nav, Form, FormControl } from 'react-bootstrap'; // Navbar를 BootstrapNavbar로 별칭 지정
import Modal from "./Modal";
import type { ModalMode } from "../types/ModalMode";
import NotiCanvas from "../../domain/notification/pages/NotiCanvas";
import SearchModal from "../../domain/search/components/SearchModal";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/types";
import MypageDropdown from "./MypageDropdown"; // 마이페이지 사람아이콘 드롭다운 컴포넌트
import { logout } from "../../domain/auth/api";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; // Bootstrap의 JS 동작 추가


function Navbar() {
   const dispatch = useDispatch();
   const navigate = useNavigate();

   const nickname = useSelector((state: RootState) => state.userInfo?.nickname); // 없을 수도 있으니 -> ?.


   const notiUnreadCount = useSelector((state: RootState) => state.notiUnreadCount);

   /** 로그아웃 api 호출 (refreshToken만 삭제됨, dispath LOGOUT (localstorage의 AccessToken삭제)로 프론트 상태 초기화 */
   const handleLogout = async () => {
      try {
         await logout(); //  백엔드에서는 refreshToken만 삭제됨

         dispatch({ type: 'LOGOUT' }); // 프론트 상태 초기화 

         navigate('/'); // 홈으로 리다이렉트
      } catch (err) {
         console.error('로그아웃 실패:', err);
      }
   };

   // 모달 활성화 관리 상태값
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

   // 모달 모드 상태값
   const [modalMode, setModalMode] = useState<ModalMode>('login');

   // 모드값을 인자로 받고 모달창을 여는 함수
   function openModal(mode: ModalMode) {
      setModalMode(mode);
      setIsModalOpen(true);
   }

   // 모달창을 닫는 함수 (Modal 컴포넌트로 전달됨)
   function closeModal() {
      setIsModalOpen(false);
   }

   // 검색 모달 활성화 관리 상태값
   const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

   // 검색 모달창을 여는 함수
   function openSearchModal() {
      setIsSearchModalOpen(true);
   }

   // 검색 모달창을 닫는 함수
   function closeSearchModal() {
      setIsSearchModalOpen(false);
   }


   // 알림창 활성화 관리 상태값
   const [isNotiOpen, setIsNotiOpen] = useState<boolean>(false);

   // 알림창을 여는 함수
   function openNoti() {
      setIsNotiOpen(true);
   }

   // 모달창을 닫는 함수 (NotiCanvas 컴포넌트로 전달됨)
   function closeNoti() {
      setIsNotiOpen(false);
   }

   // 마이페이지 아이콘 드롭다운 표시 여부
   const [isMypageOpen, setIsMypageOpen] = useState<boolean>(false);

   // 클릭 시 동작
   const handleProfileClick = () => {
      if (nickname) {
         // 로그인 되어 있으면 드롭다운 토글
         setIsMypageOpen(!isMypageOpen);
      } else {
         // 로그인 안 되어 있으면 로그인 모달 오픈
         openModal("login");
      }
   };
   const role = useSelector((state: RootState) => state.userInfo?.role);
   const isAdmin = (r?: string) => String(r ?? '').toLowerCase() === 'admin';

   return (
      <>
         <BootstrapNavbar expand="lg" fixed="top" className="border-bottom border-1 border-secondary shadow-sm" style={{ backgroundColor: '#ebebebff' }}>
            <Container fluid className="w-75">
               <BootstrapNavbar.Brand as={Link} to="/" className="flex-fill fs-3 fw-normal">STAYLOG</BootstrapNavbar.Brand>
               <BootstrapNavbar.Toggle aria-controls="responsive-navbar-nav" />
               <BootstrapNavbar.Collapse id="responsive-navbar-nav">
                  <Form className="d-flex flex-fill my-2 my-lg-0">
                     <FormControl
                        onClick={openSearchModal}
                        placeholder="Search"
                        aria-label="Search"
                        readOnly
                        style={{ cursor: 'pointer' }}
                     />
                  </Form>

                  <Nav className="flex-fill justify-content-center">
                     <Nav.Link as={NavLink} to="/stay">STAY</Nav.Link>
                     <Nav.Link as={NavLink} to="/review">COMMUNITY</Nav.Link>
                     <Nav.Link as={NavLink} to="/journal">JOURNAL</Nav.Link>
                       {isAdmin(role) && (
                           <>
                             <span className="mx-2 text-secondary">|</span>
                             <Nav.Link as={NavLink} to="/admin">ADMIN</Nav.Link>
                           </>
                         )}
                  </Nav>

                  <Nav className="flex-fill justify-content-end align-items-center gap-4">
                     {nickname ? (
                        <>
                           <BootstrapNavbar.Text className="fw-semibold">{nickname}</BootstrapNavbar.Text>
                           <Nav.Item> {/* MypageDropdown을 Nav.Item으로 감쌈 */}
                              <MypageDropdown onClose={() => {}} />
                           </Nav.Item>
                           <Nav.Item onClick={openNoti} className="position-relative" style={{ cursor: 'pointer' }}>
                              <i className="bi bi-bell-fill" style={{ fontSize: '32px' }}></i>
                              {notiUnreadCount > 0 && (
                                 <span className="position-absolute start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.75rem', top: '5px' }}>
                                    {notiUnreadCount > 9 ? '9+' : notiUnreadCount}
                                 </span>
                              )}
                           </Nav.Item>
                           <button
                              className="btn btn-outline-dark px-3 py-1"
                              onClick={handleLogout}
                           >
                              LOGOUT
                           </button>
                        </>
                     ) : (
                        <Nav.Item onClick={() => openModal("login")} style={{ cursor: 'pointer' }}>
                           <i className="bi bi-person-circle" style={{ fontSize: '32px' }}></i>
                        </Nav.Item>
                     )}
                  </Nav>
               </BootstrapNavbar.Collapse>
            </Container>
         </BootstrapNavbar>

         {isModalOpen && <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            mode={modalMode} />
         }

         {
            isSearchModalOpen && <SearchModal
               isOpen={isSearchModalOpen}
               onClose={closeSearchModal} />
         }

         {
            isNotiOpen && <NotiCanvas
               isOpen={isNotiOpen}
               onClose={closeNoti} />
         }
      </>
   );
}

export default Navbar;
