import "bootstrap/dist/css/bootstrap.min.css";
import { type AdminReservation} from "../types/AdminReservationTypes";
import { useEffect, useMemo, useState } from "react";
import { formatKST } from "../../../global/utils/date";
import api from "../../../global/api";
import AdminReservationDetailModal from "../components/AdminReservationDetailModal";
import AdminStatusPill from "../components/AdminStatusPill";
import useCommonCodeSelector from "../../common/hooks/useCommonCodeSelector";
import type { CommonCodeDto } from "../../common/types";




function AdminReservationPage() {

    // DB 공통 코드 1. Redux의 공통 코드 스토어에서 특정 그룹 불러오기
    const reservationStatusList = useCommonCodeSelector("reservationStatus"); 

    // 빠른 조회를 위한 codeId = CommonCodeDto Mapping 2. 그 리스트를 Map 형태로 변환 
    const reservationStatusMap = useMemo<Map<string, CommonCodeDto>> (()=> {
      const m = new Map <string, CommonCodeDto>();
      for (const row of reservationStatusList ?? []) {
        m.set(row.codeId, row);
      }
      return m;
    },[reservationStatusList]);

    // 서버가 "CONFIRM" 처럼 단축형으로 줄 수 있어서 통일 시키기
    const normalizeStatus = (code? : string | null ) => 
      !code ? "" : code.startsWith("RES_") ? code : `RES_${code}`;
    
    // 서버값 우선 -> DB 공통 코드 -> 안전한 기본 값 순으로 라벨 색상 결정
    const getStatusView = (status?: string | null, statusName?: string | null, statusColor?: string | null) => {
    const norm = normalizeStatus(status);
    // 3. 예약 목록 렌더링 시, 상태 코드에 해당하는 공통코드(label, color) 참조
    const cc = reservationStatusMap.get(norm);
      return {
      label: (statusName ?? cc?.codeName ?? norm) || "—",
      color: statusColor ?? cc?.attr1 ?? "#6c757d", // attr1을 색상 HEX로 사용한다는 전제
    };
  };
    // 예약 목록 상태 관리
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    // 상세 모달 상태 관리
    const [detailOpen, setDetailOpen] = useState(false);
    const [targetBookingId, setTargetBookingId] = useState<number | null>(null);
    // 로딩 / 에러 메시지 상태 관리 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 목록 조회
      useEffect(() => {
        let mounted = true; // 컴포넌트가 현재 화면에 살아있는지 추적하기 위함
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
                  {reservations.map((res) => {
                    const view = getStatusView(res.status, res.statusName, res.statusColor);
                    return (
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
                          <td className="text-center">
                            <AdminStatusPill label={view.label} bgColor={view.color}/>
                          </td>
                      </tr>
                    );
                  })}
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
