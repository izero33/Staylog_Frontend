// src/pages/admin/components/AdminReservationDetailModal.tsx
import { useEffect, useState } from "react";
import api from "../../../global/api";
import { formatKST } from "../../../global/utils/date";

type Props = {
  open: boolean; // 모달 알림 여부
  bookingId: number | null; // 예약 Id
  onClose: () => void; // 모달 닫기 콜백 함수
};

// 예약 상세 데이터 타입 정의 
type ReservationDetail = {
  bookingId: number;
  /** ✅ 추가: 예약번호 */
  bookingNum: string | null;

  userName: string | null;
  guestName: string | null;
  phone: string | null;

  accommodationName: string | null;
  roomName: string | null;

  createdAt: string;   // 예약일
  checkIn: string;     // 체크인
  checkOut: string;    // 체크아웃

  status: string;      // PENDING | CONFIRMED | CANCELED | COMPLETED ...

  /** ✅ 추가: 인원 관련 */
  adults: number | null;
  children: number | null;
  infants: number | null;
  totalGuestCount: number | null;

  /** ✅ 결제 금액(서버가 amount 또는 price를 줄 수 있어 둘 다 고려) */
  finalAmount: number | null;
  price: number | null;

  paymentMethod: string | null;
  paidAt: string | null;

  statusLogs?: Array<{ at: string; from?: string | null; to: string; by?: string | null }>;
  paymentLogs?: Array<{ at: string; action: string; amount?: number | null; note?: string | null }>;
};

