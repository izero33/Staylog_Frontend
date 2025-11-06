// src/global/components/Pagination.tsx

import type { PageResponse } from "../types/Paginationtypes";

interface PaginationProps {
    page: PageResponse;
    onPageChange: (pageNum: number) => void;
}

function Pagination({ page, onPageChange }: PaginationProps) {
    // 페이지가 1개 이하면 렌더링하지 않음
    if (page.totalPage <= 1) {
        return null;
    }

    return (
        <nav aria-label="Page navigation" className="mt-4">
            <ul className="pagination gap-1 justify-content-center align-items-center">
                {/* 이전 버튼 */}
                <li className={`page-item ${page.startPage === 1 ? 'disabled' : ''}`}>
                    <button
                        title="이전"
                        className={`page-link border-0 bg-white ${
                            page.startPage === 1 
                                ? 'text-secondary text-opacity-25'
                                : 'text-dark text-opacity-75' 
                        }`}
                        onClick={() => onPageChange(page.startPage - 1)}
                        disabled={page.startPage === 1}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </li>

                {/* 페이지 번호 */}
                {Array.from(
                    { length: page.endPage - page.startPage + 1 },
                    (_, i) => page.startPage + i
                ).map(num => (
                    <li
                        key={num}
                        className={`page-item ${num === page.pageNum ? 'active' : ''}`}
                    >
                        <button
                            className={`page-link border-0 ${
                                num === page.pageNum 
                                    ? 'bg-secondary bg-opacity-75 text-white rounded-3' 
                                    : 'text-secondary'
                            }`}
                            onClick={() => onPageChange(num)}
                        >
                            {num}
                        </button>
                    </li>
                ))}

                {/* 다음 버튼 */}
                <li className={`page-item ${page.endPage >= page.totalPage ? 'disabled' : ''}`}>
                    <button
                        title="다음"
                        className={`page-link border-0 bg-white ${
                            page.endPage >= page.totalPage 
                                ? 'text-secondary text-opacity-25'
                                : 'text-dark text-opacity-75' 
                        }`}
                        onClick={() => onPageChange(page.endPage + 1)}
                        disabled={page.endPage >= page.totalPage}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}

export default Pagination;