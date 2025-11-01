// src/domain/board/Review.tsx

import { useEffect, useState } from "react";
import { Button, Col, Container, ListGroup, Pagination, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import type { BoardDto } from "../types/boardtypes";
import api from "../../../global/api";




function Review() {

    

    // 게시글 목록 상태값 관리
    const [boards, setBoards] = useState<BoardDto[]>([]);
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchBoards = async () =>{
            try {
                const res = await api.get("/v1/boards", {
                    params: {
                        boardType: "REVIEW",  
                        
                        pageNum: 1,
                        pageSize: 10
                    }
                });
                
                // SucessResponse.of(code, message, data) 형태로 -> res
                // 실제 데이터 경로
                const list = res?.data?.boardList || res?.boardList || res?.data?.data || [];
                    console.log("📦 불러온 게시글 목록:", list);
                setBoards(list);

            }catch(err) {
                console.error("게시글 목록 조회 불가:", err);

            } 
        
        };
        fetchBoards();
    },[]);

    
    return <>
    {/* 상단 제목 영역 */}
      <Container className="mt-4">
        <h2 className="text-center fw-bold mb-4">리뷰 게시판</h2>

        <Row>
          {/* 좌측 지역 코드 */}
          <Col md={2}>
          <ListGroup className="region-sidebar"> 
            {["전체", "서울", "제주", "강원", "경기", "양평", "충청도", "전라도", "경상도", "부산"].map((region) => (
              <ListGroup.Item key={region} action className="region-item">
                {region}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>

          {/* 메인 게시글 목록 영역 */}
          <Col md={10}>
            <div className="d-flex justify-content-end mb-3">
                <Button as={NavLink} to="/boardForm" 
                  variant="secondary" 
                  className="review-register-button">
                리뷰 등록
                </Button>
            </div>

            {/* 게시글 목록 테이블 */}
            <Table className="review-table align-middle text-center">
              <thead>
                <tr>
                  <th>번호</th>
                  <th>지역</th>
                  <th>숙소명</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>조회수</th>
                  <th>추천수</th>
                  <th>작성일</th>
                </tr>
              </thead>
              <tbody>
                {boards.length > 0 ? (
                  boards.map((board) => (
                    <tr key={board.boardId}>
                      <td>{board.boardId}</td>
                      <td>{board.regionName}</td>
                      <td>{board.accommodationName}</td>
                      <td className="text-start">{board.title}</td>
                      <td>{board.userId}</td>
                      <td>{board.viewCount || 0}</td>
                      <td>{board.likes || 0}</td>
                      <td>{board.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>게시글이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* 페이지네이션 */}
            <div className="d-flex justify-content-center mt-3">
              <Pagination className="pagination-custom">
                <Pagination.Prev />
                <Pagination.Item active>{1}</Pagination.Item>
                <Pagination.Item>{2}</Pagination.Item>
                <Pagination.Item>{3}</Pagination.Item>
                <Pagination.Next />
              </Pagination>
            </div>


        </Col>
        </Row>
      </Container>
    

    


    </>
}

export default Review;