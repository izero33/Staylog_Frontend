import { jwtDecode } from "jwt-decode";
import api from "../../../global/api/index";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { DecodedToken } from "../types/DecodedToken";


/**
 * JWT 토큰 검증 함수
 * App.tsx 최상위 컴포넌트에서 호출하여 새로고침 시에도 로그인 상태 유지
 * @author 이준혁
 */
function useAuthJwt() {

const dispatch = useDispatch();
const nav = useNavigate();

useEffect(() => {
   const token = localStorage.getItem("token")

   if (token) {
      try {
         
         const decoded = jwtDecode<DecodedToken>(token.substring(7))
         const now = Date.now() / 1000
         
         if (decoded.exp > now) {
            api.defaults.headers.common['Authorization'] = token;
            dispatch({
               type: "USER_INFO",
               payload: {
                  userId: parseInt(decoded.sub, 10),
                  loginId: decoded.loginId,
                  nickname: decoded.nickname,
                  isLoggedIn: true //마이페이지 useAuthJwt 훅이 로그인 처리 시, isLoggedIn: true를 추가하여  Redux 스토어에 사용자의 로그인 상태가 올바르게 반영된다.
               }
            })

            // 토큰 저장 액션
            dispatch({
               type: "SET_TOKEN",
               payload: token
            });

            const remainTime = (decoded.exp - now) * 1000;
            const logoutTimer = setTimeout(() => {
               dispatch({ type: "LOGOUT" })
               nav("/")
               alert("세션이 만료되어 자동 로그아웃 되었습니다.")
            }, remainTime)

            // 로그아웃 타이머 저장 액션
            dispatch({
               type: "SET_LOGOUT_TIMER",
               payload: logoutTimer
            });

            return () => clearTimeout(logoutTimer)

         } else {
            dispatch({ type: "LOGOUT" })
         }
      } catch (err) {
         console.error("유효하지 않은 토큰 : ", err);
         dispatch({ type: "LOGOUT" })
      }
   }
}, [dispatch, nav])
}

export default useAuthJwt;