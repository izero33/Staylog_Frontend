
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import { formatKST } from '../../../global/utils/date';
import type { AdminBoard } from '../types/AdminBoardTypes';
import AdminReservationDetailModal from '../components/AdminReservationDetailModal';

/*
    Carousel : 게시글 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminAccommodationDetail() {
    // 게시글 번호  /admin/board/:boardId 에서 boardId경로 변수 얻어내기
    const { boardId: boardIdIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const boardId = Number(boardIdIdStr);

    // 게시글 상세 데이터
    const [data, setData] = useState<AdminBoard | null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);

    // 상세 모달 상태 관리
    const [detailOpen, setDetailOpen] = useState(false);
    const [targetBookingId, setTargetBookingId] = useState<number | null>(null);

    // 페이지 이동
    const navigate = useNavigate();

    // 게시글 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 게시글 번호가 없다면
        if (!boardId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/boards/${boardId}`);
                // 데이터 상태 업데이트
                setData(res);
                // 확인용
                console.log(res);
            } catch (err) {
                // axios 에러 처리
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.status === 404
                            ? '해당 게시글은 존재하지 않습니다.'
                            : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`
                    );
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                // 로딩 종료
                setLoading(false);
            }
        };
        fetchDetail();
    }, [boardId, data?.deleted]);

    // 게시글 ID 가 없다면
    if (!boardId) {
        return <div>게시글 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}> 게시글 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if (error) {
        return <div style={{ padding: "40px", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if (!data) {
        return <div style={{ padding: "40px", textAlign: "center" }}>게시글 정보를 찾을 수 없습니다</div>;
    }

    // 상태 업데이트 API 호출 함수
    const updateBoardStatus = async (boardId: number, status: 'Y' | 'N') => {
        try {
            await api.patch(`/v1/admin/boards/${boardId}/status`, {
                deleted: status
            });
            setData(data => ({ ...data!, deleted: status })); // 상태 업데이트
            return true;
        } catch (err) {
            console.error(`게시글 ID ${boardId} 상태 업데이트 실패:`, err);
            return false;
        }
    };

    // 게시글 목록 페이지 이동 핸들러
    const handleGoToBoardList = () => {
        navigate(-1);
    };

    // 예약 상세 모달 * 예약번호 클릭 → 상세 모달 열기
    const openDetail = (bookingId: number) => {
        setTargetBookingId(bookingId);
        setDetailOpen(true);
    };
    // 예약 상세 모달 닫기
    const closeDetail = () => {
        setDetailOpen(false);
        setTargetBookingId(null);
    };

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            <h3>{data.boardId}번 게시글 상세
                <span className={`ms-2 badge ${data.deleted === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                    {data.deleted === 'N' ? '공개' : '숨김'}
                </span>
            </h3>
            <div className="text-end text-muted">
                <span className='me-2'>등록일 : {formatKST(data.createdAt)}</span>
                <span>수정일 : {formatKST(data.updatedAt)}</span>
            </div>

            <div className="mt-3 justify-content-end d-flex gap-2">
                {data.deleted === 'N' ? (
                    <button title="숨김처리" className="btn btn-sm btn-danger text-white mb-3" onClick={() => updateBoardStatus(data.boardId!, 'Y')}>숨김 처리</button>
                ) : (
                    <button title="공개처리" className="btn btn-sm btn-success mb-3" onClick={() => updateBoardStatus(data.boardId!, 'N')}>공개 처리</button>
                )}
                <button
                    className="btn btn-sm btn-outline-primary mb-3"
                    title="게시글 목록으로 이동"
                    onClick={handleGoToBoardList} // 이동 함수 연결
                >목록으로
                    <i className="bi bi-list ms-1"></i> </button>
            </div>

            <table className="table table-bordered mt-5" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '85%' }} />
                </colgroup>
                <tbody>
                    <tr>
                        <th className="bg-light text-center">작성자</th>
                        <td>{data.userNickName}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">지역</th>
                        <td>{data.regionName}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">숙소명</th>
                        <td>{data.accommodationName}</td>
                    </tr>
                    {data.bookingId !== 0 && (<tr>
                        <th className="bg-light text-center">예약번호</th>
                        <td>
                            <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => openDetail(data.bookingId)}
                                title="상세 보기"
                            >{data.bookingId}</button>
                        </td>
                    </tr>)}

                    <tr>
                        <th className="bg-light text-center">반응지표</th>
                        <td>
                            <table className="table table-sm mb-0" style={{ width: '20%' }}>
                                <tbody>
                                    {data.rating !== 0 && data.rating !== null && (
                                        <tr>
                                            <th>별점</th>
                                            <td>{data.rating}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th>좋아요수</th>
                                        <td>{data.likes}</td>
                                    </tr>
                                    <tr>
                                        <th>조회수</th>
                                        <td>{data.viewsCount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">제목</th>
                        <td>{data.title}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">내용</th>
                        <td dangerouslySetInnerHTML={{ __html: data.content }} />
                    </tr>
                </tbody>
            </table>
            {/* 상세 모달 */}
            <AdminReservationDetailModal
                open={detailOpen}
                bookingId={targetBookingId}
                onClose={closeDetail}
            />
        </Container >
    </>
}

export default AdminAccommodationDetail;