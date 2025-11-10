// 기존 import 아래에 AccommodationRoomListType import 추가
import { useParams } from "react-router-dom";
import type { AccommodationRoomListType } from "../types/AccommodationType";
import { useEffect, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import type { RoomDetailDto } from "../types/RoomDetailDto";
import api from "../../../global/api";
import BookingPanel from "../components/BookingPanel";
import { Card, Col, Container, Offcanvas, Row, Spinner } from "react-bootstrap";
import FloatingReserveBubble from "../components/FloatingReserveBubble";
import '../css/room.css';
import AccommodationInfo from "../components/AccommodationInfo";
import { getImageUrl } from "../../../global/hooks/getImageUrl";


function RoomDetail() {

  const { roomId } = useParams(); // ← URL에서 roomId 추출
  const [roomDetail, setRoomDetail] = useState<RoomDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [openReserve, setOpenReserve] = useState(false);
  const isMobile = useIsMobile(); //모바일 크기일 때 true

  // 숙소정보
  const featchRoom = () => {
    if (!roomId) {
      setError("유효하지 않은 객실 경로입니다.");
      return;
    }
    api.get<RoomDetailDto>(`/v1/room/${roomId}`)
      .then(res => {
        setRoomDetail(res)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
        setError("객실 정보를 불러오지 못했습니다.");
      }
      )
  }

  // 블락할 날짜 가져오기
  useEffect(() => {
    if (!roomId) return;

    const today = new Date();
    const to = new Date();
    to.setMonth(today.getMonth() + 2);

    const fromStr = today.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];

    api.get<string[]>(`/v1/${roomId}/blocked`, { params: { from: fromStr, to: toStr } })
      .then(res => setBlockedDates(res))
      .catch(err => {
        console.error(err);
        setBlockedDates([]);
      });
  }, [roomId]);

  const handleReserve = () => {
    alert("예약하기");
  };

  useEffect(() => {
    featchRoom();
  }, [roomId]);

  const roomImageUrl = getImageUrl("ROOM", Number(roomId));

  // RoomDetailDto -> AccommodationRoomListType 변환 (타입 완전 매칭)
  const roomForBooking: AccommodationRoomListType | null = roomDetail
    ? {
      roomId: roomDetail.roomId,
      name: roomDetail.name,
      price: roomDetail.price,

      // AccommodationRoomListType 이 요구하는 필수 필드들 채우기
      maxAdult: roomDetail.maxAdult ?? 0,
      maxChildren: roomDetail.maxChildren ?? 0,
      maxInfant: roomDetail.maxInfant ?? 0,

      // 총 인원(편의상)
      maxGuest:
        (roomDetail.maxAdult ?? 0) +
        (roomDetail.maxChildren ?? 0) +
        (roomDetail.maxInfant ?? 0),

      rmTypeName: roomDetail.rmTypeName ?? roomDetail.type ?? "",
      rmTypeNameEn: roomDetail.rmTypeNameEn ?? roomDetail.type ?? "",

    }
    : null;

  if (!roomDetail) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> 로딩 중...
      </div>
    );
  }

  return <>
    <Container className="my-4 accommodationAll">
      <Card className="mb-4">
        <div className="hero-wrap">
          <img
            src="https://picsum.photos/1200/500"
            alt="숙소 이미지"
            className="hero-img"
          />
        </div>
      </Card>


      <Row>
        <Col lg={8}>
          <h4 className="fw-bold">{roomDetail.name}</h4>
          <section className="md-4">
            <div className="room-rule-box">
              <h5>객실 규정</h5>
              <ul className="room-rules">
                <li>체크인 {roomDetail.checkInTime} / 체크아웃 {roomDetail.checkOutTime}</li>
                <li>기준 {roomDetail.maxAdult} 명 (최대 {roomDetail.maxAdult + roomDetail.maxChildren + roomDetail.maxInfant} 명)</li>
              </ul>
            </div>

            <div className="room-price">
              ₩{roomDetail.price}
            </div>

            <section className="mt-4">
              <h3 className="h5 mb-3">공간정보</h3>
              <ul className="room-rules d-flex flex-wrap gap-5">
                <li>객실 면적 {roomDetail.area}㎡</li>
                {roomDetail.singleBed > 0 && <li>싱글베드 {roomDetail.singleBed} 개</li>}
                {roomDetail.doubleBed > 0 && <li>더블베드 {roomDetail.doubleBed} 개</li>}
                {roomDetail.queenBed > 0 && <li>퀸베드 {roomDetail.queenBed} 개</li>}
                {roomDetail.kingBed > 0 && <li>킹베드 {roomDetail.kingBed} 개</li>}
              </ul>
            </section>

            <section className="mt-4">
              <h3 className="h5 mb-3">편의시설</h3>
              <div className="d-flex flex-wrap gap-4 fs-6">
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-wifi fs-4"></i>
                  <span>와이파이</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-cup-hot fs-4"></i>
                  <span>커피머신</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-webcam fs-4"></i>
                  <span>CCTV</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-p-square fs-4"></i>
                  <span>주차가능</span>
                </div>
                <div className="d-flex align-items-center gap-1">
                  <i className="bi bi-water fs-4"></i>
                  <span>수영장</span>
                </div>
              </div>
            </section>
            <hr />
            <div className="room-description my-4" dangerouslySetInnerHTML={{ __html: roomDetail.description }} />
            <hr />

          </section>

          <AccommodationInfo />
        </Col>

        {/* 데스크탑(>=lg)에서는 오른쪽 고정, 모바일(<lg)에서는 숨김 */}
        <Col lg={4} className="d-none d-lg-block">
          <div style={{ position: "sticky", top: 16 }}>
            <BookingPanel
              name={roomDetail.name}
              rooms={roomForBooking ? [roomForBooking] : []} // 변환 객체 배열 전달
              showRoomSelect={false}
              disabledDates={blockedDates}
              onReserve={handleReserve}
              imageUrl={roomImageUrl}
            />
          </div>
        </Col>
      </Row>
    </Container>

    {/* 모바일: 말풍선 버튼 */}
    {isMobile && !openReserve && (
      <FloatingReserveBubble onClick={() => setOpenReserve(true)} />
    )}

    {/* 모바일: 바텀시트 Offcanvas */}
    <Offcanvas
      show={openReserve}
      onHide={() => setOpenReserve(false)}
      placement="bottom"
      className="d-lg-none"
      style={{ maxHeight: "70vh", minHeight: "fit-container" }}
      aria-labelledby="reserve-panel-title"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="reserve-panel-title">예약</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BookingPanel
          name={roomDetail.name}
          rooms={roomForBooking ? [roomForBooking] : []} // 모바일도 동일 처리
          onReserve={() => {
            setOpenReserve(false);
            handleReserve();
          }}
          disabledDates={blockedDates}
          imageUrl={roomImageUrl}
        />
      </Offcanvas.Body>
    </Offcanvas>
    <Container></Container>
  </>
}

export default RoomDetail;
