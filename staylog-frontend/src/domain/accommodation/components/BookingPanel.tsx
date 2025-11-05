import { useEffect, useRef, useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale";
import type { AccommodationRoomListType } from "../types/AccommodationType";

type Props = {
  // 상단 탭
  onClickSchedule?: () => void;
  onClickGuests?: () => void;
  // 객실 정보
  name: string;
  imageUrl?: string;
  rooms?: AccommodationRoomListType[];
  onReserve?: () => void;
  // 예약 불가일
  disabledDates?: string[];
  onSelectRoom?: (room: AccommodationRoomListType) => void;
  // 객실 상세 페이지에서는 객실 목록 숨기기
  showRoomSelect?: boolean;
};

// 상단 날짜 탭 예시로 11.22 형식으로 표시
const formatDate = (date: Date | null): string => {
  if (!date) return "";
  return `${date.getMonth() + 1}.${date.getDate()}`;
};

// 금액 원화 형식으로 표시
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("ko-KR");
};

function BookingPanel({
  rooms = [],
  onReserve,
  disabledDates = [],
  onSelectRoom,
  showRoomSelect = true,
}: Props) {

  //달력 열림 닫힘 상태
  const [openCalendar, setOpenCalendar] = useState(false);
  // 인원 열림 닫힘 상태
  const [openGuest, setOpenGuest] = useState(false);

  // 체크인 체크아웃 날짜 상태
  const [[checkIn, checkOut], setRange] = useState<[Date | null, Date | null]>([null, null]);

  //화면의 가로폭에 따라 1개월 보일지 2개월 보일지 결정
  const [monthsShown, setMonthsShown] = useState(2);

  // 인원 수 상태 (성인, 어린이, 유아 순서)
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  // 선택된 객실 (첫 번째 객실을 기본으로 표시)
  const [selectedRoom, setSelectedRoom] = useState<AccommodationRoomListType | null>(
    rooms.length > 0 ? rooms[0] : null
  );

  // 커스텀한 객실 드롭다운 상태
  const [openRoomDropdown, setOpenRoomDropdown] = useState(false);
  const roomWrapRef = useRef<HTMLDivElement>(null);

  // 래퍼(항상 DOM에 있음) & 팝업(열릴 때만 DOM에 생김)
  const wrapRef = useRef<HTMLDivElement>(null); // 달력과 인원 팝업을 감싸는 컨테이너
  const popRef = useRef<HTMLDivElement>(null);  // 달력과 팝업 자체를 참조

  // 달력 토글 핸들러
  const handleClickSchedule = () => setOpenCalendar(e => !e);

  // 객실 선택 변경 핸들러
  const handleRoomChange = (roomId: number) => {
    const room = rooms.find(r => r.roomId === roomId) || null;
    setSelectedRoom(room);
    onSelectRoom?.(room!);
  };

  // 숙박일 계산
  const nights = checkIn && checkOut
    ? Math.round(
      ((new Date(checkOut).setHours(0, 0, 0, 0) - new Date(checkIn).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
    )
    : 0;

  // 총 인원 계산
  const totalGuests = adultCount + childCount + infantCount;
  // 1박 기준 객실 가격
  const roomPrice = selectedRoom ? selectedRoom.price : 0;
  // 총액 : 1박 기준 객실 가격 * 숙박일수
  const totalPrice = roomPrice > 0 ? Math.round(roomPrice * nights) : 0;

  // 예약 불가일 -> Date 배열
  const excludeDates = (disabledDates ?? []).map(
    d => new Date(d + "T00:00:00")
  );
  // 화면 넓이에 따라 1/2개월 자동 전환
  useEffect(() => {
    const recalc = () => {
      const w = window.innerWidth;
      setMonthsShown(w < 1100 ? 1 : 2);
    };
    recalc();

    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  // 달력이 열릴 때도 한 번 보정 (초기 렌더 오차 방지)
  useEffect(() => {
    if (!openCalendar) return;
    const el = wrapRef.current;
    if (!el) return;
    const w = el.offsetWidth || window.innerWidth;
    setMonthsShown(w < 660 ? 1 : 2);
  }, [openCalendar]);

  // 달력과 인원 팝업 밖을 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpenCalendar(false);
        setOpenGuest(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // 객실 드롭다운 밖 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (roomWrapRef.current && !roomWrapRef.current.contains(e.target as Node)) {
        setOpenRoomDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return <>
    <Card className="bg-white">
      {/* 일정과 인원 탭*/}
      <Card.Header className="p-0 border-0">
        <div className="border-bottom bg-white d-flex" style={{ position: "relative" }}>
          {/* 일정 */}
          <div className="w-50 p-3 d-flex align-items-center justify-content-center cursor-pointer"
            onClick={handleClickSchedule} style={{ borderRight: "1px solid #dee2e6" }}>
            <i className="bi bi-calendar-event me-2 fs-5 text-secondary" />
            <span className="fw-bold">{checkIn && checkOut ? `${formatDate(checkIn)} - ${formatDate(checkOut)}` : "날짜 선택"}</span>
          </div>

          {/* 인원 */}
          <div
            className="w-50 p-3 d-flex align-items-center justify-content-center cursor-pointer"
            onClick={() => setOpenGuest(v => !v)}>
            <i className="bi bi-people me-2 fs-5 text-secondary" />
            <span className="fw-bold">{totalGuests}인</span>
          </div>

          {/* 달력과 인원 팝업 영역 */}
          <div ref={wrapRef} style={{ position: "absolute", top: "100%", left: 0, width: '100%', zIndex: 2000 }}>
            {/* 달력 날짜 선택 */}
            {openCalendar && (
              <div ref={popRef}
                className="border rounded bg-white shadow mt-1 p-2 d-inline-block"
                style={{ zIndex: 2000, width: "max-content", maxWidth: "90vw" }}>
                <DatePicker
                  key={monthsShown}
                  inline
                  locale={ko}
                  selectsRange
                  startDate={checkIn}
                  endDate={checkOut}
                  onChange={(v) => {
                    setRange(v as [Date | null, Date | null]);
                  }}
                  minDate={new Date()}
                  monthsShown={monthsShown}
                  dateFormat="yyyy.MM.dd"
                  excludeDates={excludeDates}
                />
                <div className="text-end mt-2">
                  <Button className="btn btn-dark" size="sm" variant="primary" onClick={() => setOpenCalendar(false)}>확인</Button>
                </div>
              </div>
            )}

            {/* 인원 선택 */}
            {openGuest && (
              <div className="position-absolute bg-white border rounded p-3 shadow-lg mt-1"
                style={{ zIndex : 2000, right : 0, minWidth : "15.7rem" }}>
                {[
                  { label : "성인", count: adultCount, setCount: setAdultCount, min: 1 },
                  { label : "어린이", count: childCount, setCount: setChildCount, min: 0 },
                  { label : "유아", count: infantCount, setCount: setInfantCount, min: 0 },
                ].map((item) => (
                  <div key={item.label} className="d-flex align-items-center justify-content-between mb-2">
                    <span>{item.label}</span>
                    <div>
                      <Button className="p-0 border-0" size="sm" variant="outline-secondary"
                        style={{ width: "30px", height: "30px" }}
                        onClick={() => item.setCount(c => Math.max(item.min, c - 1))}>
                        <i className="bi bi-dash"></i>
                      </Button>
                      <span className="mx-2 fw-bold">{item.count}</span>
                      <Button className="p-0 border-0" size="sm" variant="outline-secondary"
                        style={{ width: "1.8rem", height: "1.8rem" }}
                        onClick={() => {
                          const total = adultCount + childCount + infantCount;
                          const maxGuest = selectedRoom?.maxGuest ?? 10;
                          if (total < maxGuest) {
                            item.setCount(c => c + 1);
                          } else {
                            alert(`이 객실의 최대 인원은 ${maxGuest}명입니다`);
                          }
                        }}>
                        <i className="bi bi-plus"></i>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="text-end mt-3">
                  <Button className="btn btn-dark" size="sm" variant="primary" onClick={() => setOpenGuest(false)}>확인</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-4">
        {/* 객실 정보 및 가격 표시 */}
        {selectedRoom && (
          <div className="mb-4 d-flex align-items-start">
            {/* 썸네일 이미지 컨테이너 */}
            <div className="rounded me-3 bg-light d-flex justify-content-center align-items-center"
              style={{ width: "5rem", height: "5rem" }}>
              <i className="bi bi-house-door text-muted fs-4"></i>
            </div>

            <div className="flex-grow-1">
                <div className="fw-bold mb-1" style={{fontSize : "1.13rem"}}>{selectedRoom.name}</div>
                <p className="text-muted mb-2" style={{fontSize : "0.8rem"}}>
                    기본형 / 최대 {selectedRoom.maxGuest}명
                </p>

              <div className="d-flex align-items-center">
                <span className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
                  ₩{formatCurrency(roomPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 해당 숙소에 등록된 객실이 존재하지 않는다면 해당 내용 표시 */}
        {rooms.length === 0 && (
            <div className="mb-4 text-center p-3 border rounded bg-light">
                등록된 객실이 없습니다
            </div>
        )}

        {/* 객실 선택 커스텀 드롭다운 */}
        {rooms.length > 1 && showRoomSelect && (
          <div className="mb-4" ref={roomWrapRef}>
            <p className="fw-bold mb-2" style={{fontSize : "1.0rem"}}>객실 선택</p>
            <div className="border rounded position-relative">
              <div className="p-2 d-flex justify-content-between align-items-center cursor-pointer"
                onClick={() => setOpenRoomDropdown(v => !v)}>
                <span>{selectedRoom?.name || "객실을 선택하세요"}</span>
                <i className={`bi ${openRoomDropdown ? "bi-chevron-up" : "bi-chevron-down"}`}></i>
              </div>
              {openRoomDropdown && (
                <div className="position-absolute bg-white border rounded w-100 mt-1 shadow-lg" style={{ zIndex: 2000 }}>
                  {rooms.map(room => (
                    <div key={room.roomId} className="roomSelect p-2 cursor-pointer"
                      onClick={() => {
                        handleRoomChange(room.roomId);
                        setOpenRoomDropdown(false);
                      }}>
                      {room.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 총액 계산 및 예약 버튼 */}
        {nights > 0 && selectedRoom && (
          <div className="p-3 border-top pt-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">객실 요금</span>
              <span className="fw-bold">
                ₩{formatCurrency(roomPrice)} <i className="bi bi-x"></i> {nights} 박
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-end mt-3">
              <span className="fs-5 fw-bold">총액</span>
                            <span className="text-dark fw-bolder" style={{ fontSize: "1.5rem" }}>
                ₩{formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* 예약 버튼 */}
        <Button className="w-100 py-3 mt-2 fw-bold" variant="dark" style={{fontSize : "1.1rem"}}
          onClick={onReserve} disabled={!selectedRoom || nights === 0}>
          예약하기
        </Button>
      </Card.Body>
    </Card>
  </>
}

export default BookingPanel;