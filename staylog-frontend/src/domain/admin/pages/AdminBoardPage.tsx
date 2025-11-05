// src/domain/admin/pages/AdminAccommodationListPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 훅 임포트
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";
import type { AdminBoardList, AdminBoardSearchParams } from "../types/AdminBoardTypes";
import '../css/AdminTable.css';

// 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
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


function AdminAccommodationListPage() {
    const [boards, setBoards] = useState<AdminBoardList[]>([]);
    const [searchParams, setSearchParams] = useState<AdminBoardSearchParams>({
        boardType: 'BOARD_REVIEW'
    });

    // 전체 숙소 목록 조회 (컴포넌트 마운트 시)
    useEffect(() => {
        api.get<AdminBoardList[]>("/v1/admin/boards", { params: searchParams })
            .then(res => setBoards(res))
            .catch(err => console.log("숙소 목록 로드 실패", err));
    }, [searchParams]);

    // 상태 변경 API 호출 핸들러 (원래 값 롤백 기능 포함)
    const handleStatusChange = async (
        boardId: number,
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        if (!boardId) return;

        const newStatus = e.target.value as 'Y' | 'N';

        // 롤백을 위한 원래 값 저장
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
            // API 실패 시, 원래 값으로 롤백
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

    //이동을 하기위한 hook
    const navigate = useNavigate();

    //숙소 상세 페이지 이동 핸들러
    const handleToDetailPage = (boardId: number) => {
        navigate(`/admin/boards/${boardId}`);
    };

    return <>
        <div className="container-fluid">
            <div className="d-flex gap-2 mt-3 mb-4">
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_REVIEW' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => setSearchParams({ boardType: 'BOARD_REVIEW' })}
                >리뷰 게시판</button>
                <button
                    className={`btn ${searchParams.boardType === 'BOARD_JOURNAL' ? 'select-bg border-light fw-bold' : 'btn-outline-light text-secondary'}`}
                    onClick={() => setSearchParams({ boardType: 'BOARD_JOURNAL' })}
                >저널 게시판</button>
            </div>
            {searchParams.boardType === 'BOARD_REVIEW' ? <h4>리뷰 게시판 관리</h4> : <h4>저널 게시판 관리</h4>}

            <table className="table table-striped text-center mt-5 custom-table">
                <thead>
                    <tr>
                        <th style={{ width: '6%' }}>번호</th>
                        <th style={{ width: '12%' }}>숙소명</th>
                        <th>제목</th>
                        <th style={{ width: '12%' }}>작성자</th>
                        <th>반응지표</th>
                        <th style={{ width: '15%' }}>등록일</th>
                        <th style={{ width: '10%' }}>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {boards.length === 0 ? ( // 숙소가 하나도 없을 때
                        <tr>
                            <td colSpan={searchParams.boardType === 'BOARD_REVIEW' ? 9 : 8} className="text-center py-5">
                                <div className="text-muted">
                                    <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                    <p className="mb-0">등록된 게시글이 없습니다.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        boards.map((item, index) => ( // 숙소가 있을 때
                            <tr key={item.boardId}>
                                <td>{index + 1}</td>
                                <td>{item.accommodationName}</td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-decoration-none"
                                        onClick={() => handleToDetailPage(item.boardId!)}
                                    >
                                        {item.title}
                                    </button>
                                </td>
                                <td>{item.userNickName}</td>
                                <td>
                                    {searchParams.boardType === 'BOARD_REVIEW' && (
                                        <span className="badge bg-warning text-dark me-1"><i className="bi bi-star"></i> {item.rating}</span>
                                    )}
                                    <span className="badge bg-danger me-1"><i className="bi bi-heart"></i> {item.likes}</span>
                                    <span className="badge bg-secondary"><i className="bi bi-eye"></i> {item.viewsCount}</span>
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
                                    <span className={`badge bg-${item.deleted === 'N' ? 'success' : 'danger'}`}>
                                        {item.deleted === 'N' ? '공개' : '숨김'}
                                    </span>
                                </td>
                            </tr>
                        )))}
                </tbody>
            </table>
        </div>
    </>;
}

export default AdminAccommodationListPage;