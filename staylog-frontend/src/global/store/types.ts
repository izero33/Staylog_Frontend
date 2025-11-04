import type { CommonCodeGroupResponse } from '../../domain/common/types';
import type { responseNotificationsType } from '../../domain/notification/types/NotificationCardType';

// 로그인한 유저의 정보 설계도
export interface UserInfo {
   userId: number;
   loginId: string;
   nickname: string;
   // profileImageUrl: string | null
}

// Redux store에 저장되는 모든 데이터를 정의하는 마스터 설계도
// Redux는 모든 전역 상태를 단 하나의 큰 객체인 RootState 안에 저장한다.
export interface RootState {
   userInfo: UserInfo | null;
   logoutTimer: NodeJS.Timeout | null; // 자동 로그아웃 타이머의 ID를 저장
   token: string | null;
   commonCodes: CommonCodeGroupResponse | null; // 공통코드 전역 상태
   notiList: responseNotificationsType[]; // 알림 목록
   notiUnreadCount: number; // 안읽은 알림 수
}

// 로그인 시 유저 정보를 store에 저장하는 용도의 액션
export interface SetUserInfoAction {
   type: 'USER_INFO';
   payload: UserInfo | null;
}

// 로그아웃 액션
export interface LogoutAction {
   type: 'LOGOUT';
}

// 토큰 저장용 액션
export interface SetTokenAction {
   type: 'SET_TOKEN';
   payload: string | null;
}

// 공통코드 저장용 액션
export interface SetCommonCodesAction {
   type: 'SET_COMMON_CODES';
   payload: CommonCodeGroupResponse | null;
}

// ==================================
// 알림 액션

// 알림 리스트 조회
export interface SetNotiListAction {
   type: 'SET_NOTIFICATION_LIST';
   payload: responseNotificationsType[];
}

// 새 알림 1개를 목록에 추가
export interface PushNotificationAction {
   type: 'PUSH_NOTIFICATION';
   payload: responseNotificationsType;
}

// 안읽은 알림 개수 가져오기
export interface SetUnreadCountAction {
   type: 'SET_UNREAD_COUNT';
   payload: number;
}

// 안 읽은 개수 1 증가
export interface IncrementUnreadCountAction {
   type: 'INCREMENT_UNREAD_COUNT';
}

// 단일 알림 읽음 처리
export interface MarkOneAsReadAction {
   type: 'READ_ONE';
   payload: number; // 읽음 처리할 notiId
}

// 모두 읽음 처리
export interface MarkAllAsReadAction {
   type: 'READ_ALL';
}

// 알림 삭제
export interface DeleteNotificationAction {
   type: 'DELETE_NOTIFICATION'
   payload: number
}



export type AppAction =
   SetUserInfoAction
   | LogoutAction
   | SetTokenAction
   | SetCommonCodesAction
   | SetNotiListAction
   | PushNotificationAction
   | SetUnreadCountAction
   | IncrementUnreadCountAction
   | MarkAllAsReadAction
   | DeleteNotificationAction
   | MarkOneAsReadAction