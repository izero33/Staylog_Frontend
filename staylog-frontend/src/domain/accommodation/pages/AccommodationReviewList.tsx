import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import type { AccommodationReviewListType } from "../types/AccommodationType";
import api from "../../../global/api";
import ReviewCard from "../components/ReviewCard";
import '../css/Accommodation.css';

const AccommodationReviewList = () => {
    // 숙소 고유 번호
    const { id } = useParams<{ id: string }>();
    // 해당 숙소의 리뷰 목록
    const [reviews, setReviews] = useState<AccommodationReviewListType[]>([]);
    // 해당 숙소명
    const [name, setName] = useState("");
    // 해당 숙소가 위치한 지역명
    const [region, setRegion] = useState("");
    // 해당 숙소의 상세 주소
    const [address, setAddress] = useState("");
    // 페이지 맨 위로 가기
    const [goToUp, setGoToUp] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        const fetchList = async () => {
            try {
                // 숙소 정보 API
                const res1 = await api.get(`/v1/accommodations/${id}`);
                setName(res1.name);
                setRegion(res1.regionName);
                setAddress(res1.address);

                // 리뷰 리스트 API
                const res2 = await api.get(`/v1/accommodations/${id}/reviews`);
                setReviews(res2);
            } catch (err) {
                console.error(err);
            }
        };
            fetchList();
    }, [id]);

    // 목록 쪽 맨 위로 가게 하기
    useEffect(() => {
        const handleScroll = () => {
            setGoToUp(window.scrollY > 200); // 200px 이상 스크롤 시 표시
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


    return <>
        <Container className="mt-4">
            <Row>
                {/* 왼쪽 영역 : 이전 페이지로 이동 버튼, 간단한 숙소 지역과 주소 정보 */}
                <Col lg={4} className="fixLeft">
                    <div>
                        <Button className="mb-3" onClick={() => navigate(`/accommodations/${id}`)}
                            style={{ 
                                display : "inline-flex", alignItems : "center", padding : 0, margin: 0,
                                border : "none", backgroundColor : "transparent" }}>
                            <i className="bi bi-arrow-left-circle-fill" 
                                style={{ color: "#000", backgroundColor: "transparent", fontSize: "2.0rem" }}></i>
                        </Button>
                        <h5 className="mb-3" style={{fontWeight : "bold"}}>{name}</h5>
                        <p>{region}</p>
                    </div>
                </Col>

                {/* 오른쪽 영역 : 리뷰 미리보기 목록*/}
                <Col lg={8}>
                    {reviews.length > 0 ? (
                        reviews.map(review => (
                            <ReviewCard key={review.boardId} review={review} />
                        ))
                    ) : (
                        <>
                        <div className="text-center">
                            <i className="bi bi-chat-square-dots" style={{ fontSize : "1.5rem" , color: "#666e75ff" }}></i>
                            <p className="mt-2" style={{ color : "#666e75ff" }}>등록된 리뷰가 없습니다</p>
                        </div>
                        </>
                    )}
                </Col>
            </Row>

            {/* 맨 위로 가게 하는 버튼*/}
            {goToUp && (
                <Button size="sm" onClick={scrollToTop}
                    className="position-fixed me-2 mb-2 bottom-0 end-0 border-0 bg-transparent shadow-none">
                    <i className="bi bi-arrow-up-square-fill" style={{ fontSize : "2.5rem", color : "#252525ff"}}></i>
                </Button>
            )}
        </Container>
    </>
};

export default AccommodationReviewList;
