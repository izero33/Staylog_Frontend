import { useEffect, useRef } from "react";
import { loadKakaoSdk } from "../../../global/utils/kakaoLoader"; 

const KAKAO_JS_KEY = "ba55e0b19d51c59e9860418eebdb1a9f";

type KakaoMapProps = {
  latitude: number;
  longitude: number;
  address?: string;
  height?: string;
  level?: number; // 지도 확대 단계 (1~14)
};

export default function KakaoMap({
  latitude,
  longitude,
  address,
  height = "400px",
  level = 3,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!latitude || !longitude || !mapRef.current) return;

    loadKakaoSdk(KAKAO_JS_KEY)
      .then(() => {
        const { kakao } = window;
        const center = new kakao.maps.LatLng(latitude, longitude);
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level,
        });

        new kakao.maps.Marker({
          map,
          position: center,
        });

        if (address) {
          const overlay = new kakao.maps.CustomOverlay({
            position: center,
            content: `<div style="padding:5px 10px;background:white;border-radius:5px;border:1px solid #ddd;">${address}</div>`,
            yAnchor: 2,
          });
          overlay.setMap(map);
        }
      })
      .catch((e) => console.error("Kakao map init failed:", e));
  }, [latitude, longitude, address, level]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height,
        borderRadius: "10px",
        overflow: "hidden",
      }}
    />
  );
}
