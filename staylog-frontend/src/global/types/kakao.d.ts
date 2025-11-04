//정나영 
// Kakao Maps SDK 전역 객체 타입 선언
declare global {
  interface Window {
    kakao: any;
  }
}

export {}; // 이거 꼭 넣어야 모듈로 인식돼서 타입 병합이 제대로 됨
