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

    // HTML 파싱
    const parser = new DOMParser();
    const doc = parser.parseFromString(review.content, "text/html");

    // 첫 번째 이미지 추출
    const imageTags = Array.from(doc.querySelectorAll("img"));
    const firstImg = imageTags[0]?.src || null;

    // 이미지 제거 후 텍스트만 추출
    imageTags.forEach(img => img.remove());
    const textContent = doc.body.innerText.trim();

    return (
        <Card className="mb-4" 
            style={{ 
                border: "none", 
                backgroundColor: "rgba(249, 249, 249, 1)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                cursor: "pointer"
            }}
            onClick={handleClick}
        >
            <Row className="g-2">
                {/* 미리보기 이미지 영역 */}
                <Col xs={4} md={3} className="d-flex reviewCardImage"
                    style={{ 
                        height: "auto", 
                        borderRadius: "0.25rem", 
                        overflow: "hidden", 
                        aspectRatio: "1 / 1" 
                    }}
                >
                    {firstImg ? (
                        <Image
                            src={firstImg}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div className="rounded d-flex justify-content-center align-items-center"
                            style={{ width: "100%", aspectRatio: "1 / 1", backgroundColor: "#f1f1f1ff" }}
                        >
                            <i className="bi bi-house-door text-muted" style={{ fontSize: "3rem" }}></i>
                        </div>
                    )}
                </Col>

                {/* 게시글 미리보기 제목, 내용, 작성자, 등록일 표시 */}
                <Col xs={8} md={9} className="d-flex flex-column justify-content-between mt-3" style={{ borderRadius: "0.25rem" }}>
                    <div>
                        <strong className="reviewTitle" style={{ color: "#333333ff" }}>{review.title}</strong>
                        <p className="reviewCardContent mt-1">{textContent}</p>
                    </div>
                    
                    <div className="mb-2" style={{ color: "#6d6d6dff" }}>
                        <span className="me-2" style={{ fontSize: "0.8rem" }}>{review.nickname}</span>
                        <span style={{ fontSize: "0.8rem" }}>
                            {new Date(review.createdAt).toLocaleDateString().replace(/\.$/, "")}
                        </span>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default ReviewCard;