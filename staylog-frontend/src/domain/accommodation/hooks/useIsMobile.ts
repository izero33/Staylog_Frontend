import { useEffect, useState } from "react";

// lg 미만일 때(992px 미만) 모바일 환경으로 간주
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
