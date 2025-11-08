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

export default function AdminReservationPage() {
  // 페이지 상태
  const [searchParams, setSearchParams] = useState({ pageNum: 1, pageSize: 10 });
  const [page, setPage] = useState<PageResponse | null>(null);

  // 상태 코드 매핑
  const reservationStatusList = useCommonCodeSelector("reservationStatus");
  const reservationStatusMap = useMemo<Map<string, CommonCodeDto>>(() => {
    const m = new Map<string, CommonCodeDto>();
    for (const row of reservationStatusList ?? []) m.set(row.codeId, row);
    return m;
  }, [reservationStatusList]);

  const normalizeStatus = (code?: string | null) =>
    !code ? "" : code.startsWith("RES_") ? code : `RES_${code}`;

  const getStatusView = (
    status?: string | null,
    statusName?: string | null,
    statusColor?: string | null
  ) => {
    const norm = normalizeStatus(status);
    const cc = reservationStatusMap.get(norm);
    return {
      label: statusName ?? cc?.codeName ?? norm ?? "—",
      color: statusColor ?? cc?.attr1 ?? "#6c757d",
    };
  };

  // 목록/상태
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [targetBookingId, setTargetBookingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 월간 통계
  type AdminMonthlyStats = {
    totalCount: number;
    confirmedCount: number;
    canceledCount: number;
    monthlyRevenue: number;
  };
  const [stats, setStats] = useState<AdminMonthlyStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 월간 통계 조회
  useEffect(() => {
    let mounted = true;
    setStatsLoading(true);
    api
      .get<AdminMonthlyStats>("/v1/admin/reservations/stats/monthly")
      .then((res) => {
        const root = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        if (mounted) setStats(root);
      })
      .catch((err) => console.error("월간 통계 조회 실패:", err))
      .finally(() => mounted && setStatsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  // 목록 조회
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);
    api
      .get<AdminReservation[]>("/v1/admin/reservations", { params: searchParams })
      .then((res) => {
        const root = (res as any)?.data?.data ?? (res as any)?.data ?? res;
        const list = Array.isArray(root?.reservations) ? root.reservations : [];
        const pageObj = root?.page ?? null;
        if (mounted) {
          setReservations(list);
          setPage(pageObj);
        }
      })
      .catch((err) => {
        console.error("예약 목록 조회 실패:", err);
        if (mounted) setErrorMsg("예약 목록을 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [searchParams]);

  // 상세 모달
  const openDetail = (bookingId: number) => {
    setTargetBookingId(bookingId);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setDetailOpen(false);
    setTargetBookingId(null);
  };

  // 페이지 변경
  const handlePageChange = (nextPageNum: number) => {
    setSearchParams((prev) => ({ ...prev, pageNum: nextPageNum }));
  };

  return (
    <div className="container-fluid py-3">
      <h1 className="fw-bold mb-3">예약 관리 페이지</h1>

      {/* 월간 요약 카드 */}
      <div className="row g-3 mt-2">
        {[
          { label: "이번 달 총 예약", value: stats?.totalCount },
          { label: "확정", value: stats?.confirmedCount },
          { label: "취소", value: stats?.canceledCount },
          { label: "이번 달 매출", value: `${(stats?.monthlyRevenue ?? 0).toLocaleString("ko-KR")}원` },
        ].map((item, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="text-muted small">{item.label}</div>
                <div className="fs-4">{statsLoading ? "—" : item.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 요약 정보 */}
      {page && (
        <div className="text-end text-muted mt-2">
          전체 {page.totalCount}건 ({page.pageNum}/{page.totalPage} 페이지)
        </div>
      )}

      {/* 로딩/에러 */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted mt-3">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>불러오는 중…</span>
        </div>
      )}
      {!loading && errorMsg && <div className="alert alert-danger mt-3">{errorMsg}</div>}

      {/* 데스크톱 (테이블형)*/}
      {!loading && !errorMsg && (
        <>
          <div className="table-responsive mt-3 d-none d-lg-block">
            <table className="table table-striped align-middle text-center">
              <thead className="table-light">
                <tr>
                  <th>번호</th>
                  <th>회원 이름</th>
                  <th>숙소명</th>
                  <th>예약일</th>
                  <th>금액</th>
                  <th>체크인</th>
                  <th>체크아웃</th>
                  <th>예약 상태</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-5 text-muted">등록된 예약이 없습니다.</td></tr>
                ) : (
                  reservations.map((res, index) => {
                    const view = getStatusView(res.status, res.statusName, res.statusColor);
                    return (
                      <tr key={res.bookingId}>
                        <td>{((page?.pageNum ?? 1) - 1) * (page?.pageSize ?? 10) + index + 1}</td>
                        <td>
                          <button
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => openDetail(res.bookingId)}
                          >
                            {res.userName ?? res.guestName ?? "—"}
                          </button>
                        </td>
                        <td>{res.accommodationName ?? res.roomName ?? "—"}</td>
                        <td>{formatKST(res.createdAt)}</td>
                        <td>{res.finalAmount?.toLocaleString("ko-KR") ?? "-"}원</td>
                        <td>{formatKST(res.checkIn)}</td>
                        <td>{formatKST(res.checkOut)}</td>
                        <td><AdminStatusPill label={view.label} bgColor={view.color} /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 (카드형)*/}
          <div className="d-lg-none d-grid gap-3 mt-3">
            {reservations.map((res) => {
              const view = getStatusView(res.status, res.statusName, res.statusColor);
              return (
                <div key={res.bookingId} className="card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() => openDetail(res.bookingId)}
                        >
                          {res.userName ?? res.guestName ?? "—"}
                        </button>
                        <div className="text-muted small">{res.accommodationName ?? res.roomName ?? "—"}</div>
                      </div>
                      <span className="badge" style={{ backgroundColor: view.color, color: "#fff" }}>
                        {view.label}
                      </span>
                    </div>
                    <div className="mt-2 small text-muted">
                      예약일 {formatKST(res.createdAt)}<br />
                      체크인 {formatKST(res.checkIn)} / 체크아웃 {formatKST(res.checkOut)}
                    </div>
                    <div className="mt-3 fw-semibold text-end">
                      {res.finalAmount?.toLocaleString("ko-KR") ?? "-"}원
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      {page && <Pagination page={page} onPageChange={handlePageChange} />}

      {/* 상세 모달 */}
      <AdminReservationDetailModal
        open={detailOpen}
        bookingId={targetBookingId}
        onClose={closeDetail}
      />
    </div>
  );
}
