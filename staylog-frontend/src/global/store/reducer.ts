// reducer.ts

import type { AppAction, RootState } from "./types";

const initState: RootState = {
   userInfo: null,
   token: null,
   logoutTimer: null,
   commonCodes: null,
   notiList: [],
   notiUnreadCount: 0
};


/**
 * 리듀서 함수
 * Dispacth 값 추가해서 스토어에 저장 가능
 * @author 이준혁
 * @param state 기본 null 값 state
 * @param action 받을 액션의 종류
 * @returns 
 */
function reducer(state: RootState = initState, action: AppAction): RootState {
   switch (action.type) {
      case 'USER_INFO':
         return { ...state, userInfo: action.payload };
      case 'SET_TOKEN':
         return { ...state, token: action.payload };
      case 'SET_COMMON_CODES':
         return { ...state, commonCodes: action.payload };
      case 'LOGOUT':
         if (state.logoutTimer) {
            clearTimeout(state.logoutTimer);
         }
         localStorage.removeItem("token");
         return { ...initState };
      // --- [신규 추가] 알림 리듀서 로직 ---
      case 'SET_NOTIFICATION_LIST':
         return {
            ...state,
            notiList: action.payload,
         };

      case 'PUSH_NOTIFICATION':
         // [중요] 불변성을 지키며 새 알림을 '맨 앞'에 추가
         return {
            ...state,
            notiList: [action.payload, ...state.notiList],
         };

      case 'SET_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: action.payload,
         };

      case 'INCREMENT_UNREAD_COUNT':
         return {
            ...state,
            notiUnreadCount: state.notiUnreadCount + 1,
         };

      case 'MARK_ALL_AS_READ':
         // 불변성을 지키며 모두 읽음 처리
         return {
            ...state,
            notiUnreadCount: 0,
            notiList: state.notiList.map(noti => ({ ...noti, isRead: 'Y' })),
         };

      case 'DELETE_NOTIFICATION': { // (case를 {}로 감싸서 변수 스코프 분리)
         const notiIdToDelete = action.payload;

         // 삭제하려는 알림이 안 읽은 상태였는지 확인
         const targetNoti = state.notiList.find(noti => noti.notiId === notiIdToDelete);
         const wasUnread = targetNoti && targetNoti.isRead === 'N';

         return {
            ...state,
            // 안 읽은 알림을 삭제했다면 카운트 1 감소
            notiUnreadCount: wasUnread ? state.notiUnreadCount - 1 : state.notiUnreadCount,

            // filter로 해당 notiId를 제외한 새 배열을 생성 (불변성)
            notiList: state.notiList.filter(noti => noti.notiId !== notiIdToDelete),
         };
      }

      case 'MARK_ONE_AS_READ': {
         const notiIdToMark = action.payload;

         // 읽음 처리하려는 알림이 '안 읽은' 상태였는지 확인
         const targetNoti = state.notiList.find(noti => noti.notiId === notiIdToMark);
         const wasUnread = targetNoti && targetNoti.isRead === 'N';

         return {
            ...state,
            // 안 읽은 알림을 읽음 처리한 거라면, 카운트 1 감소
            notiUnreadCount: wasUnread ? state.notiUnreadCount - 1 : state.notiUnreadCount,

            // map을 돌려서 해당 notiId의 isRead만 'Y'로 변경 (불변성)
            notiList: state.notiList.map(noti =>
               noti.notiId === notiIdToMark ? { ...noti, isRead: 'Y' } : noti
            ),
         };
      }
      default:
         return state;
   }
}

export default reducer;