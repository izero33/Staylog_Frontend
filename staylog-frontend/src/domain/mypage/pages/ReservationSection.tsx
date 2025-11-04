// src/domain/mypage/pages/ReservationSection.tsx
import { useEffect, useState } from "react";
import { getReservationList } from "../api/mypageApi";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { Table } from "react-bootstrap";

function ReservationSection() {
    const userId = useGetUserIdFromToken();
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        if (userId) getReservationList(userId, "upcoming").then(setReservations);
    }, [userId]);
    
    return (
        <div>
            <h4 className="mb-3">예약 내역</h4>
            <Table bordered hover>
                <thead>
                <tr>
                    <th>예약 번호</th>
                    <th>숙소명</th>
                    <th>체크인</th>
                    <th>체크아웃</th>
                    <th>상태</th>
                </tr>
                </thead>
                <tbody>
                {reservations.map((r) => (
                    <tr key={r.reservationId}>
                    <td>{r.reservationId}</td>
                    <td>{r.stayName}</td>
                    <td>{r.checkInDate}</td>
                    <td>{r.checkOutDate}</td>
                    <td>{r.status}</td>
                    </tr>
                ))}
                </tbody>
            </Table>            
        </div>
    );
}

export default ReservationSection;