// src/omain/board/Review.tsx

import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import type { BoardDto } from "../types/boardtypes";

import "../components/RegionSidebar.css";
import "./Board.css";

import PaginationBar from "../../../global/components/PaginationBar";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import RegionsSideBar from "../components/RegionSideBar";




function Boards() {

    // 게시판 카테고리 boardType
    const { boardType } = useParams<{ boardType: string }>();

    
    // boardType /journal => apiBoardType BOARD_JOURNAL (공통코드-백엔드)
    const apiBoardType =
      boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";


    // 게시글 목록 상태값 관리
    const [boards, setBoards] = useState<BoardDto[]>([]);
    
    // 지역 선택
    const [selectedRegions, setSelectedRegions] = useState<string[]>(["전체"]);


    // USER 상태값 관리
    const userId = useGetUserIdFromToken();

    const navigate = useNavigate();

    // 페이지네이션
        const [pageInfo, setPageInfo] = useState({
          boardType: apiBoardType,  // BOARD_JOURNAL or BOARD_REVIEW
          pageNum: 1,               // 현재 페이지
          startPage: 1,
          endPage: 5,
          totalPage: 10,
          totalCount: 0,
          pageSize: boardType === "journal" ? 9 : 10, // 페이지 크기
          regionCodes: [] as string[]  // 지역 필터 (배열)
        });

    // 게시글 목록 가져오기      
    const fetchBoards = async (pageNum: number = 1) =>{

      try {

        // 전체 선택이면 필터 제거
        const validRegions = selectedRegions.includes("전체") 
          ? [] 
          : selectedRegions;
               
        // 게시글 목록 조회 api
        const res = await api.get(`/v1/boards`, {
          params: {
            boardType: apiBoardType,
            pageNum,
            regionCodes: validRegions
          }
        });

        // SucessResponse.of(code, message, data) 형태로 -> res
        const list = res.boardList || res?.data?.data?.boardList || [];
        const page = res.pageResponse || res?.data?.data?.pageResponse || {};

        setBoards(list);
        setPageInfo({
          ...pageInfo,
          pageNum: page.pageNum || 1,
          startPage: page.startPage || 1,
          endPage: page.endPage || 1,
          totalPage: page.totalPage || 1,
          totalCount: page.totalCount || 0,
          pageSize: page.pageSize || 10
        })
          
          console.log("📦 불러온 게시글 목록:", res);
          


      }catch(err) {
          console.error("게시글 목록 조회 불가:", err);
      }   
    }

    
    useEffect(()=>{  
        fetchBoards(1);
    },[selectedRegions, boardType]);

    
    return <>

    {/* 상단 제목 영역 */}
    <div className="mt-4">
      {boardType === "journal" &&(
        
        <h2 className="text-center fw-bold p-4">저널 게시판</h2>

      )}

      {boardType === "review" &&(
      
        <h2 className="text-center fw-bold p-4">리뷰 게시판</h2>

      )}

    </div>

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
          <div className="d-flex justify-content-end mb-3">
            {/* 리뷰 게시판은 로그인한 누구나 등록 가능 */}
            {boardType === "review" && userId && (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/form/${boardType}`)}
              >
                리뷰 등록
              </button>
            )}

            {/* 저널 게시판은 VIP만 등록 가능 */}
            {boardType === "journal" && (
              <button
                className="btn btn-success"
                onClick={() => navigate(`/form/${boardType}`)}
              >
                저널 등록
              </button>
            )}
          </div>  
            
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