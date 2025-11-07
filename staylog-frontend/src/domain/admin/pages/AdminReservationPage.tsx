import "bootstrap/dist/css/bootstrap.min.css";
import { type AdminReservation } from "../types/AdminReservationTypes";
import { useEffect, useMemo, useState } from "react";
import { formatKST } from "../../../global/utils/date";
import api from "../../../global/api";
import AdminReservationDetailModal from "../components/AdminReservationDetailModal";
import AdminStatusPill from "../components/AdminStatusPill";
import useCommonCodeSelector from "../../common/hooks/useCommonCodeSelector";
import type { CommonCodeDto } from "../../common/types";
import Pagination from "../../../global/components/Pagination";
import '../css/AdminTable.css';
import type { PageResponse } from "../../../global/types/Paginationtypes";


function AdminReservationPage() {

      //  페이지 상태 
      const [searchParams, setSearchParams] = useState({
        pageNum: 1,
        pageSize: 10,
      });
      const [page, setPage] = useState<PageResponse | null>(null);


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

    // 이번달 예약 / 매출 통계 타입 정의
    type AdminMonthlyStats = {
      totalCount: number;
      confirmedCount: number;
      canceledCount: number;
      monthlyRevenue: number;
    };

    // 상태 관리
    const [stats, setStats] = useState<AdminMonthlyStats | null>(null);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);
    
    // 페이지 첫 렌더링 시 월간 통계 조회 하기
    useEffect(() => {
      let mounted = true;
      setStatsLoading(true);
      api
        .get<AdminMonthlyStats>("/v1/admin/reservations/stats/monthly")
        .then((res) => {
          const root = (res as any)?.data?.data ?? (res as any)?.data ?? (res as any);
          if (mounted) setStats(root as AdminMonthlyStats);
        })
        .catch((err) => {
          if (mounted) setStats(null);
            console.error("월간 통계 조회 실패:", err);
        })
        .finally(() => mounted && setStatsLoading(false));
        
      return () => { mounted = false; };
    }, []);

    // 목록 조회
      useEffect(() => {
        let mounted = true; // 컴포넌트가 현재 화면에 살아있는지 추적하기 위함
        setLoading(true);
        setErrorMsg(null);
        api
          .get<AdminReservation[]>("/v1/admin/reservations", { params : searchParams } )
          .then((res) => {
            const root = (res as any)?.data?.data ?? (res as any)?.data ?? (res as any);
            const list = Array.isArray(root?.reservations) ? root.reservations : [];
            const pageObj = root?.page ?? null;
            console.log("✅ 응답 구조", res);
            if (mounted) {
              setReservations(list);
              setPage(pageObj);
            }
          })
          .catch((err) => {
            console.error("예약 목록 조회 불가:", err);
            if (mounted) setErrorMsg("예약 목록을 불러오지 못했습니다."); 
          })
          .finally(() => mounted && setLoading(false));
    
        return () => {
          mounted = false;
        };
      }, [searchParams]);

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

    // 페이지 변경 핸들러 
  const handlePageChange = (nextPageNum: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageNum: nextPageNum,
    }));
  };

  return (
    <div className="container-fluid py-3">
        <h1>예약 관리 페이지</h1>

        {/* 이번 달 요약 카드  ( 매출, 예약 건 , 취소 건, 확정 건 )*/}
        <div className="row g-3 mt-2">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">이번 달 총 예약</div>
                <div className="fs-4">{statsLoading ? "—" : (stats?.totalCount ?? 0)}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">확정</div>
                <div className="fs-4">{statsLoading ? "—" : (stats?.confirmedCount ?? 0)}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">취소</div>
                <div className="fs-4">{statsLoading ? "—" : (stats?.canceledCount ?? 0)}</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">이번 달 매출</div>
                <div className="fs-4">
                  {statsLoading ? "—" : `${(stats?.monthlyRevenue ?? 0).toLocaleString("ko-KR")}원`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 요약 정보 */}
      {page && (
        <div className="text-end text-muted mt-2">
          전체 {page.totalCount}건 ({page.pageNum}/{page.totalPage} 페이지)
        </div>
      )}
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
          <table className="table table-striped align-middle text-center">
              <thead className="table-light">
                  <tr>
                    <th style={{ width: '6%' }}>번호</th>
                      <th>회원이름</th>
                      <th>숙소명</th>
                      <th>예약일</th>
                      <th>금액</th>
                      <th>체크인</th>
                      <th>체크아웃</th>
                      <th>예약 상태</th>
                  </tr>
              </thead>
              <tbody>
                  {reservations.map((res, index) => {
                    const view = getStatusView(res.status, res.statusName, res.statusColor);
                    return (
                      <tr key={res.bookingId}>
                        <td>{page ? (page.pageNum - 1) * page.pageSize + index + 1 : index + 1}</td>
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
                          <td className="text-center">{res.amount !== null && res.amount !== undefined
                                ? res.amount.toLocaleString('ko-KR') : '-'}원</td>
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
            {/* 페이지네이션 */}
            {page && <Pagination page={page} onPageChange={handlePageChange} />}
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
