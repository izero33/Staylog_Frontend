import { Button, Offcanvas } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import NotificationCard from "../components/NotificationCard";
import type { responseNotificationsType } from '../types/NotificationCardType';
import useGetLoginIdFromToken from '../../auth/hooks/useGetLoginIdFromToken';
import api from '../../../global/api';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../global/store/types';

export interface NotiCanvasProps {
   isOpen: boolean;
   onClose: () => void;
}

/**
 * 알림 모달
 * @author 이준혁
 * @param isOpen canvas 활성화 여부
 * @param onClose canvas 비활성화 함수
 */
function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {


   const dispatch = useDispatch();

   // Redux에서 알림 리스트 가져오기
   const notiList = useSelector((state: RootState) => state.notiList);

   const userId: number | undefined = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();

   const [loading, setLoading] = useState(false); // 로딩 상태
   const [errorMsg, setErrorMsg] = useState<string | null>(null); // 에러 상태
   const [hasMore, setHasMore] = useState(true); // 더 로드할 데이터가 있는지 여부

   // 스크롤 이벤트를 감지할 DOM 요소
   const scrollContainerRef = useRef<HTMLDivElement | null>(null);

   // 한 번에 로드할 알림 개수
   const limit = 10;

   
   // 초기화 및 첫 데이터 로드 (isOpen=true로 알림창이 열릴 때마다 실행)
   useEffect(() => {
      if (isOpen && userId) {
         setLoading(true);
         setHasMore(true); // 더 보기 상태 초기화
         setErrorMsg(null);

         (async () => {
            try {
               // limit 값 전달하며 요청
               const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}?limit=${limit}`);

               if (response) {
                  // 알림 전역상태값 덮어쓰기
                  dispatch({
                     type: "SET_NOTIFICATION_LIST",
                     payload: response
                  });

                  // 가져온 개수가 15개 미만이라면 더 이상 로드할 데이터가 없는 것
                  if (response.length < limit) {
                     setHasMore(false);
                  }
               }
            } catch (err) {
               console.error(err);
               setErrorMsg("알림 정보를 불러오지 못했습니다.");
            } finally {
               setLoading(false);
            }
         })();
      }
   }, [userId, isOpen, dispatch]);



   /**
    * 추가 데이터 로드 (무한 스크롤)
    * - 스크롤이 바닥에 닿았을 때 실행
    * - 현재 알림 리스트의 마지막 항목을 커서로 사용
    * - 가져온 데이터를 뒤에 APPEND
    */
   async function getNextNotiData() {

      // 로딩 중이거나, 유저 정보가 없거나, 더 로드할 게 없으면 중단
      if (loading || !userId || !hasMore) {
         return;
      }

      // 리스트가 비어있으면 커서를 찾을 수 없으므로 중단
      if (notiList.length === 0) {
         return;
      }

      setLoading(true);

      try {
         // 마지막 알림을 커서로 사용
         const lastNoti = notiList[notiList.length - 1];
         const lastNotiId = lastNoti.notiId;
         const lastCreatedAt = lastNoti.createdAt;

         const response: responseNotificationsType[] = await api.get(
            `/v1/notification/${userId}?lastCreatedAt=${lastCreatedAt}&lastNotiId=${lastNotiId}&limit=${limit}`
         );

         if (response && response.length > 0) { // 데이터가 있다면
            // 기존 알림 전역 상태값에 추가
            dispatch({
               type: "APPEND_NOTIFICATION_LIST",
               payload: response
            });

            // 가져온 개수가 15개 미만이라면 마지막 페이지
            if (response.length < limit) {
               setHasMore(false);
            }
         } else { // 데이터가 없다면
            setHasMore(false);
         }

      } catch (err) {
         console.error(err);
         setErrorMsg("추가 알림을 불러오지 못했습니다.");
      } finally {
         setLoading(false);
      }
   }


   // 스크롤 이벤트 핸들러
   const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
         // 스크롤이 맨 아래에 도달했는지 확인 (5px 여유)
         if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            getNextNotiData(); // loadMore() 삭제하고 이것만 호출
         }
      }
   };


   // 알림 삭제
   async function handleDelete(notiId: number) {
      if (confirm("알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${notiId}/delete`);

            // Redux 상태 업데이트 -> 네비바 뱃지 자동 반영
            dispatch({
               type: "DELETE_NOTIFICATION",
               payload: notiId
            });
         } catch (err) {
            console.error(err);
         }
      }
   }

   // 전체 알림 삭제
   async function handelDeleteAll() {
      if (notiList.length <= 0) {
         alert('삭제할 알림이 없습니다.');
         return;
      }
      if (confirm("모든 알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${userId}/delete-all`);

            dispatch({
               type: "DELETE_NOTIFICATION_ALL"
            });
         } catch (err) {
            console.error(err);
         }
      }
   }

   // 단일 알림 읽음 처리
   async function handleReadOne(notiId: number) {
      try {
         await api.patch("/v1/notification/read-one", { "notiId": notiId });

         dispatch({
            type: 'READ_ONE',
            payload: notiId
         });
      } catch (err) {
         console.error(err);
      }
   }

   // 모든 알림 읽음 처리
   async function handleReadAll(userId: number | undefined) {
      if (!userId) return;
      try {
         await api.patch("/v1/notification/read-all", { "userId": userId });

         dispatch({
            type: 'READ_ALL'
         });
      } catch (err) {
         console.error(err);
      }
   }


   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <Offcanvas.Header className='ms-4' closeButton>
            <Offcanvas.Title className="fs-4 fw-medium text-dark" id="offcanvasWithBothOptionsLabel">{loginId}</Offcanvas.Title>
            <Button size="sm" variant="secondary" className='ms-4' onClick={() => handleReadAll(userId)}>전체 확인</Button>
            <Button size="sm" variant="danger" className='ms-4' onClick={handelDeleteAll}>전체 삭제</Button>
         </Offcanvas.Header>

         {/* Offcanvas.Body에 ref와 onScroll 이벤트 연결 */}
         <Offcanvas.Body ref={scrollContainerRef} onScroll={handleScroll}>

            {/* notiList 렌더링 */}
            {notiList.length > 0 ? (
               notiList.map((noti) => (
                  <NotificationCard
                     key={noti.notiId}
                     {...noti}
                     handleDelete={() => handleDelete(noti.notiId)}
                     handleReadOne={() => handleReadOne(noti.notiId)}
                     onClose={onClose}
                  />
               ))
            ) : (
               // 로딩이 끝났는데 데이터가 없을 때만 표시
               !loading && !errorMsg && (
                  <div className="text-center text-muted mt-3">알림이 없습니다.</div>
               )
            )}

            {/* 로딩 인디케이터 */}
            {loading && (
               <div className="d-flex align-items-center justify-content-center gap-2 text-muted py-3">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
               </div>
            )}

            {/* 에러 메시지 */}
            {errorMsg && (
               <div className="alert alert-danger mt-3" role="alert">
                  {errorMsg}
               </div>
            )}

         </Offcanvas.Body>
      </Offcanvas>
   );
}

export default NotiCanvas;