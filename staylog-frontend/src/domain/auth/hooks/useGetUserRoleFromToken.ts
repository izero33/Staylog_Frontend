// src/domain/auth/hooks/useGetUserRoleFromToken.ts
import { jwtDecode } from "jwt-decode";
import { useSelector } from "react-redux";
import type { RootState } from "../../../global/store/types";

export default function useGetUserRoleFromToken(): string | null {
  const token = useSelector((state: RootState) => state.token);

  if (!token) {
    console.log("❌ 토큰 없음 (로그인 안 되어 있음)");
    return null;
  }

  try {
    const decoded: any = jwtDecode(token);
    console.log("🧩 JWT 전체 payload:", decoded); // 👈 여기서 payload 전체 출력

    // 잠정적으로 가능한 키 모두 시도
    const role =
      decoded.role ||
      decoded.Role ||
      decoded.auth ||
      decoded.authorities?.[0] ||
      decoded.roles?.[0] ||
      decoded.userRole ||
      null;

    console.log("🎯 추출된 role:", role);

    return role ? role.replace(/^ROLE_/, "") : null;
  } catch (err) {
    console.error("❌ JWT 디코딩 실패:", err);
    return null;
  }
}
