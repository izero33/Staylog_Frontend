// src/omain/board/Review.tsx

import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import { type BoardDto, type PageInfo } from "../types/boardtypes";

import "../components/RegionSidebar.css";
import "./Board.css";

import PaginationBar from "../../../global/components/PaginationBar";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import RegionsSideBar from "../components/RegionSideBar";
import SortModal, { type SortOption } from "../../../global/components/SortModal";




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
  
    
    // 정렬 옵션 배열
    const sortOption: SortOption<string>[] = [
      { value: "latest", label: "최신순" },
      { value: "views", label: "조회순" },
      { value: "likes", label: "추천순" },
    ];
    
    // 정렬 모달 열림
    const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

    // 페이징 + 정렬 => pageInfo 로 상태값 관리
    const [pageInfo, setPageInfo] = useState<PageInfo>({
      boardType: apiBoardType,  // BOARD_JOURNAL or BOARD_REVIEW
      pageNum: 1,               // 현재 페이지
      startPage: 1,
      endPage: 5,
      totalPage: 0,
      totalCount: 0,
      pageSize: boardType === "journal" ? 9 : 10, // 페이지 크기
      regionCodes: [],  // 지역 필터 (배열),
      sort: "latest"    // 정렬
    });


    // 게시글 목록 가져오기      
    const fetchBoards = async (
      pageNum: number = 1, 
      sortOption?: "latest" | "likes" | "views"
    ) =>{

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
            pageSize: pageInfo.pageSize,
            regionCodes: validRegions,
            sort: sortOption || pageInfo.sort 
          }
        });

        // SucessResponse.of(code, message, data) 형태로 -> res
        const list = res.boardList || res?.data?.data?.boardList || [];
        const page = res.pageResponse || res?.data?.data?.pageResponse || {};

        // 게시글 목록에 넣기
        setBoards(list);
        setPageInfo((prev) =>({
          ...prev,
          pageNum: page.pageNum || 1,
          startPage: page.startPage || 1,
          endPage: page.endPage || 1,
          totalPage: page.totalPage || 1,
          totalCount: page.totalCount || 0,
          pageSize: page.pageSize || prev.pageSize,
          regionCodes: page.regionCodes || prev.regionCodes
        }))
          
          console.log("📦 불러온 게시글 목록:", list);
          
      }catch(err) {
          console.error("게시글 목록 조회 불가:", err);
      }   
    }

    
    // 정렬 선택 핸들러
    const handleSelectSort = (newValue: string) => {
      const sortValue = newValue as "latest" | "likes" | "views";
      setPageInfo((prev) => ({ 
        ...prev, 
        sort: sortValue, 
        pageNum: 1
      }));
      
      setIsSortOpen(false); // 선택 후 닫기
       
    };
    
    // 지역 / 게시판 / 정렬 -- 변경 시 목록 불러오기
    useEffect(()=>{
      setPageInfo((prev)=>({
        ...prev,
        pageSize: boardType === "journal" ? 9 : 10,
        
      }));
    },[boardType]);

    
    useEffect(()=>{  
        fetchBoards(1, pageInfo.sort);
    },[selectedRegions, boardType, pageInfo.sort]);
    

    
    return <>

    {/* 상단 제목 영역 */}
    <div className="mt-4 text-center">
      <h2 className="fw-bold p-4">
        {boardType === "journal" ? "저널 게시판" : "리뷰 게시판"}
      </h2>

    </div>

      <Container fluid="lg" className="mt-4">
        <Row className="gy-4">
          {/* 좌측 지역 코드 */}
          <Col xs={12} md={3} lg={2}>
            <div className="px-3">
              
                <RegionsSideBar 
                  selectedRegions={selectedRegions}
                  setSelectedRegions={setSelectedRegions} />
                           
            </div>
          </Col>

          {/* 메인 게시글 목록 영역 */}
          <Col xs={12} md={9} lg={10}>          
            {/* 게시글 등록 버튼 */}
            <div className="d-flex justify-content-end gap-3 mb-3">       
              {userId && (
                <button
                  className={`btn ${
                    boardType === "journal" ? "btn-success" : "btn-primary"
                  }`}
                  onClick={() => navigate(`/form/${boardType}`)}
                >
                  {boardType === "journal" ? "저널 등록" : "리뷰 등록"}
                </button>
              )}
          
          {/* 정렬 */}
          <Button
              variant="outline-secondary"
              onClick={() => setIsSortOpen((prev) => !prev)}
              className="fw-semibold"
            >
              {sortOption.find((opt) => opt.value === pageInfo.sort)?.label || "정렬"} ▾
            </Button>
          </div>
          {isSortOpen && (
          <div className="position-absolute mt-2" style={{ right: "2rem", zIndex: 1050 }}>
            <SortModal
              isOpen={isSortOpen}
              onClose={() => setIsSortOpen(false)}
              options={sortOption}
              selectedValue={pageInfo.sort}
              onSelectSort={handleSelectSort}
              title="정렬"
            />
          </div>
          )}

            
            {/* 리뷰 게시글 목록 테이블 */}
            {boardType === "review" &&(
            <div className="table-responsive-wrapper">
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
                      <td>
                        <NavLink to={`/accommodations/${board.accommodationId}`} className="text-dark text-decoration-none">{board.accommodationName}</NavLink>
                      </td>
                      <td>
                        <NavLink to={`/review/${board.boardId}`} className="fw-bold text-dark text-decoration-none">{board.title}</NavLink>
                      </td>
                      <td>{board.userNickName || board.userName || board.userId}</td>
                      <td>{board.viewsCount || 0}</td>
                      <td>{board.likesCount || 0}</td>
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
            </div>
            )}

            {/* 저널 게시글 목록 테이블 */}
            {boardType === "journal" &&(

              <Row className="g-4 px-4">
                {boards.length > 0 ? (
                
                  boards.map((board) => (
                    <Col key={board.boardId} xs={12} sm={6} md={4}>
                      <Card
                        className="shadow-sm h-100 hover-card border-0"
                        style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
                        onClick={() => navigate(`/${boardType}/${board.boardId}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                      >
                        {/* 썸네일 */}
                        <Card.Img
                          variant="top"
                          src={board.thumbnailUrl || "/default-thumbnail.jpg"}
                          alt="thumbnail"
                          style={{ 
                            height: "180px", 
                            objectFit: "cover",
                            borderTopLeftRadius: "0.5rem",
                            borderTopRightRadius: "0.5rem"
                          }}
                        />
                        {/* 👁 조회수 + ❤️ 좋아요 (오버레이 영역) */}
                        <div
                          className="position-absolute top-0 end-0 d-flex gap-2 p-2 text-white fw-semibold"
                          style={{
                            background: "rgba(0, 0, 0, 0.4)",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <i className="bi bi-eye me-1"></i>
                            {board.viewsCount ?? 0}
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-heart-fill text-danger me-1"></i>
                            {board.likesCount ?? 0}
                          </div>
                          
                        </div>
                          {/* 본문 */}
                          <Card.Body className="d-flex flex-column justify-content-between">
                            <Card.Title className="fw-bold text-truncate mb-2">
                              {board.title}
                            </Card.Title>
                            {/* 작성자, 지역 */}
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