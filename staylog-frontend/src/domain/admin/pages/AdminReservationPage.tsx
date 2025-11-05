import "bootstrap/dist/css/bootstrap.min.css";
import { type AdminReservation} from "../types/AdminReservationTypes";
import { useEffect, useState } from "react";
import { formatKST } from "../../../global/utils/date";
import api from "../../../global/api";
import AdminReservationDetailModal from "../components/AdminReservationDetailModal";
import { getStatusLabel } from "../types/AdminReservationStatusLabels";




function AdminReservationPage() {


    // 예약 목록 상태
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    // 상세 모달 상태
    const [detailOpen, setDetailOpen] = useState(false);
    const [targetBookingId, setTargetBookingId] = useState<number | null>(null);
    // 로딩 / 에러 메시지 상태 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 목록 조회
      useEffect(() => {
        let mounted = true;
        setLoading(true);
        setErrorMsg(null);
        api
          .get<AdminReservation[]>("/v1/admin/reservations", { params: { pageNum: 1 } })
          .then((res) => {
            const list = Array.isArray(res) ? res : [];
            console.log("✅ 응답 구조", res);
            if (mounted) setReservations(list);
          })
          .catch((err) => {
            console.error("예약 목록 조회 불가:", err);
            if (mounted) setErrorMsg("예약 목록을 불러오지 못했습니다.");
          })
          .finally(() => mounted && setLoading(false));
    
        return () => {
          mounted = false;
        };
      }, []);

      // 예약 상세 모달 * 이름 클릭 → 상세 모달 열기
    const openDetail = (bookingId: number) => {
    setTargetBookingId(bookingId);
    setDetailOpen(true);
  };
  // 예약 상세 모달 닫기
    const closeDetail = () => {
    setDetailOpen(false);
    setTargetBookingId(null);
  };


  return (
    <div className="container-fluid py-3">
        <h1>예약 관리 페이지</h1>
        <div className="table-responsive">
        {/* 로딩 / 에러 상태 */}
        {loading && (
        <div className="d-flex align-items-center gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>불러오는 중…</span>
        </div>
        )}
        {!loading && errorMsg && (
        <div className="alert alert-danger" role="alert">
        {errorMsg}
        </div>
      )}
          <table className="table table-striped align-middle">
              <thead className="table-light">
                  <tr>
                      <th>회원이름</th>
                      <th>숙소명</th>
                      <th>예약일</th>
                      {/* <th>결제일</th> */}
                      <th>체크인</th>
                      <th>체크아웃</th>
                      <th>예약 상태</th>
                  </tr>
              </thead>
              <tbody>
                  {reservations.map((res) => (
                      <tr key={res.bookingId}>
                          <td>
                            <button 
                            type="button"
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => openDetail(res.bookingId)}
                            title="상세 보기"
                          >
                            {res.userName ?? res.guestName ?? "—"}
                            </button></td>
                          <td>{res.accommodationName ?? res.roomName ?? "—"}</td>
                          <td>{formatKST(res.createdAt)}</td>
                          <td>{formatKST(res.checkIn)}</td>
                          <td>{formatKST(res.checkOut)}</td>
                          <td>{getStatusLabel(res.status, res.statusName)}</td>
                      </tr>
                  ))}
              </tbody>
            </table>
        </div>
          {/* 상세 모달 */}
      <AdminReservationDetailModal
        open={detailOpen}
        bookingId={targetBookingId}
        onClose={closeDetail}
      />
    </div>
  );
}

export default AdminReservationPage;
