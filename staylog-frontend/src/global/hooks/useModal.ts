import { useState } from 'react';

export const useModal = <T,>(initialMode: T) => {
   // 모달 활성화 상태
   const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

   // 모달 모드 상태 (타입을 제네릭 T로 받음)
   const [modalMode, setModalMode] = useState<T>(initialMode);

   // 모드값을 인자로 받고 모달을 여는 함수
   const openModal = (mode: T) => {
      setModalMode(mode);
      setIsModalOpen(true);
   };

   // 모달을 닫는 함수
   const closeModal = () => {
      setIsModalOpen(false);
   };

   return {
      isModalOpen,
      modalMode,
      openModal,
      closeModal,
      setModalMode // 혹시 모달이 열린 상태에서 모드만 바꿔야 할 때를 위해 setter도 반환
   };
};