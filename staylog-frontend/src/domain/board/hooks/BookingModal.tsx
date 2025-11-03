// src/domain/board/hooks/BookingModal.tsx

import { Button, ListGroup, Modal } from "react-bootstrap";



// BookingModal Props
interface BookingModalProps {
  show: boolean;
  onHide: () => void;
  bookings: Booking[];
  onSelect: (booking: Booking) => void;
}

// Booking 예약내역 목록
interface Booking {
  bookingId: number;
  regionCode: string;
  accommodationId: number;
  accommodationName: string;
  checkIn: string;
  checkOut: string;
}

function BookingModal({ show, onHide, bookings, onSelect }: BookingModalProps) {
    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>예약 내역 선택</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {bookings.length > 0 ? (
                <ListGroup>
                    {bookings.map((booking) => (
                        <ListGroup.Item
                            key={booking.bookingId}
                            action
                            onClick={() => onSelect(booking)}
                            style={{ cursor: "pointer" }}
                        >
                            [{booking.accommodationName}] {booking.checkIn} ~ {booking.checkOut}
                        </ListGroup.Item>
                    ))}
                </ListGroup>
                ) : (
                <p>예약 내역이 없습니다.</p>
                )}  

            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
            닫기
            </Button>
        </Modal.Footer>
        </Modal>

    );
}


export default BookingModal;