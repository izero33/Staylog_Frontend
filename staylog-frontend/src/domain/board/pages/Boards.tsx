// src/domain/board/Review.tsx

import { useEffect, useState } from "react";
import { Button, Card, Col, Container, ListGroup, Pagination, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import type { BoardDto } from "../types/boardtypes";
import api from "../../../global/api";

import "./Board.css";
import "../components/RegionSidebar.css";

import RegionsSideBar from "../components/RegionSideBar";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import PaginationBar from "../../../global/components/PaginationBar";




function Boards() {

    // 게시판 카테고리 boardType
    const { boardType } = useParams<{ boardType: string }>();



    // 게시글 목록 상태값 관리
    const [boards, setBoards] = useState<BoardDto[]>([]);

    const [selectedRegions, setSelectedRegions] = useState<string[]>(["전체"]);

    const [pageInfo, setPageInfo] = useState({
      pageNum: 1,
      startPage: 1,
      endPage: 1,
      totalPage: 1,
      pageSize: boardType === "journal" ? 9 : 10
    });


    // USER 상태값 관리
    const UserId = useGetUserIdFromToken();

    const navigate = useNavigate();

    
    
    const fetchBoards = async (pageNum: number = 1) =>{
      try {
        // 전체 선택이면 필터 제거
        const validRegions = selectedRegions.includes("전체") 
          ? [] 
          : selectedRegions;
        
          const apiBoardType =
            boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";

          const res = await api.get("/v1/boards", {
              params: {
                  boardType: apiBoardType,                         
                  pageNum,
                  pageSize: 10,
                  regionCodes: validRegions,
              }
          });
          console.log("➡️ 요청 파라미터:", { pageNum, validRegions });
          
          // SucessResponse.of(code, message, data) 형태로 -> res
          // 실제 데이터 경로
          const list = res?.data?.boardList || res?.boardList ||[];
              console.log("📦 불러온 게시글 목록:", list);
          setBoards(list);
          setPageInfo({
            pageNum: res?.pageNum || 1,
            startPage: res?.startPage || 1,
            endPage: res?.endPage || 1,
            totalPage: res?.totalPage || 1,
            pageSize: res?.pageSize || 10
          })

      }catch(err) {
          console.error("게시글 목록 조회 불가:", err);
      }   
    }

    useEffect(()=>{
          
        fetchBoards();
    },[selectedRegions, boardType]);

    
    return <>
    {/* 상단 제목 영역 */}
    {boardType === "journal" &&(
      
      <h2 className="text-center fw-bold p-4">저널 게시판</h2>

    )}

    {boardType === "review" &&(
    
      <h2 className="text-center fw-bold p-4">리뷰 게시판</h2>

    )}
      <Container className="mt-4">
        <Row>
          {/* 좌측 지역 코드 */}
          <Col md={2}>
            <div className="m-4">
              <RegionsSideBar 
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions} />
            </div>
          </Col>

          {/* 메인 게시글 목록 영역 */}
          
          <Col md={10}>
            {/* 게시글 등록 버튼 */}
            {UserId &&              
              <div className="d-flex justify-content-end mb-3">
                <Button as={NavLink as any} to={`/boardForm/${boardType}`} 
                  variant="secondary" 
                  className="review-register-button">
                  {boardType === "journal" ? "저널 등록" : "리뷰 등록"}
                </Button>
              </div>
            }
            
            
            {/* 리뷰 게시글 목록 테이블 */}
            {boardType === "review" &&(
            <Table className="review-table align-middle text-center m-4">
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
                      <td>
                        <NavLink to={`/review/${board.boardId}`} className="fw-bold text-dark text-decoration-none">{board.title}</NavLink>
                      </td>
                      <td>{board.userNickName || board.userName || board.userId}</td>
                      <td>{board.viewsCount || 0}</td>
                      <td>{board.likes || 0}</td>
                      <td>{board.createdAt?.split("T")[0]}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>게시글이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </Table>
            )}

            {/* 저널 게시글 목록 테이블 */}
            {boardType === "journal" &&(

              <Row className="g-4 px-4">
                {boards.length > 0 ? (
                  boards.map((board) => (
                    <Col key={board.boardId} md={4}>
                      <Card
                        className="shadow-sm h-100 hover-card"
                        onClick={() => navigate(`/${boardType}/${board.boardId}`)}
                      >
                        <Card.Img
                          variant="top"
                          src={board.thumbnailUrl || "/default-thumbnail.jpg"}
                          alt="thumbnail"
                          style={{ height: "180px", objectFit: "cover" }}
                        />
                          <Card.Body>
                            <Card.Title className="fw-bold text-truncate">
                              {board.title}
                            </Card.Title>
                            <Card.Text className="text-muted small mb-2">
                              {board.regionName} | {board.userNickName}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </Col>
                  ))
                  ) : (
                    <p className="text-center text-muted mt-4">게시글이 없습니다.</p>
                  )
                }
                 
              </Row>

            )}
            

            {/* 페이지네이션 */}
            <div className="d-flex justify-content-center mt-3">
              <PaginationBar
                pageState={pageInfo}
                onMove={fetchBoards} />
              
            </div>


        </Col>
        </Row>
      </Container>
    

    


    </>
}

export default Boards;