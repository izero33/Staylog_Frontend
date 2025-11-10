import { Card, Col, Image, Row } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import { useNavigate } from "react-router-dom";

const ReviewCard = ({ review }: { review: AccommodationReviewListType }) => {
    const navigate = useNavigate();

    // 게시글 상세보기로 이동
    const handleClick = () => {
        // boardType: review, boardId: review.boardId
        navigate(`/board/${review.boardId}`);
    };

    return <>
        <Card className="mb-4" 
            style={{ border : "none", 
            backgroundColor : "rgba(249, 249, 249, 1)",
            boxShadow : "0 2px 6px rgba(0, 0, 0, 0.1)",
            cursor: "pointer"}}
            onClick={handleClick}>
            <Row className="g-2">
                {/* 미리보기 이미지 영역 */}
                <Col xs={4} md={3} className="d-flex reviewCardImage"
                    style={{ height : "auto", borderRadius : "0.25rem", overflow : "hidden"}}>
                    <Image src={review.images?.[0] || "https://picsum.photos/300"}
                        style={{ width : "100%", height : "100%", objectFit : "cover", borderRadius : "0.5rem"}}/>
                </Col>

                {/* 게시글 미리보기 제목, 내용, 작성자, 등록일 표시*/}
                <Col xs={8} md={9} className="d-flex flex-column justify-content-between mt-3" style={{ borderRadius : "0.25rem"}}>
                    <div>
                        <strong className="reviewTitle" style={{ color : "#333333ff"}}>{review.title}</strong>
                        <p className="reviewCardContent mt-1">
                            {review.content}
                        </p>
                    </div>
                    
                    <div className="mb-2" style={{ color: "#6d6d6dff" }}>
                        <span className="me-2" style={{ fontSize : "0.8rem"}}>{review.nickname}</span>
                        <span style={{ fontSize : "0.8rem" }}>{new Date(review.createdAt).toLocaleDateString().replace(/\.$/, "")}</span>
                    </div>
                </Col>
            </Row>
        </Card>
    </>
};

export default ReviewCard;