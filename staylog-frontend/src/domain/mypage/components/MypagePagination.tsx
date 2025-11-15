// src/domain/mypage/components/MypagePagination.tsx
import { Pagination } from "react-bootstrap";

interface MypagePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  pageBlockSize?: number; // 페이지네이션에 표시될 페이지 번호 블록 크기
  onPageChange: (pageNumber: number) => void;
}

function MypagePagination({ 
  totalItems, 
  itemsPerPage, 
  currentPage, 
  pageBlockSize = 5, // 한 페이지당 5개씩 보이도록 함
  onPageChange 
}: MypagePaginationProps) {

  // --- 페이지네이션 계산 로직 ---
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startPage = Math.floor((currentPage - 1) / pageBlockSize) * pageBlockSize + 1;
  const endPage = Math.min(startPage + pageBlockSize - 1, totalPages);

  // 페이지가 1개 이하면 렌더링하지 않음
  if (totalPages <= 1) {
    return null;
  }

  // 페이지 번호 목록 생성
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <Pagination className="justify-content-center mt-4">
      {/* 이전 블록 버튼 */}
      <Pagination.Prev
        onClick={() => onPageChange(startPage - 1)}
        disabled={startPage === 1}
      />

      {/* 페이지 번호 */}
      {pageNumbers.map(num => (
        <Pagination.Item
          key={num}
          active={num === currentPage}
          onClick={() => onPageChange(num)}
        >
          {num}
        </Pagination.Item>
      ))}

      {/* 다음 블록 버튼 */}
      <Pagination.Next
        onClick={() => onPageChange(endPage + 1)}
        disabled={endPage >= totalPages}
      />
    </Pagination>
  );
}

export default MypagePagination;
