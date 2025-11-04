import { Accordion } from "react-bootstrap";

function AccommodationInfo() {

  return <>
    <div className="info mb-5" id="infoAccordion">
      <h4 className="mt-5">안내 사항</h4>
      <Accordion alwaysOpen className="customAccordion">
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
  </>
}

export default AccommodationInfo;