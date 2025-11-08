
import { Button, Offcanvas } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
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



   const dispatch = useDispatch();


   // 알림 카드 리스트
   const notiList = useSelector((state: RootState) => state.notiList);

   const userId: number | undefined = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();

   const [getData, setGetData] = useState<boolean>(false)

   
   // 로딩 / 에러 메시지 상태 관리 
   const [loading, setLoading] = useState(true);
   const [errorMsg, setErrorMsg] = useState<string | null>(null);



   // 알림 리스트 요청
   useEffect(() => {
      setLoading(true)

      // 이미 값을 가져왔다면 리소스 아끼기
      // if(notiList.length != 0) {
      if(getData) { // 이미 데이터를 가져왔다면
         console.log("이미 값이 있으므로 재요청하지 않고 return");
         console.log(notiList);
         setLoading(false)
         return
      }
      
      (async () => {
         if (!userId) {
            return
         }
         try {
            const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}`)

            // 알림 리스트 저장 액션
            dispatch({
               type: "SET_NOTIFICATION_LIST",
               payload: response
            })
            setGetData(true) // 데이터 유무 상태값 변경

         } catch (err) {
            console.log(err);
            setErrorMsg("알림 정보를 불러오지 못했습니다.")
         } finally {
            setLoading(false)
         }
      })()
   }, [userId])


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
         </Offcanvas.Header>

         <Offcanvas.Body>

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
               notiList.length > 0
                  ? (
                     notiList.map((noti) => (
                        <NotificationCard key={noti.notiId} {...noti} handleDelete={() => handleDelete(noti.notiId)} handleReadOne={() => { handleReadOne(noti.notiId) }} onClose={onClose}/>
                     ))
                  )
                  : ("")
            }
         </Offcanvas.Body>
      </Offcanvas>
   );
}


export default NotiCanvas;