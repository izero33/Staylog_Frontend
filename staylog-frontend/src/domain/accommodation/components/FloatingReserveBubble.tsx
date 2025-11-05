import "../css/reserve.css"

type FloatingReserveBubbleProps = {
  onClick: () => void;
  label?: string;
};

export default function FloatingReserveBubble({ onClick, label = "예약" }: FloatingReserveBubbleProps) {
  return (
    <div
      onClick={onClick}
      className="reserve-bubble d-lg-none" // lg 이상에선 숨김
      aria-label="예약 패널 열기">
      <i className="bi bi-calendar-check me-2" />
      {label}
    </div>
  );
}