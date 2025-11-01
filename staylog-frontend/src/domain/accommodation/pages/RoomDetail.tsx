import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Spinner, Offcanvas, Carousel, Image, Accordion } from "react-bootstrap";
import type { RoomDetailDto } from "../types/RoomDetailDto";
import api from "../../../global/api";

import BookingPanel from "../components/BookingPanel";
import useIsMobile from "../hooks/useIsMobile";
import FloatingReserveBubble from "../components/FloatingReserveBubble";


function RoomDetail() {

  const { roomId } = useParams(); // ← URL에서 roomId 추출
  const [roomDetail, setRoomDetail] = useState<RoomDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [openReserve, setOpenReserve] = useState(false);
  const isMobile = useIsMobile(); //모바일 크기일 때 true

  //숙소정보
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

  //블락할 날짜 가져오기
  useEffect(() => {
    if (!roomId) return;

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 2); // 예: 2개월치만 조회

    const from = today.toISOString().split("T")[0];
    const to = nextMonth.toISOString().split("T")[0];


    api.get<string[]>(`/v1/${roomId}/blocked`, {
      params: { from, to },
    })
      .then(res => {
        setBlockedDates(res)
        setError(null)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [roomId])


  const handleReserve = () => {
    alert("예약하기");
  };

  useEffect(() => {
    featchRoom();
  }, [roomId])

  //지도 가져가기 => 채린이 숙소 상세에 넣을거



  if (!roomDetail) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> 로딩 중...
      </div>
    );
  }

  //"https://picsum.photos/1116/580"

  return <>

    <Container fluid className="p-0">
      <div className="accommodationImages images-slider mb-3">
        <Carousel className="w-100">
          <Carousel.Item>
            {/* 이미지 비율에 맞게 나오게 함*/}
            <Image src={"https://picsum.photos/1116/580"} alt="숙소 이미지 1" className="d-block w-100" style={{ height: "580px", objectFit: "cover" }} />
          </Carousel.Item>
          <Carousel.Item>
            <Image src={"https://picsum.photos/1116/580"} alt="숙소 이미지 2" className="d-block w-100" style={{ height: "580px", objectFit: "cover" }} />
          </Carousel.Item>
        </Carousel>
      </div>

      <Row>
        <Col lg={8}>
          <h2>객실명 : {roomDetail.name}</h2>
          <section className="md-4">
            <h3>객실 규정</h3>
            <ul>
              <li>체크인 시간 : {roomDetail.checkInTime}</li>
              <li>체크아웃 시간 : {roomDetail.checkOutTime}</li>
              <li>기준 인원 : 성인 {roomDetail.maxAdult}, 어린이 {roomDetail.maxChildren}, 영유아 {roomDetail.maxInfant}</li>
            </ul>
            <h3>편의시설</h3>
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

            <div className="roomDetail mb-5">
              <h3>객실 소개</h3>
              <div className="detailImages">
                <Image
                  src="https://placehold.co/100x500/F0F3F7/99AAB5"
                  className="mb-3"
                  fluid
                  style={{ objectFit: "cover", width: "100%", height: "500px" }}
                />
                <Image
                  src="https://placehold.co/100x500/F0F3F7/99AAB5"
                  className="mb-3"
                  fluid
                  style={{ objectFit: "cover", width: "100%", height: "500px" }}
                />
                <p>{roomDetail.description}</p>
              </div>
            </div>

            {/* 안내 사항 */}
            <div className="info mb-5" id="infoAccordion">
              <h4 className="mb-3">안내 사항</h4>
              <Accordion alwaysOpen className="customAccordion">
                {/* 예약 안내 */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>예약 안내</Accordion.Header>
                  <Accordion.Body>
                    <ul>
                      <li>예약 가능 시간: 오전 9시 ~ 오후 6시</li>
                      <li>객실별 최대 인원을 초과할 수 없습니다. (유아 포함)</li>
                      <li>예약 확정 후 발송되는 알림을 확인해 주시면 최종 입실 정보를 확인할 수 있습니다.</li>
                      <li>반려 동물 동반이 불가한 숙소입니다.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 이용 안내 */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>이용 안내</Accordion.Header>
                  <Accordion.Body>
                    <strong>이용 규칙</strong>
                    <p>입퇴실 시간 <span>체크인 : </span><span>체크아웃 : </span></p>
                    <ul>
                      <li>최대 인원을 초과하는 인원은 입실이 불가합니다.</li>
                      <li>예약인원 외 방문객의 출입을 엄격히 제한합니다.</li>
                      <li>미성년자의 경우 보호자(법정대리인)의 동행 없이 투숙이 불가합니다.</li>
                      <li>모든 공간에서 절대 금연입니다. 위반 시 특수청소비가 청구됩니다.</li>
                      <li>다른 객실에 피해가 되지 않도록 늦은 시간에는 소음에 유의해주세요.</li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>

                {/* 환불 규정 */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header>환불 규정</Accordion.Header>
                  <Accordion.Body>
                    <strong>환불 금액</strong>

                    <ol>
                      <li>체크인 15일 전 : 총 결제금액의 100% 환불</li>
                      <li>체크인 9일 전 : 총 결제금액의 90% 환불</li>
                      <li>체크인 8일 전: 총 결제금액의 80% 환불</li>
                      <li>체크인 7일 전 : 총 결제금액의 70% 환불</li>
                      <li>체크인 6일 전 : 총 결제금액의 60% 환불</li>
                      <li>체크인 5일 전 : 총 결제금액의 50% 환불</li>
                      <li>체크인 4일 전 : 총 결제금액의 40% 환불</li>
                      <li>체크인 3일 전 : 변경 / 환불 불가</li>
                    </ol>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>






          </section>

        </Col>

        {/* 데스크탑(>=lg)에서는 오른쪽 고정, 모바일(<lg)에서는 숨김 */}
        <Col lg={4} className="d-none d-lg-block">
          <div style={{ position: "sticky", top: 16 }}>
            <BookingPanel
              name="INSIDE (2F)"
              pricePerNight={184000}
              nights={2}
              onReserve={() => alert("예약하기")}
            />
          </div>
        </Col>
      </Row>
    </Container>

    {/* 모바일: 말풍선 버튼 */}
    {isMobile && <FloatingReserveBubble onClick={() => setOpenReserve(true)} />}

    {/* 모바일: 바텀시트 Offcanvas */}
    <Offcanvas
      show={openReserve}
      onHide={() => setOpenReserve(false)}
      placement="bottom"
      className="d-lg-none"
      style={{ height: "75vh" }} // 바텀시트 높이
      aria-labelledby="reserve-panel-title"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="reserve-panel-title">예약</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <BookingPanel
          name={roomDetail.name}
          pricePerNight={184000}
          nights={2}
          onReserve={() => {
            setOpenReserve(false);
            handleReserve();
          }}
          disabledDates={blockedDates}
        />
      </Offcanvas.Body>
    </Offcanvas>
    <Container></Container>

  </>
}

export default RoomDetail;