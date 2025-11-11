// src/domain/board/Review.tsx

import { useEffect, useState } from "react";
import { Button, Col, Container, Row, Table } from "react-bootstrap";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import { type BoardDto, type PageInfo } from "../types/boardtypes";

import "../components/RegionSidebar.css";
import "./Board.css";

import PaginationBar from "../../../global/components/PaginationBar";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import RegionsSideBar from "../components/RegionSideBar";
import SortModal, { type SortOption } from "../../../global/components/SortModal";
import useGetUserRoleFromToken from "../../auth/hooks/useGetUserRoleFromToken";

import JournalCard from "../components/JournalCard";
// import { getImageUrl } from "../../../global/hooks/getImageUrl"; // 목록 페이지에서는 불필요

interface ImageDataa {
  imageUrl: string
}

function Boards() {
  // 게시판 카테고리
  const { boardType } = useParams<{ boardType: string }>();

  // 백엔드 전달용 코드 변환
  const apiBoardType =
    boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";

  // 상태값 관리
  const [boards, setBoards] = useState<BoardDto[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["전체"]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // 새로 추가: 로딩 상태

  // 유저 정보
  const userId = useGetUserIdFromToken();
  const role = useGetUserRoleFromToken();

  const navigate = useNavigate();

  useEffect(() => {
    console.log("🧩 userId:", userId, "| role:", role);
  }, [userId, role]);

  // 정렬 옵션
  const sortOption: SortOption<string>[] = [
    { value: "latest", label: "최신순" },
    { value: "views", label: "조회순" },
    { value: "likes", label: "추천순" },
  ];

  // 정렬 상태
  const [isSortOpen, setIsSortOpen] = useState<boolean>(false);

  // 페이지 정보
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    boardType: apiBoardType,
    pageNum: 1,
    startPage: 1,
    endPage: 5,
    totalPage: 0,
    totalCount: 0,
    pageSize: boardType === "journal" ? 9 : 10,
    regionCodes: [],
    sort: "latest",
  });

  // 게시글 목록 조회
  const fetchBoards = async (
    pageNum: number = 1,
    sortOption?: "latest" | "likes" | "views"
  ) => {
    const apiBoardType =
      boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";
    if (!boardType) return;

    setIsLoading(true); // API 호출 시작 시 로딩 상태 true
    try {
      const validRegions = selectedRegions.includes("전체")
        ? []
        : selectedRegions;

      const res = await api.get(`/v1/boards`, {
        params: {
          boardType: apiBoardType,
          pageNum,
          pageSize: pageInfo.pageSize,
          regionCodes: validRegions,
          sort: sortOption || pageInfo.sort,
        },
      });

      const list = res.boardList || res?.boardList || [];
      const page = res.pageResponse || res?.pageResponse || {};

      setBoards(list);
      setPageInfo((prev) => ({
        ...prev,
        pageNum: page.pageNum || 1,
        startPage: page.startPage || 1,
        endPage: page.endPage || 1,
        totalPage: page.totalPage || 1,
        totalCount: page.totalCount || 0,
      }));

      console.log("📦 불러온 게시글 목록:", list);
    } catch (err) {
      console.error("게시글 목록 조회 실패:", err);
      setBoards([]); // 오류 발생 시에도 목록 초기화
    } finally {
      setIsLoading(false); // API 호출 완료 시 로딩 상태 false
    }
  };

  // 정렬 핸들러
  const handleSelectSort = (newValue: string) => {
    const sortValue = newValue as "latest" | "likes" | "views";
    setPageInfo((prev) => ({ ...prev, sort: sortValue, pageNum: 1 }));
    setIsSortOpen(false);
  };

  // boardType 변경 시 페이지 사이즈 업데이트
  useEffect(() => {
    setPageInfo((prev) => ({
      ...prev,
      boardType: apiBoardType,
      pageSize: boardType === "journal" ? 9 : 10,
    }));
  }, [boardType, apiBoardType]);

  // boardType이 변경될 때 기존 게시글 목록을 초기화하여 깜빡임 방지
  useEffect(() => {
    setBoards([]); // boards 상태를 빈 배열로 초기화
  }, [boardType]);

  // boardType 변경될 때 기존 게시글 목록을 초기화하여 깜빡임 방지
  useEffect(()=>{
    setBoards([]); // board 상태를 빈 배열로 초기화
  }, [boardType])

  // 목록 조회
  useEffect(() => {
    if (boardType) { // boardType이 유효할 때만 fetchBoards 호출
      fetchBoards(1, pageInfo.sort);
    }
  }, [selectedRegions, boardType, pageInfo.sort]);


  return (
    <>
      {/* 상단 제목 */}
      <div className="mt-4 text-center">
        <h2 className="fw-bold p-4">
          {boardType === "journal" ? "JOURNAL" : "REVIEW"}
        </h2>
      </div>

      <Container fluid="lg" className="mt-4">
        <Row className="gy-4">
          {/* 좌측 지역 */}
          <Col xs={12} md={3} lg={2}>
            <div className="px-3">
              <RegionsSideBar
                selectedRegions={selectedRegions}
                setSelectedRegions={setSelectedRegions}
              />
            </div>
          </Col>

          {/* 메인 목록 */}
          <Col xs={12} md={9} lg={10}>
            <div className="d-flex justify-content-end gap-3 mb-3">
              {/* 리뷰 등록 버튼 */}
              {boardType === "review" && userId && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/form/${boardType}`)}
                >
                  리뷰 등록
                </button>
              )}

              {/* 저널 등록 버튼 */}
              {boardType === "journal" && role?.toUpperCase().includes("VIP") && (
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/form/${boardType}`)}
                >
                  저널 등록
                </button>
              )}

              {/* 정렬 */}
              <Button
                variant="outline-secondary"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="fw-semibold"
              >
                {sortOption.find((opt) => opt.value === pageInfo.sort)?.label ||
                  "정렬"}{" "}
                ▾
              </Button>
            </div>

            {/* 정렬 모달 */}
            {isSortOpen && (
              <div
                className="position-absolute mt-2"
                style={{ right: "2rem", zIndex: 1050 }}
              >
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

            {/* 리뷰 게시글 목록 */}
            {boardType === "review" && (
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
                    {isLoading ? ( // 로딩 중일 때
                      <tr>
                        <td colSpan={8}>로딩 중...</td>
                      </tr>
                    ) : (
                      boards.length > 0 ? ( // 로딩 완료 후 게시글이 있을 때
                        boards.map((board) => (
                          <tr key={board.boardId}>
                            <td>{board.boardId}</td>
                            <td>{board.regionName}</td>
                            <td>
                              <NavLink
                                to={`/accommodations/${board.accommodationId}`}
                                className="text-dark text-decoration-none"
                              >
                                {board.accommodationName}
                              </NavLink>
                            </td>
                            <td>
                              <NavLink
                                to={`/review/${board.boardId}`}
                                className="fw-bold text-dark text-decoration-none"
                              >
                                {board.title}
                              </NavLink>
                            </td>
                            <td>
                              {board.userNickName ||
                                board.userName ||
                                board.userId}
                            </td>
                            <td>{board.viewsCount || 0}</td>
                            <td>{board.likesCount || 0}</td>
                            <td>{board.createdAt?.split("T")[0]}</td>
                          </tr>
                        ))
                      ) : ( // 로딩 완료 후 게시글이 없을 때
                        <tr>
                          <td colSpan={8}>게시글이 없습니다.</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </div>
            )}

            {/* 저널 게시글 목록 */}
            {boardType === "journal" && (
              <Row className="g-4 px-4">
                {isLoading ? ( // 로딩 중일 때
                  <p className="text-center text-muted mt-4">로딩 중...</p>
                ) : (
                  boards.length > 0 ? ( // 로딩 완료 후 게시글이 있을 때
                    boards.map((board) => (
                      <Col key={board.boardId} xs={12} sm={6} md={4}>
                      <JournalCard board={board} />
                    </Col>
                    ))
                  ) : ( // 로딩 완료 후 게시글이 없을 때
                    <p className="text-center text-muted mt-4">
                      게시글이 없습니다.
                    </p>
                  )
                )}
              </Row>
            )}

            {/* 페이지네이션 */}
            <div className="d-flex justify-content-center mt-3">
              <PaginationBar pageState={pageInfo} onMove={fetchBoards} />
            </div>
          </Col>
        </Row> 
      </Container>
    </>
  );
}

export default Boards;