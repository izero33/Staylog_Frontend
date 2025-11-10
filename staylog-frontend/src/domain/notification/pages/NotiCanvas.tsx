
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
 * @param isOpen 알림 모달 활성화 여부
 * @param onClose 알림 모달을 닫기 위한 함수
 */
function NotiCanvas({ isOpen, onClose }: NotiCanvasProps) {

   // 한 번에 로드할 알림 개수
   const NOTI_LOAD_COUNT = 15;

   const dispatch = useDispatch();


   // 알림 카드 리스트
   const notiList = useSelector((state: RootState) => state.notiList);
   const getNotiData = useSelector((state: RootState) => state.getNotiData)

   const userId: number | undefined = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();

   // const [getData, setGetData] = useState<boolean>(false)

   // 로딩 / 에러 메시지 상태 관리 
   const [loading, setLoading] = useState(true);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);


   // 화면에 보여줄 알림 개수 상태값
   const [visibleCount, setVisibleCount] = useState(NOTI_LOAD_COUNT);

   // 스크롤 이벤트를 감지할 DOM 요소(Offcanvas.Body)
   const scrollContainerRef = useRef<HTMLDivElement | null>(null);


   // 다음 목록을 로드하는 함수
   const loadMore = () => {
      // 이미 모든 알림을 화면에 보여주고 있다면 함수 종료
      if (visibleCount >= notiList.length) {
         return;
      }
      // 다음 15개를 더 보여주기 위해 count 증가
      setVisibleCount(prevCount => prevCount + NOTI_LOAD_COUNT);
   };

   // 스크롤 이벤트가 발생할 때마다 핸들러 실행
   const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
         // scrollTop: 스크롤바의 현재 수직 위치
         // clientHeight: 요소의 내부 높이 (눈에 보이는 영역)
         // scrollHeight: 스크롤 가능한 전체 높이

         // 스크롤이 맨 아래에 도달했는지 확인 (5px의 여유를 둠)
         if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
            loadMore(); // 아래에 닿으면 다음 목록 로드
         }
      }
   };


   // 알림 리스트 요청
   useEffect(() => {
      setLoading(true)

      // 캔버스가 열릴 때마다 보여줄 개수를 초기화
      setVisibleCount(NOTI_LOAD_COUNT);

      // 이미 값을 가져왔다면 리소스 아끼기
      // if(notiList.length != 0) {
      if (getNotiData) { // 이미 데이터를 가져왔다면
         console.log("이미 값이 있으므로 재요청하지 않고 return");
         console.log(notiList);
         setLoading(false)
         return
      }

      (async () => {
         if (!userId) {
            setLoading(false);
            return
         }

         try {
            const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}`)
            if (response != null) { // 알림 목록이 있을때만
               // 알림 리스트 저장 액션
               dispatch({
                  type: "SET_NOTIFICATION_LIST",
                  payload: response
               })
            }

            // setGetData(true) // 데이터 조회 유무 상태값 변경

         } catch (err) {
            console.log(err);
            setErrorMsg("알림 정보를 불러오지 못했습니다.")
         } finally {
            setLoading(false)
         }
      })()
   }, [userId, isOpen, getNotiData, dispatch])


   // 알림 삭제
   async function handleDelete(notiId: number) {
      if (confirm("알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${notiId}/delete`)

            // // 상태값에 반영하여 화면 렌더링
            // setNotiList((prevNotiList) =>
            //    prevNotiList.filter((noti) => noti.notiId !== notiId)
            // );

            // 알림 삭제 액션
            dispatch({
               type: "DELETE_NOTIFICATION",
               payload: notiId
            })

         } catch (err) {
            console.log(err);
         }
      } else {
         return
      }
   }

   // 전체 알림 삭제
   async function handelDeleteAll() {
      if(notiList.length <= 0) {
         alert('삭제할 알림이 없습니다.')
         return
      }
      if (confirm("모든 알림을 삭제하시겠습니까?")) {
         console.log("유저 PK는 ", userId);

         try {
            await api.delete(`/v1/notification/${userId}/delete-all`)
            dispatch({
               type: "DELETE_NOTIFICATION_ALL"
            })
         } catch (err) {
            console.log(err);

         }
      }
   }


   // 단일 알림 읽음 처리
   async function handleReadOne(notiId: number) {
      try {
         await api.patch("/v1/notification/read-one", { "notiId": notiId })

         // 단일 읽음 처리 액션
         dispatch({
            type: 'READ_ONE',
            payload: notiId
         });

      } catch (err) {
         console.log(err);
      }
   }


   // 모든 알림 읽음 처리
   async function handleReadAll(userId: number | undefined) {
      try {
         await api.patch("/v1/notification/read-all", { "userId": userId })

         // 모든 알림 읽음 처리 액션
         dispatch({
            type: 'READ_ALL'
         });

      } catch (err) {
         console.log(err);
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

            {/* 로딩 / 에러 상태 */}
            {loading && (
               <div className="d-flex align-items-center gap-2 text-muted">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
               </div>
            )}
            {!loading && errorMsg && (
               <div className="alert alert-danger" role="alert">
                  {errorMsg}
               </div>
            )}

            {
               !loading && notiList.length > 0
                  ? (
                     notiList.slice(0, visibleCount).map((noti) => ( // 정해진 개수 출력
                        // notiList.map((noti) => ( // 전체 출력
                        <NotificationCard key={noti.notiId} {...noti} handleDelete={() => handleDelete(noti.notiId)} handleReadOne={() => { handleReadOne(noti.notiId) }} onClose={onClose} />
                     ))
                  )
                  // 알림이 없다면 출력
                  : !loading && !errorMsg && (
                     <div className="text-center text-muted mt-3">알림이 없습니다.</div>
                  )
            }
         </Offcanvas.Body>
      </Offcanvas>
   );
}


export default NotiCanvas;