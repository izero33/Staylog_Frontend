// src/domain/mypage/pages/ReservationSection.tsx
import { useEffect, useState } from "react";
import { getReservationList } from "../api/mypageApi";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { Button, Card, Col, Pagination, Row, Table, Badge } from "react-bootstrap";
import { formatKST } from "../../../global/utils/date";
import MypageReservationDetailModal from "../components/MypageReservationDetailModal";

function ReservationSection() {
    const userId = useGetUserIdFromToken();
    const [reservations, setReservations] = useState<any[]>([]);
    const [status, setStatus] = useState("upcoming");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 모달 상태
    const [detailOpen, setDetailOpen] = useState(false);
    const [targetBookingId, setTargetBookingId] = useState<number | null>(null);

    const openDetail = (bookingId: number) => {
        setTargetBookingId(bookingId);
        setDetailOpen(true);
    };
    const closeDetail = () => {
        setTargetBookingId(null);
        setDetailOpen(false);
    };

    useEffect(() => {
        if (!userId) return;
        getReservationList(userId, status)
            .then((res) => {
                setReservations(res || []);
                setCurrentPage(1);
            })
            .catch((err) => {
                console.error("예약 내역 조회 실패:", err);
                alert("예약 정보를 불러올 수 없습니다.");
            });
    }, [userId, status]);

    // 페이징 계산
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentItems = reservations.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(reservations.length / itemsPerPage) || 1;

    // 상태 필터 버튼
    const renderFilterButtons = () => (
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4"> {/* flex-wrap 추가 */}
            <Button variant={status === "upcoming" ? "dark" : "outline-secondary"} onClick={() => setStatus("upcoming")}>
                다가올 예약
            </Button>
            <Button variant={status === "completed" ? "dark" : "outline-secondary"} onClick={() => setStatus("completed")}>
                이용 완료
            </Button>
            <Button variant={status === "canceled" ? "dark" : "outline-secondary"} onClick={() => setStatus("canceled")}>
                취소 내역
            </Button>
        </div>
    );

    // 상태 표시 뱃지
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RES_CONFIRMED': return <Badge bg="success" className="fs-6 fw-normal">확정</Badge>;
            case 'RES_CANCELED': return <Badge bg="danger" className="fs-6 fw-normal">취소</Badge>;
            case 'RES_REFUNDED': return <Badge bg="danger" className="fs-6 fw-normal">환불</Badge>;
            default: return <Badge bg="secondary" className="fs-6 fw-normal">대기</Badge>;
        }
    };

    // PC용 테이블 뷰
    const renderTableView = () => (
        <div className="d-none d-lg-block">
            <Table bordered hover responsive className="align-middle text-center">
                <thead className="table-light">
                    <tr className="text-nowrap">
                        <th>예약 번호</th>
                        <th>투숙자명</th>
                        <th>숙소명 / 객실명</th>
                        <th>체크인</th>
                        <th>체크아웃</th>
                        <th>총 투숙인원</th>
                        <th>상태</th>
                        <th>예약 상세 보기</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.length > 0 ? (
                        currentItems.map((r) => (
                            <tr key={r.bookingId}>
                                <td className="text-nowrap">{r.bookingNum || r.bookingId}</td>
                                <td className="text-nowrap">{r.guestName}</td>
                                <td>{r.accommodationName} / {r.roomName}</td>
                                <td className="text-nowrap">{r.checkIn ? formatKST(r.checkIn).split("T")[0] : "—"}</td>
                                <td className="text-nowrap">{r.checkOut ? formatKST(r.checkOut).split("T")[0] : "—"}</td>
                                <td>{r.totalGuestCount}</td>
                                <td>{getStatusBadge(r.status)}</td>
                                <td>
                                    <Button variant="outline-primary" size="sm" onClick={() => openDetail(r.bookingId)}>
                                        예약 보기
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan={8} className="text-muted py-4">예약 내역이 없습니다.</td></tr>
                    )}
                </tbody>
            </Table>
        </div>
    );

    // 모바일용 카드 뷰
    const renderCardView = () => (
        <div className="d-lg-none">
            {currentItems.length > 0 ? (
                currentItems.map((r) => (
                    <Card key={r.bookingId} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">{r.bookingNum}</span>
                            {getStatusBadge(r.status)}
                        </Card.Header>
                        <Card.Body>
                            <Card.Title>{r.accommodationName}</Card.Title>
                            <Card.Text className="text-muted">{r.roomName}</Card.Text>
                            <Card.Text><strong>투숙자명:</strong> {r.guestName}</Card.Text>
                            <Card.Text><strong>총 투숙인원:</strong> {r.totalGuestCount}</Card.Text>
                            <div className="d-flex justify-content-between text-sm">
                                <span className="text-nowrap"><strong>체크인</strong> {r.checkIn ? formatKST(r.checkIn).split("T")[0] : "—"}</span>
                            </div>
                            <div className="d-flex justify-content-between text-sm">    
                                <span className="text-nowrap"><strong>체크아웃</strong> {r.checkOut ? formatKST(r.checkOut).split("T")[0] : "—"}</span>
                            </div>
                            <Button variant="outline-dark" size="sm" className="w-100 mt-3" onClick={() => openDetail(r.bookingId)}>
                                상세 보기
                            </Button>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                <div className="text-center text-muted py-4">예약 내역이 없습니다.</div>
            )}
        </div>
    );

    return (
        <>
            <Card className="shadow-sm border-0 w-100">
                <Card.Body className="p-4">
                    <div className="mb-3 text-center">
                        <h4 className="fw-bold">예약 정보</h4>
                        <hr className="mb-4" />
                    </div>
                    {renderFilterButtons()}
                    
                    {/* PC와 모바일 뷰를 모두 렌더링하고 CSS로 제어 */}
                    {renderTableView()}
                    {renderCardView()}

                    {reservations.length > itemsPerPage && (
                        <Pagination className="justify-content-center mt-3">
                            {Array.from({ length: totalPages }, (_, idx) => (
                                <Pagination.Item key={idx + 1} active={idx + 1 === currentPage} onClick={() => setCurrentPage(idx + 1)}>
                                    {idx + 1}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    )}
                </Card.Body>
            </Card>
            <MypageReservationDetailModal open={detailOpen} bookingId={targetBookingId} onClose={closeDetail} />
        </>
    );
}

export default ReservationSection;
