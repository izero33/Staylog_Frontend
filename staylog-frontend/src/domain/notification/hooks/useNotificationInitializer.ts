import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../global/store";
import type { RootState } from "../../../global/store/types";
import { useEffect } from "react";
import api from "../../../global/api";



let eventSource: EventSource | null = null;
function useNotificationInitializer() {

   const dispatch = useDispatch<AppDispatch>();

   const token = useSelector((state: RootState) => state.token);
   const userId = useSelector((state: RootState) => state.userInfo?.userId);

   useEffect(() => {
      if (!token || !userId) {
         return
      }

      (async () => {
         try {
            const response = await api.get(`v1/notification/${userId}/unread-count`)
            dispatch({
               type: "SET_UNREAD_COUNT",
               payload: response
            })
         } catch (err) {
            console.log(err);
         }
      })()
   }, [userId, token, dispatch])



   // // 5. [로직 2] 'SSE 연결' 로직
   // //    (token이 변경될 때마다 실행됨)
   // useEffect(() => {
   //    // (A) 토큰이 없으면 (로그아웃)
   //    if (!token) {
   //       if (eventSource) {
   //          eventSource.close();
   //          eventSource = null;
   //          console.log('[SSE Hook] 연결 종료 (로그아웃)');
   //       }
   //       return; // 연결 중지
   //    }

   //    // (B) 토큰이 있는데, 아직 연결이 안 됐다면
   //    if (token && !eventSource) {
   //       console.log('[SSE Hook] 연결 시도...');
   //       const es = new EventSource(`/v1/notification/subscribe?token=${token}`);
   //       eventSource = es; // 인스턴스 저장

   //       es.onopen = () => console.log('[SSE Hook] 연결 성공!');
   //       es.onerror = () => {
   //          console.error('[SSE Hook] 에러 발생, 연결 종료');
   //          es.close();
   //          eventSource = null;
   //          // (여기서 자동 재연결을 막거나, 재시도 로직을 넣을 수 있음)
   //       };

   //       es.addEventListener('new-notification', (event) => {
   //          try {
   //             const newNoti = JSON.parse(event.data);

   //             // TODO: 새 알림 수신 시, 2가지 액션을 디스패치

   //          } catch (e) {
   //             console.error('[SSE Hook] 새 알림 파싱 실패', e);
   //          }
   //       });
   //    }

   //    // (C) React 컴포넌트가 언마운트될 때 (앱 종료 등)
   //    //    *이 훅은 App.tsx에서 사용되므로, 사실상 이 cleanup은 '앱 종료' 시에만 호출됨
   //    return () => {
   //       if (eventSource) {
   //          eventSource.close();
   //          eventSource = null;
   //          console.log('[SSE Hook] 앱 종료로 연결 해제');
   //       }
   //    };

   // }, [token, dispatch]); // 'token'이 이 로직의 유일한 의존성
}

export default useNotificationInitializer;