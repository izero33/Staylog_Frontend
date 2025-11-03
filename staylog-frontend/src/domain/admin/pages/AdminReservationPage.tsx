import "bootstrap/dist/css/bootstrap.min.css";
import { RESERVATION_STATUS } from "../types/AdminReservationTypes";
import type { ReservationStatus, AdminReservation, ReservationListResponse } from "../types/AdminReservationTypes";
import { useEffect, useState } from "react";
import { formatKST } from "../../../global/utils/date";
import api from "../../../global/api";




function AdminReservationPage() {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
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


  return (
    <div className="container-fluid py-3">
        <h1>예약 관리 페이지</h1>
        <div className="table-responsive">
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
