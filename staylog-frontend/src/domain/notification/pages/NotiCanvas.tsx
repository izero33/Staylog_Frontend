
import { Button, Offcanvas } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import NotificationCard from "../components/NotificationCard";
import type { responseNotificationType } from '../types/NotificationCardType';
import useGetLoginIdFromToken from '../../auth/hooks/useGetLoginIdFromToken';
import api from '../../../global/api';
import useGetUserIdFromToken from '../../auth/hooks/useGetUserIdFromToken';

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


   // 알림 카드 리스트
   const [notiList, setNotiList] = useState<responseNotificationType[]>([])

   const userId: number | undefined = useGetUserIdFromToken();
   const loginId = useGetLoginIdFromToken();



   // 알림 리스트 요청
   useEffect(() => {
      (async () => {
         if (!userId) {
            return
         }
         try {
            const response: responseNotificationType[] = await api.get(`/v1/notification/${userId}`)

            // // 알림 리스트에 업데이트할 변수
            // const processedList: NotificationCardState[] = response.map((rawItem) => {

            //    // JSON 파싱 후 알림 카드에서 사용할 수 있는 데이터로 가공
            //    let details: any = {};
            //    try {
            //       details = JSON.parse(rawItem.details)
            //    } catch (err) {
            //       console.error("JSON parse error:", rawItem.details, err);
            //    }
            //    return notificationFormatter({ rawItem, details });
            // })

            // 완성된 데이터로 상태값 변경
            setNotiList(response)

         } catch (err) {
            console.log(err);
         }
      })()
   }, [userId])


   // 알림 삭제
   async function handleDelete(notiId: number) {
      if (confirm("알림을 삭제하시겠습니까?")) {
         try {
            await api.delete(`/v1/notification/${notiId}/delete`)

            // 상태값에 반영하여 화면 렌더링
            setNotiList((prevNotiList) =>
               prevNotiList.filter((noti) => noti.notiId !== notiId)
            );
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

         // 상태값에 반영하여 화면 렌더링
         setNotiList((prevNotiList) =>
            prevNotiList.map((noti) =>
               noti.notiId === notiId ? { ...noti, isRead: 'Y' } : noti
            )
         );

      } catch (err) {
         console.log(err);
      }
   }


   // 모든 알림 읽음 처리
   async function handleReadAll(userId: number | undefined) {

      try {
         await api.patch("/v1/notification/read-all", { "userId": userId })

         // 상태값에 반영하여 화면 렌더링
         setNotiList((prevNotiList) =>
            prevNotiList.map((noti) => ({
               ...noti,
               isRead: 'Y'
            }))
         );

      } catch (err) {
         console.log(err);
      }
   }



   return (
      <Offcanvas show={isOpen} onHide={onClose} placement="end" scroll={true} style={{ "--bs-offcanvas-width": "450px" } as React.CSSProperties} id="offcanvasWithBothOptions" aria-labelledby="offcanvasWithBothOptionsLabel">
         <Offcanvas.Header closeButton>
            <Offcanvas.Title id="offcanvasWithBothOptionsLabel">{loginId}</Offcanvas.Title>
            <Button onClick={() => handleReadAll(userId)}>모든 알림 읽기 처리</Button>
         </Offcanvas.Header>

         <Offcanvas.Body>
            {
               notiList.length > 0
                  ? (
                     notiList.map((noti) => (
                        <NotificationCard key={noti.notiId} {...noti} handleDelete={() => handleDelete(noti.notiId)} handleReadOne={() => { handleReadOne(noti.notiId) }} />
                     ))
                  )
                  : ("")
            }
         </Offcanvas.Body>
      </Offcanvas>
   );
}


export default NotiCanvas;