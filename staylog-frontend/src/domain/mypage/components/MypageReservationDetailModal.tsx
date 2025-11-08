// src/domain/mypage/components/MypageReservationDetailModal.tsx
    import { useEffect, useState } from "react";
    import { getReservationDetail } from "../api/mypageApi"; // api.ts 함수 사용
    import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken"; // userId hook
    import { formatKST } from "../../../global/utils/date";
    import type { ReservationDetail, ReservationModalProps } from "../types/mypageTypes";


function MypageReservationDetailModal({ open, bookingId, onClose }: ReservationModalProps) {
    const userId = useGetUserIdFromToken(); // userId 가져오기
    const [detail, setDetail] = useState<ReservationDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open || !bookingId || !userId) return; // userId 체크 추가        
        let mounted = true;
        setLoading(true);
        setErr(null);
        setDetail(null);

        getReservationDetail(userId, bookingId) // 새로운 API 함수 호출
            .then((res) => {
                if(mounted){
                    setDetail(res || null); // api.ts에서 이미 데이터 추출을 처리하므로, res를 바로 사용
                }            
            })
            .catch((e) => {
                console.error("예약 상세 조회 실패:", e);
                if(mounted){
                    setErr("예약 상세 정보를 불러오지 못했습니다.");
                }
            })
            .finally(() => {
                if(mounted){
                    setLoading(false);
                }
            });
        return () => {
            mounted = false;
        }
    }, [open, bookingId, userId]); // userId 의존성 추가

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

    const displayAmount = (d?: ReservationDetail | null) =>
        d?.amount != null ? `${d.amount.toLocaleString()}원` : "—";

    return (
        <>
        {/* 어두운 배경 */}
        <div
            className="modal-backdrop fade show"
            style={{ opacity: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
        />

        {/* 모달 */}
        <div className="modal fade show d-block" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
                <div className="modal-header">
                <h4 className="modal-title">
                    예약 상세 {detail?.bookingNum ? `· ${detail.bookingNum}` : ""}
                </h4>
                <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
                </div>

                <div className="modal-body">
                {loading && (
                    <div className="d-flex align-items-center gap-2 text-muted">
                    <div className="spinner-border spinner-border-sm" role="status" />
                        <span>불러오는 중...</span> 
                    </div>
                )}
                {!loading && err && <div className="alert alert-danger">{err}</div>}
                {!loading && !err && detail && (
                    <div className="container-fluid">
                        {/* 기본 정보 */}
                        <section className="mb-4">
                            <h5 className="text-start mb-3 border-bottom pb-2">기본 정보</h5>
                            <dl className="row">
                                <dt className="text-start col-sm-4 text-muted">예약번호</dt>
                                <dd className="text-start col-sm-8">{detail.bookingNum ?? "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">투숙자명</dt>
                                <dd className="text-start col-sm-8">{detail.guestName ?? "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">숙소 / 객실</dt>
                                <dd className="text-start col-sm-8">{(detail.accommodationName ?? "—") + " / " + (detail.roomName ?? "—")}</dd>
                            </dl>
                        </section>

                        {/* 일정 / 상태 */}
                        <section className="mb-4">
                            <h5 className="text-start mb-3 border-bottom pb-2">일정 / 상태</h5>
                            <dl className="row">
                                <dt className="text-start col-sm-4 text-muted">예약일</dt>
                                <dd className="text-start col-sm-8">{formatKST(detail.createdAt)}</dd>

                                <dt className="text-start col-sm-4 text-muted">체크인</dt>
                                <dd className="text-start col-sm-8">{detail.checkIn ? formatKST(detail.checkIn).split("T")[0] : "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">체크아웃</dt>
                                <dd className="text-start col-sm-8">{detail.checkOut ? formatKST(detail.checkOut).split("T")[0] : "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">상태</dt>
                                <dd className="text-start col-sm-8">{detail.status ?? "—"}</dd>
                            </dl>
                        </section>

                        {/* 인원 */}
                        <section className="mb-4">
                            <h5 className="text-start mb-3 border-bottom pb-2">인원</h5>
                            <dl className="row">
                                <dt className="text-start col-sm-4 text-muted">성인</dt>
                                <dd className="text-start col-sm-8">{detail.adults ?? "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">어린이</dt>
                                <dd className="text-start col-sm-8">{detail.children ?? "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">유아</dt>
                                <dd className="text-start col-sm-8">{detail.infants ?? "—"}</dd>
                            </dl>
                        </section>

                        {/* 결제 */}
                        <section>
                            <h5 className="text-start mb-3 border-bottom pb-2">결제</h5>
                            <dl className="row">
                                <dt className="text-start col-sm-4 text-muted">결제수단</dt>
                                <dd className="text-start col-sm-8">{detail.paymentMethod ?? "—"}</dd>

                                <dt className="text-start col-sm-4 text-muted">결제금액</dt>
                                <dd className="text-start col-sm-8">{displayAmount(detail)}</dd>

                                <dt className="text-start col-sm-4 text-muted">결제일시</dt>
                                <dd className="text-start col-sm-8">{detail.paidAt ? formatKST(detail.paidAt) : "—"}</dd>
                            </dl>
                        </section>
                    </div>
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

export default MypageReservationDetailModal;
