import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../../global/store";
import type { RootState } from "../../../global/store/types";
import { useEffect } from "react";
import api from "../../../global/api";


/**
 * 최상위 컴포넌트에서 사용할 SSE 연결 훅
 * @author 이준혁
 */
let eventSource: EventSource | null = null;
function useNotificationInitializer() {

   const dispatch = useDispatch<AppDispatch>();

   const token = useSelector((state: RootState) => state.token);
   const userId = useSelector((state: RootState) => state.userInfo?.userId);


   // SSE 연결
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


   // 새 알림 추가
   useEffect(() => {
      // 토큰 없으면 연결 종료
      if (!token) {
         if (eventSource) {
            eventSource.close();
            eventSource = null;
            console.log('SSE Hook 연결 종료 (로그아웃)');
         }
         return;
      }

      // 토큰이 있는데 아직 연결이 안 됐다면
      if (token && !eventSource) {

         // Bearer 제거
         const pureToken = token ? token.substring(7) : '';
         console.log('SSE Hook 연결 시도...');

         const es = new EventSource(`api/v1/notification/subscribe?token=${pureToken}`);
         eventSource = es; // 인스턴스 저장

         es.onopen = () => console.log('SSE Hook 연결 성공');
         es.onerror = () => {
            console.error('SSE Hook 에러 발생, 연결 종료');
            es.close();
            eventSource = null;
            // (여기서 자동 재연결을 막거나, 재시도 로직을 넣을 수 있음)
         };

         // 새로운 알림 추가 시 발생하는 이벤트
         es.addEventListener('new-notification', (event) => {
            try {
               const newNoti = JSON.parse(event.data);
               
               // 새로운 알림 추가 액션
               dispatch({
                  type: 'PUSH_NOTIFICATION',
                  payload: newNoti
               });

               // 안읽은 알림 수 증가 액션
               dispatch({
                  type: 'INCREMENT_UNREAD_COUNT'
               });

            } catch (e) {
               console.error('[SSE Hook] 새 알림 파싱 실패', e);
            }
         });
      }

      // React 컴포넌트가 언마운트될 때
      return () => {
         if (eventSource) {
            eventSource.close();
            eventSource = null;
            console.log('SSE Hook 종료로 연결 해제');
         }
      };

   }, [token, dispatch]);
}

export default useNotificationInitializer;