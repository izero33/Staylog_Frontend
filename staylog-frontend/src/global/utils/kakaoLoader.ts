let kakaoReady: Promise<void> | null = null;

export function loadKakaoSdk(appKey: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));

  // 이미 maps까지 준비된 경우
  if ((window as any).kakao?.maps) return Promise.resolve();

  // 이미 로딩 중이면 그 Promise 재사용
  if (kakaoReady) return kakaoReady;

  kakaoReady = new Promise<void>((resolve, reject) => {
    // 동일 스크립트 중복 삽입 방지
    let script = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
    );

    if (!script) {
      script = document.createElement("script");
      // autoload=false 이므로 반드시 maps.load로 초기화해야 함
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onerror = () => reject(new Error("Kakao SDK load failed"));
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => {
      try {
        (window as any).kakao.maps.load(() => resolve());
      } catch (e) {
        reject(e);
      }
    });
  });

  return kakaoReady;
}
