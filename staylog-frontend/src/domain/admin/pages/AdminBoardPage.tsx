// src/domain/admin/pages/AdminBoardListPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";
import type {
    AdminBoardList,
    AdminBoardSearchParams,
    AdminBoardListResponse
} from "../types/AdminBoardTypes";
import '../css/AdminTable.css';
import type { PageResponse } from "../../../global/types/Paginationtypes";

// 상태 업데이트 API 호출 함수
const updateBoardStatus = async (boardId: number, status: 'Y' | 'N') => {
    try {
        await api.patch(`/v1/admin/boards/${boardId}/status`, {
            deleted: status
        });
        return true;
    } catch (err) {
        console.error(`게시판 ID ${boardId} 상태 업데이트 실패:`, err);
        return false;
    }
};

function AdminBoardPage() {
    const navigate = useNavigate(); // 페이지 이동 훅
    const [boards, setBoards] = useState<AdminBoardList[]>([]); // 게시글 목록 상태
    const [page, setPage] = useState<PageResponse | null>(null); // 페이지 정보 상태
    const [inputKeyword, setInputKeyword] = useState<string>(''); // 검색어 입력 상태
    const [searchParams, setSearchParams] = useState<AdminBoardSearchParams>({
        boardType: 'BOARD_REVIEW',
        pageNum: 1,
        pageSize: 10
    });

    // 게시글 목록 조회
    useEffect(() => {
        api.get<AdminBoardListResponse>("/v1/admin/boards", { params: searchParams })
            .then(res => {
                setBoards(res.boards);
                setPage(res.page);
            })
            .catch(err => console.log("게시글 목록 로드 실패", err));
    }, [searchParams]);

    // 상태 변경 핸들러
    const handleStatusChange = async (
        boardId: number,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (!boardId) return;

        const newStatus = e.target.value as 'Y' | 'N';
        const originalStatus = boards.find(item => item.boardId === boardId)?.deleted!;

        if (originalStatus === newStatus) return;

        // UI 업데이트 
        setBoards(prev =>
            prev.map(item =>
                item.boardId === boardId
                    ? { ...item, deleted: newStatus }
                    : item
            )
        );

        // API 호출
        const success = await updateBoardStatus(boardId, newStatus);

        if (!success) {
            alert('상태 업데이트 실패. 원래 상태로 되돌립니다.');
            setBoards(prev =>
                prev.map(item =>
                    item.boardId === boardId
                        ? { ...item, deleted: originalStatus }
                        : item
                )
            );
        }
    };

    // 검색 핸들러
    const handleSearch = () => {
        if (!searchParams.searchType) {
            alert('검색 기준을 선택해주세요.');
            return;
        }
        if (!inputKeyword.trim()) {
            alert('검색어를 입력해주세요.');
            return;
        }

        setSearchParams(prev => ({
            ...prev,
            keyword: inputKeyword.trim(),
            pageNum: 1  // 검색 시 첫 페이지로
        }));
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNum: number) => {
        setSearchParams(prev => ({
            ...prev,
            pageNum
        }));
    };

    // 상세 페이지 이동
    const handleToDetailPage = (boardId: number) => {
        navigate(`/admin/boards/${boardId}`);
    };

    // 게시판 타입 변경
    const handleBoardTypeChange = (boardType: 'BOARD_REVIEW' | 'BOARD_JOURNAL') => {
        setSearchParams({
            boardType,
            pageNum: 1,
            pageSize: 10
        });
        setInputKeyword('');
    };

    return (
        <div className="container-fluid">
            {/* 게시판 타입 선택 */}
            <div className="d-flex gap-2 mt-3 mb-4">
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_REVIEW' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => handleBoardTypeChange('BOARD_REVIEW')}
                >리뷰 게시판</button>
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_JOURNAL' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => handleBoardTypeChange('BOARD_JOURNAL')}
                >저널 게시판</button>
            </div>

            <h4>{searchParams.boardType === 'BOARD_REVIEW' ? '리뷰 게시판 관리' : '저널 게시판 관리'}</h4>

            {/* 검색 필터 및 정렬 */}
            <div className="d-flex flex-column mt-3">

                {/* 모바일 전용 검색 필터 버튼 */}
                <button
                    className="btn btn-sm btn-outline-secondary d-md-none mb-3" // md 이상에서는 숨김 (d-md-none)
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#filterCollapse" // 아래 Collapse DIV의 ID와 일치
                >
                    검색 필터 설정 <i className="bi bi-funnel"></i>
                </button>

                {/* 필터 내용 (Collapse) */}
                <div className="collapse d-md-flex" id="filterCollapse">
                    {/* 검색 기준 및 입력 그룹 */}
                    <div className="d-flex gap-2">
                        <select
                            name="searchType"
                            className="form-select-sm border-light h-75"
                            onChange={(e) => {
                                const value = e.target.value as 'accommodationName' | 'userNickName' | undefined;
                                setSearchParams(prev => ({
                                    ...prev,
                                    searchType: value || undefined
                                }));
                            }}
                        >
                            <option value=''>검색 기준</option>
                            <option value="accommodationName">숙소명</option>
                            <option value="userNickName">작성자</option>
                        </select>

                        <div className="input-group h-75">
                            <input
                                type="text"
                                placeholder="검색어 입력"
                                className="form-control-sm border-1"
                                value={inputKeyword}
                                onChange={(e) => setInputKeyword(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                            <button className="btn border-secondary border-1 btn-sm" onClick={handleSearch}>
                                <i className="bi bi-search"></i>
                            </button>
                        </div>
                    </div>

                    {/* 상태/정렬 필터 그룹 */}
                    <div className="ms-md-auto d-flex gap-2 flex-wrap mt-3">
                        <select
                            name="status"
                            className="form-select-sm border-secondary"
                            onChange={(e) => {
                                const value = e.target.value as 'Y' | 'N' | '';
                                setSearchParams(prev => ({
                                    ...prev,
                                    deleted: value || null,
                                    pageNum: 1
                                }));
                            }}
                        >
                            <option value=''>전체</option>
                            <option value="N">공개</option>
                            <option value="Y">숨김</option>
                        </select>

                        <select
                            className="form-select-sm"
                            name="orderBy"
                            onChange={(e) => {
                                const [sortBy, sortOrder] = e.target.value.split('_') as ['createdAt' | 'viewsCount' | 'rating' | 'likes', 'ASC' | 'DESC'];
                                setSearchParams(prev => ({
                                    ...prev,
                                    sortBy,
                                    sortOrder,
                                    pageNum: 1
                                }));
                            }}
                        >
                            <option value="createdAt_DESC">최신등록순</option>
                            <option value="createdAt_ASC">오래된순</option>
                            {searchParams.boardType === 'BOARD_REVIEW' && (
                                <>
                                    <option value="rating_DESC">평점 높은순</option>
                                    <option value="rating_ASC">평점 낮은순</option>
                                </>
                            )}
                            <option value="viewsCount_DESC">조회수 높은순</option>
                            <option value="viewsCount_ASC">조회수 낮은순</option>
                            <option value="likes_DESC">좋아요 많은순</option>
                            <option value="likes_ASC">좋아요 적은순</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 페이지 정보 */}
            {page && (
                <div className="text-end text-muted mt-3">
                    전체 {page.totalCount}건 ({page.pageNum}/{page.totalPage} 페이지)
                </div>
            )}

            {/* 게시글 테이블 */}
            <table className="table table-striped text-center mt-3 custom-table">
                <thead>
                    <tr>
                        <th style={{ width: '6%' }}>번호</th>
                        <th>숙소명</th>
                        <th>제목</th>
                        <th style={{ width: '12%' }}>작성자</th>
                        <th>반응지표</th>
                        <th style={{ width: '15%' }}>등록일</th>
                        <th style={{ width: '10%' }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {boards.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-5">
                                <div className="text-muted">
                                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                    <p className="mb-0">등록된 게시글이 없습니다.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        boards.map((item, index) => (
                            <tr key={item.boardId}>
                                <td>{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</td>
                                <td>{item.accommodationName || '-'}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-decoration-none"
                                        onClick={() => handleToDetailPage(item.boardId)}
                                    >
                                        {item.title}
                                    </button>
                                </td>
                                <td>{item.userNickName}</td>
                                <td>
                                    {searchParams.boardType === 'BOARD_REVIEW' && (
                                        <span className="badge bg-warning text-dark me-1">
                                            <i className="bi bi-star"></i> {item.rating}
                                        </span>
                                    )}
                                    <span className="badge bg-danger me-1">
                                        <i className="bi bi-heart"></i> {item.likes}
                                    </span>
                                    <span className="badge bg-secondary">
                                        <i className="bi bi-eye"></i> {item.viewsCount}
                                    </span>
                                </td>
                                <td>{formatKST(item.createdAt)}</td>
                                <td>
                                    <select
                                        className="form-select form-select-sm"
                                        value={item.deleted}
                                        onChange={(e) => handleStatusChange(item.boardId, e)}
                                    >
                                        <option value="N">공개</option>
                                        <option value="Y">숨김</option>
                                    </select>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            {page && page.totalPage > 1 && (
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        {/* 이전 버튼 */}
                        <li className={`page-item ${page.startPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page.startPage - 1)}
                                disabled={page.startPage === 1}
                            >
                                이전
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
                                    className="page-link"
                                    onClick={() => handlePageChange(num)}
                                >
                                    {num}
                                </button>
                            </li>
                        ))}

                        {/* 다음 버튼 */}
                        <li className={`page-item ${page.endPage >= page.totalPage ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page.endPage + 1)}
                                disabled={page.endPage >= page.totalPage}
                            >
                                다음
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}

export default AdminBoardPage;