import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {  // 프록시할 경로
        target: 'http://localhost:9090', // 백엔드 서버 주소
        changeOrigin: true, 
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' 제거 
      },
      '/images':{ // upload 된 이미지를 로딩하기 위한 프록시 
        target: 'http://localhost:9090', 
        changeOrigin: true 
      }
    },
  },
})
