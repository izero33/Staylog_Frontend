// src/domain/mypage/pages/ReviewSection.tsx
import { useEffect, useMemo, useState } from "react";
import { getReviewList } from "../api/mypageApi"; // API 함수 변경
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { Button, Card, Table } from "react-bootstrap";
import { formatKST } from "../../../global/utils/date";
import type { Reviews } from "../types/mypageTypes";
import useCommonCodeSelector from "../../common/hooks/useCommonCodeSelector";
import type { CommonCodeDto } from "../../common/types";
import { useNavigate } from "react-router-dom";



function ReviewSection() {
    const userId = useGetUserIdFromToken();
    const navigate = useNavigate();
    
    // DB 공통 코드 1. Redux의 공통 코드 스토어에서 특정 그룹 불러오기
    const reservationStatusList = useCommonCodeSelector("reservationStatus"); 

    // // 빠른 조회를 위한 codeId = CommonCodeDto Mapping 2. 그 리스트를 Map 형태로 변환 
    // const reservationStatusMap = useMemo<Map<string, CommonCodeDto>> (()=> {
    //     const m = new Map <string, CommonCodeDto>();
    //     for (const row of reservationStatusList ?? []) {
    //     m.set(row.codeId, row);
    //     }
    //     return m;
    // },[reservationStatusList]);

    //     // 3. 리뷰 목록 렌더링 시, 상태 코드에 해당하는 공통코드(label, color) 참조
    // const cc = reviewStatusMap.get( );
    //     return {
    //         // attr1을 색상 HEX로 사용한다는 전제
    // };


    // reviews 상태로 변경
    const [reviews, setReviews] = useState<Reviews[]>([]);
    // type 상태 추가 (작성 가능한 리뷰 / 내가 쓴 리뷰) availableToWrite / myWrittenReview
    const [type, setType] = useState("availableToWrite"); // 기본값: 작성 가능한 리뷰

    useEffect(() => {
        if (userId) {
            // getReviewList API 호출, type을 파라미터로 전달
            getReviewList(userId, type)
                .then((res) => {
                    setReviews(res || []);
                })
                .catch((err) => {
                    console.error("리뷰 내역 조회 실패:", err);
                    setReviews([]); // 에러 발생 시 빈 배열로 초기화
                });
        }
    }, [userId, type]);

    // 타입 변경 핸들러
    const handleTypeChange = (newType: string) => {
        if(type === newType) return; // 같은 탭을 클릭하면, 아무것도 안하고,
        setReviews([]); // 기존 데이터를 즉시 비우기.
        setType(newType); // 탭 변경.
    };


    // 필터 버튼 렌더링
    const renderFilterButtons = () => (
        <div className="d-flex justify-content-center gap-2 mb-4">
            <Button
                variant={type === "availableToWrite" ? "dark" : "outline-secondary"}
                onClick={() => handleTypeChange("availableToWrite")}
                style={{
                    whiteSpace: "nowrap", // 글자 줄바꿈 방지
                    height: "38px", // Form.Control 기본 높이와 동일
                    lineHeight: "1", // 글자가 세로 중앙에 맞게
                    // padding: "0 12px" // 좌우 패딩만 유지
                }}
            >
                작성 가능한 리뷰
            </Button>
            <Button
                variant={type === "myWrittenReview" ? "dark" : "outline-secondary"}
                onClick={() => handleTypeChange("myWrittenReview")}
            >
                내가 쓴 리뷰
            </Button>
        </div>
    );

    // 작성 가능한 리뷰 테이블 렌더링
    const renderAvailableReviews = () => (
        <Table bordered hover responsive className="align-middle text-center">
            <thead className="table-light">
                <tr>
                    <th>예약 번호</th>
                    <th>숙소명</th>
                    <th>체크인</th>
                    <th>체크아웃</th>
                    <th>리뷰 작성</th>
                </tr>
            </thead>
            <tbody>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <tr key={review.bookingId}>
                            <td>{review.bookingNum}</td>
                            <td>{review.accommodationName}</td>
                            <td>{review.checkIn ? (formatKST ? formatKST(review.checkIn).split(" ")[0] : review.checkIn.substring(0, 10)) : 'N/A'}</td>
                            <td>{review.checkOut ? (formatKST ? formatKST(review.checkOut).split(" ")[0] : review.checkOut.substring(0, 10)) : 'N/A'}</td>
                            <td>
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => navigate('/form/review', { state: { booking: review } })}
                                >
                                    작성하기
                                </Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-muted py-4">
                            작성 가능한 리뷰가 없습니다.
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );

    // 내가 쓴 리뷰 테이블 렌더링
    const renderMyReviews = () => (
        <Table bordered hover responsive className="align-middle text-center">
            <thead className="table-light">
                <tr>
                    <th>예약 번호</th>
                    <th>숙소명</th>
                    <th>제목</th>
                    <th>별점</th>
                    <th>작성일</th>
                </tr>
            </thead>
            <tbody>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <tr key={review.reviewId}>
                            <td>{review.bookingNum}</td>
                            <td>{review.accommodationName}</td>
                            <td style={{ textAlign: 'left' }}>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => navigate(`/review/${review.reviewId}`)}
                                >
                                    {review.title}
                                </Button>
                                
                            </td>
                            <td>{review.rating}</td>
                            <td>{review.createdAt ? (formatKST ? formatKST(review.createdAt).split(" ")[0] : review.createdAt.substring(0, 10)) : 'N/A'}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="text-muted py-4">
                            작성한 리뷰가 없습니다.
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    );

    return (
        <Card className="shadow-sm border-0 w-100">
            <Card.Body className="p-4">
                <div className="mb-3 text-center text-md-center">
                    <h4 className="fw-bold">리뷰 내역</h4>
                    <hr className="mb-4" />
                </div>
                {/* 상태 필터 버튼  */}
                {renderFilterButtons()}
                {type === "availableToWrite" ? renderAvailableReviews() : renderMyReviews()}
            </Card.Body>
        </Card>
    );
}

export default ReviewSection;