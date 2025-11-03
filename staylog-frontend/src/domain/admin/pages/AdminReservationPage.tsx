import "bootstrap/dist/css/bootstrap.min.css";
import { RESERVATION_STATUS, type AdminReservation, type ReservationStatus,} from "../types/AdminReservationTypes";
import { useEffect, useState } from "react";
import { formatKST } from "../../../global/utils/date";
import api from "../../../global/api";




function AdminReservationPage() {

    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

     // 취소요청 모달 상태
    const [modalOpen, setModalOpen] = useState(false);
    const [target, setTarget] = useState<AdminReservation | null>(null);
    const [saving, setSaving] = useState(false);

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

        // 상태 변경
        async function patchStatus(bookingId:number, status:ReservationStatus) {
        // 인터셉터로 data언래핑 가정
        return api.patch(`/v1/admin/reservations/${bookingId}/status`, null, { params: { status } });
    }


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
                            <td>{res.userName ?? res.guestName ?? "—"}</td>
                            <td>{res.accommodationName ?? res.roomName ?? "—"}</td>
                            <td>{formatKST(res.createdAt)}</td>
                            <td>{formatKST(res.checkIn)}</td>
                            <td>{formatKST(res.checkOut)}</td>
                            <td>{res.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
}

export default AdminReservationPage;
