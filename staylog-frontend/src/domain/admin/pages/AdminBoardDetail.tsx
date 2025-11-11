
import { Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import { formatKST } from '../../../global/utils/date';
import type { AdminBoard } from '../types/AdminBoardTypes';
import AdminReservationDetailModal from '../components/AdminReservationDetailModal';
import '../css/AdminDescriptionImg.css';
import ImageCarousel from '../../../global/components/ImageCarousel';

/*
    Carousel : 게시글 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminBoardDetail() {
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
    const location = useLocation();

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
    const handleGoToList = () => {
        if (location.state?.from) {
            // 저장된 검색 상태와 함께 목록으로 돌아가기
            navigate('/admin/boards', {
                state: {
                    searchParams: location.state.searchParams,
                    inputKeyword: location.state.inputKeyword
                }
            });
        } else {
            // state가 없으면 그냥 뒤로가기
            navigate(-1);
        }
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
            {/* 헤더 */}
            <h3>{data.boardId}번 게시글 상세
                <span className={`ms-2 badge ${data.deleted === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                    {data.deleted === 'N' ? '공개' : '숨김'}
                </span>
            </h3>
            <div className="text-muted mb-3">
                <div className="d-flex flex-column flex-md-row gap-1 gap-md-2">
                    <span>등록일: {formatKST(data.createdAt)}</span>
                    <span>수정일: {data.updatedAt ? formatKST(data.updatedAt) : '-'}</span>
                </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="d-flex flex-md-row justify-content-between gap-2 mt-4 mt-md-5 mb-4">
                <button
                    title="게시글 목록으로 돌아가기"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleGoToList}
                >
                    <i className="bi bi-arrow-left"></i>
                    <span className="d-none d-sm-inline ms-1">뒤로가기</span>
                </button>
                {data.deleted === 'N' ? (
                    <button
                        title="게시글 숨김"
                        className="btn btn-sm btn-danger text-white"
                        onClick={() => updateBoardStatus(data.boardId!, 'Y')}
                    >
                        <i className="bi bi-eye-slash"></i>
                        <span className="d-none d-sm-inline ms-1">숨김</span>
                    </button>
                ) : (
                    <button
                        title="게시글 공개"
                        className="btn btn-sm btn-success"
                        onClick={() => updateBoardStatus(data.boardId!, 'N')}
                    >
                        <i className="bi bi-eye"></i>
                        <span className="d-none d-sm-inline ms-1">공개</span>
                    </button>
                )}
            </div>

            <Card className="mb-3">
                <Card.Body>
                    {/* 작성자 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            작성자
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={data.userNickName}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>

                    {/* 지역 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            지역
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <Form.Control
                                plaintext
                                readOnly
                                value={data.regionName}
                                className="form-control-sm"
                            />
                        </Col>
                    </Form.Group>

                    {/* 숙소명 (리뷰 전용) */}
                    {data.rating !== 0 && data.rating !== null && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                                숙소명
                            </Form.Label>
                            <Col xs={12} md={9} lg={10}>
                                <Form.Control
                                    plaintext
                                    readOnly
                                    value={data.accommodationName}
                                    className="form-control-sm"
                                />
                            </Col>
                        </Form.Group>
                    )}

                    {/* 예약번호 */}
                    {data.bookingId !== 0 && (
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                                예약번호
                            </Form.Label>
                            <Col xs={12} md={9} lg={10}>
                                <button
                                    type="button"
                                    className="btn btn-link p-0 text-decoration-none"
                                    onClick={() => openDetail(data.bookingId)}
                                    title="상세 보기"
                                >
                                    {data.bookingId}
                                </button>
                            </Col>
                        </Form.Group>
                    )}

                    {/* 반응지표 */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                            반응지표
                        </Form.Label>
                        <Col xs={12} md={9} lg={10}>
                            <div className="d-none d-md-block mb-2">
                                <Table bordered size="sm" className="mb-0" style={{ maxWidth: '300px' }}>
                                    <tbody>
                                        {data.rating !== 0 && data.rating !== null && (
                                            <tr>
                                                <th style={{ width: '50%' }}>별점</th>
                                                <td>{data.rating}</td>
                                            </tr>
                                        )}
                                        <tr>
                                            <th>좋아요수</th>
                                            <td>{data.likesCount}</td>
                                        </tr>
                                        <tr>
                                            <th>조회수</th>
                                            <td>{data.viewsCount}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>

                            <div className="d-flex flex-wrap gap-3 d-md-none">
                                {data.rating !== 0 && data.rating !== null && (
                                    <span><i title="별점" className="bi bi-star-fill text-warning"></i> {data.rating}</span>
                                )}
                                <span><i title="좋아요수" className="bi bi-heart-fill text-danger"></i> {data.likesCount}</span>
                                <span><i title="조회수" className="bi bi-eye-fill"></i> {data.viewsCount}</span>
                            </div>
                        </Col>
                    </Form.Group>
                </Card.Body>
            </Card>

            {/* 게시글 내용 */}
            <p className='fs-5 text-center my-4 border-top py-3 border bg-light rounded'>게시글 내용</p>

            <Card className="mb-3">
                <Card.Header className="bg-light fw-bold">
                    제목
                </Card.Header>
                <Card.Body>
                    <Form.Control
                        plaintext
                        readOnly
                        value={data.title}
                        className="form-control-sm"
                    />
                </Card.Body>
            </Card>
            <Card className="mb-3">
                <Card.Header className="bg-light fw-bold">
                    내용
                </Card.Header>
                <Card.Body>
                    <div className='description-content' dangerouslySetInnerHTML={{ __html: data.content }} />
                </Card.Body>
            </Card>

            {/* 예약 상세 모달 */}
            <AdminReservationDetailModal
                open={detailOpen}
                bookingId={targetBookingId}
                onClose={closeDetail}
            />
        </Container >
    </>
}

export default AdminBoardDetail;