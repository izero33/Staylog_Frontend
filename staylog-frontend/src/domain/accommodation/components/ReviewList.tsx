import { Card, Row, Col, Image, Button } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ReviewListProps {
  reviews: AccommodationReviewListType[]; 
}

const ReviewList = ({ reviews}: ReviewListProps) => {

    // 리뷰 글 펼침 상태
    const [openReviews, setOpenReviews] = useState<Record<number,boolean>>({});
    // 리뷰 글 펼침 토글
    const toggleContent = (boardId: number) => {
        setOpenReviews(prev => ({
            ...prev,
            [boardId]: !prev[boardId],
        }));
    };
    // 페이지 이동
    const navigate = useNavigate();

    return <>
         <div className="d-flex justify-content-end">
            <Button className="p-0" onClick={() => navigate("")}
                style={{
                    fontSize : "0.8rem",
                    color : "#5c6369ff",
                    textDecoration : "none",
                    backgroundColor : "transparent",
                    border : "none",
                    boxShadow : "none",
                }}>
                전체 리뷰 더보기
                <i className="bi bi-chevron-right" style={{ fontSize: "0.8rem", marginLeft: "0.2rem" }}></i>
            </Button>
        </div>
        {/* 리뷰 목록 */}
        {reviews.map((review) => {
            const isOpened = openReviews[review.boardId] || false;
            return (
                <Card key={review.boardId} className="border-0 border-bottom">
                    <Card.Body>
                        {/* 상단 프로필 + 이름 + 객실타입 */}
                        <div className="d-flex align-items-center">
                            {review.profileImage ? (
                                <Image src={review.profileImage} width={40} height={40} roundedCircle />
                            ) : (
                                <i className="bi bi-person-circle" style={{ fontSize:45, color:"#2e2e2e" }}></i>
                            )}
                            <strong style={{ fontSize:"1.0rem", marginLeft:"0.5rem" }}>
                                {review.nickname}
                            </strong>
                        </div>

                        {/* 별점 표시 */}
                        <div className="mb-2" style={{ color:"#ffbe26ff" }}>
                            {Array.from({ length:5 }).map((_, index) => (
                                <i key={index}
                                    className={`bi ${
                                        index < review.rating ? "bi-star-fill" : "bi-star"
                                    } me-1`}>    
                                </i>
                            ))}
                        </div>

                        {/* 리뷰 이미지 3개 */}
                        <Row className="g-2 mb-3">
                            {[0, 1, 2].map((i) => (
                                <Col key={i} xs={4}>
                                    <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: "0.25rem"}}>
                                        <Image
                                        src={`https://picsum.photos/300/300?random=${i + review.boardId}`} // 예시 이미지
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        alt={`review-img-${i}`}
                                        fluid/>
                                    </div>
                                </Col>
                            ))}
                        </Row>

                        {/* 리뷰 내용 */}
                        <div className="mb-2" 
                            style={{ 
                                whiteSpace : "pre-wrap",
                                display : "-webkit-box",
                                WebkitLineClamp : isOpened ? undefined : 5,
                                WebkitBoxOrient : "vertical",
                                overflow : "hidden",
                                fontSize : "0.85rem"
                            }}>
                            {review.content}
                        </div>

                        {/* 🔹 리뷰 내용 더보기, 닫기 버튼 오른쪽 위치, 화살표 아이콘*/}
                        {review.content.split("\n").length > 5 || review.content.length > 200 ? (
                            <div className="d-flex justify-content-end">
                                <Button className="p-0 d-flex align-items-center"
                                    onClick={() => toggleContent(review.boardId)}
                                    onFocus={(e) => e.currentTarget.blur()} // 포커스 제거
                                    style={{
                                        fontSize : "0.9rem",
                                        color : "#000",
                                        fontWeight : 600,
                                        textDecoration : "none",
                                        backgroundColor : "transparent", // 기본 배경 색상 없애기
                                        border : "none", // 테두리 없애기
                                        boxShadow : "none" // 클릭시 생기는 그림자 제거
                                    }}>
                                    {isOpened ? "닫기 " : "더보기 "}
                                    <i className={`bi ${isOpened ? "bi-chevron-up" : "bi-chevron-down"}`} style={{ color: "#000" }}></i>
                                </Button>
                            </div>
                        ) : null}

                        {/* 작성일 */}
                        <div className="text-muted mb-2" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                            작성일 : {new Date(review.createdAt).toLocaleDateString().replace(/\.$/, "")}
                        </div>
                    </Card.Body>
                </Card>
            )
        })}
    </>
};

export default ReviewList;