export default function AdminReservationDetailModal({ open, bookingId, onClose }: Props) {
  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // 데이터 로드
  useEffect(() => {
    if (!open || !bookingId) return;

    let mounted = true;
    setLoading(true);
    setErr(null);
    setDetail(null);

    api
      .get(`/v1/admin/reservations/${bookingId}`)
      .then((res) => {
        const root = (res as any)?.data?.data ?? (res as any)?.data ?? (res as any);

        // 서버 키 불일치 대비: 안전 변환
        const normalized: ReservationDetail = {
          bookingId: root.bookingId,
          bookingNum: root.bookingNum ?? null,

          userName: root.userName ?? null,
          guestName: root.guestName ?? null,
          phone: root.phone ?? null,

          accommodationName: root.accommodationName ?? null,
          roomName: root.roomName ?? null,

          createdAt: root.createdAt,
          checkIn: root.checkIn,
          checkOut: root.checkOut,

          status: root.status,

          // 인원
          adults: root.adults ?? null,
          children: root.children ?? null,
          infants: root.infants ?? null,
          totalGuestCount: root.totalGuestCount ?? null,

          // 금액 (finalAmount 우선, 없으면 price)
          finalAmount: root.finalAmount ?? null,
          price: root.price ?? null,

          paymentMethod: root.paymentMethod ?? null,
          paidAt: root.paidAt ?? null,

          statusLogs: root.statusLogs ?? [],
          paymentLogs: root.paymentLogs ?? [],
        };

        if (mounted) setDetail(normalized);
      })
      .catch((e) => {
        console.error("예약 상세 조회 실패:", e);
        if (mounted) setErr("예약 상세를 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [open, bookingId]);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.classList.add("modal-open");

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  //  표시용 유틸: 결제 금액 우선순위 (finalAmount > price)
  const displayAmount = (d?: ReservationDetail | null) => {
    if (!d) return "—";
    const val = d.finalAmount ?? d.price;
    return val != null ? `${val.toLocaleString()}원` : "—";
  };

  return (
    <>
      {/* 뒤 배경 어둡게  */}
      <div
        className="modal-backdrop fade show"
        style={{ opacity: 0.25 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal 본문 (회원 상세와 동일 구조/클래스) */}
      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              {/* 제목에 예약번호 표시 */}
              <h5 className="modal-title">
                예약 상세 {bookingId ? `#${bookingId}` : ""} 
              </h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {loading && (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <div className="spinner-border spinner-border-sm" role="status" />
                  <span>불러오는 중…</span>
                </div>
              )}

              {!loading && err && <div className="alert alert-danger">{err}</div>}

              {!loading && !err && detail && (
                <>
                  {/* 기본 정보 */}
                  <section className="mb-3">
                    <h6 className="mb-2">기본 정보</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: 160 }}>예약번호</th>
                          <td>{detail.bookingNum ?? "—"}</td>
                        </tr>
                        <tr>
                          <th>예약자</th>
                          <td>{detail.userName ?? detail.guestName ?? "—"}</td>
                        </tr>
                        <tr>
                          <th>연락처</th>
                          <td>{detail.phone ?? "—"}</td>
                        </tr>
                        <tr>
                          <th>숙소 / 객실</th>
                          <td>
                            {(detail.accommodationName ?? "—") + " / " + (detail.roomName ?? "—")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {/* 일정/상태 */}
                  <section className="mb-3">
                    <h6 className="mb-2">일정 / 상태</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: 160 }}>예약일</th>
                          <td>{formatKST(detail.createdAt)}</td>
                        </tr>
                        <tr>
                          <th>체크인</th>
                          <td>{formatKST(detail.checkIn)}</td>
                        </tr>
                        <tr>
                          <th>체크아웃</th>
                          <td>{formatKST(detail.checkOut)}</td>
                        </tr>
                        <tr>
                          <th>현재 상태</th>
                          <td>{detail.status}</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {/* ✅ 인원 */}
                  <section className="mb-3">
                    <h6 className="mb-2">인원</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: 160 }}>성인</th>
                          <td>{detail.adults ?? "—"} 명</td>
                          <th>어린이</th>
                          <td>{detail.children ?? "—"} 명</td>
                          <th>유아</th>
                          <td>{detail.infants ?? "—"} 명</td>
                          <th>총 인원</th>
                          <td>{detail.totalGuestCount ?? "—"} 명</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {/* 결제 */}
                  <section className="mb-3">
                    <h6 className="mb-2">결제</h6>
                    <table className="table table-sm">
                      <tbody>
                        <tr>
                          <th style={{ width: 160 }}>결제수단</th>
                          <td>{detail.paymentMethod ?? "—"}</td>
                        </tr>
                        <tr>
                          <th>결제금액</th>
                          <td>{displayAmount(detail)}</td>
                        </tr>
                        <tr>
                          <th>결제일시</th>
                          <td>{detail.paidAt ? formatKST(detail.paidAt) : "—"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {/* 이력(옵션) */}
                  {(detail.statusLogs?.length || detail.paymentLogs?.length) ? (
                    <section className="mb-2">
                      <h6 className="mb-2">이력</h6>

                      {detail.statusLogs?.length ? (
                        <>
                          <div className="fw-semibold mb-1">상태 변경</div>
                          <ul className="list-group mb-2">
                            {detail.statusLogs!.map((log, idx) => (
                              <li key={idx} className="list-group-item d-flex justify-content-between">
                                <span>
                                  {log.from ? `${log.from} → ${log.to}` : log.to}
                                  {log.by ? ` · by ${log.by}` : ""}
                                </span>
                                <span className="text-muted">{formatKST(log.at)}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}

                      {detail.paymentLogs?.length ? (
                        <>
                          <div className="fw-semibold mb-1">결제</div>
                          <ul className="list-group">
                            {detail.paymentLogs!.map((log, idx) => (
                              <li key={idx} className="list-group-item d-flex justify-content-between">
                                <span>
                                  {log.action}
                                  {log.amount != null ? ` · ${log.amount.toLocaleString()}원` : ""}
                                  {log.note ? ` · ${log.note}` : ""}
                                </span>
                                <span className="text-muted">{formatKST(log.at)}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}
                    </section>
                  ) : null}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
