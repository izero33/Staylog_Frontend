
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



   // 알림 리스트 요청
   useEffect(() => {
      (async () => {
         if (!userId) {
            return
         }
         try {
            const response: responseNotificationsType[] = await api.get(`/v1/notification/${userId}`)

            dispatch({
               type: "SET_NOTIFICATION_LIST",
               payload: response
            })

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

            // // 상태값에 반영하여 화면 렌더링
            // setNotiList((prevNotiList) =>
            //    prevNotiList.filter((noti) => noti.notiId !== notiId)
            // );

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

         // API 성공 시, Redux 스토어에 반영
         dispatch({
            type: 'MARK_ONE_AS_READ',
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

         // API 성공 시, Redux 스토어에 반영
         dispatch({
            type: 'MARK_ALL_AS_READ'
         });

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