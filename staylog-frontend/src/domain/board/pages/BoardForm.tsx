// src/domain/board/types/boardtypes.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import BookingModal from "../components/BookingModal";
import type { BoardDto } from "../types/boardtypes";

import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";

import QuillEditor from "../components/QuillEditor";

import { useSelector } from "react-redux";
import type { RootState } from "../../../global/store/types";
import RegionModal from "../components/RegionModal";




function BoardForm() {

    // 게시판 카테고리 boradType
    const { boardType, boardId } = useParams<{ boardType: string; boardId: number }>();
    
    // boardId 있으면 isEdit 수정모드
    const isEdit = !!boardId;
    console.log(boardType); // "review"
    console.log(boardId);   // "145"


    

    // 예약내역 상태값 관리
    const [bookings, setBookings] = useState<any[]>([]);

    // 예약내역 모달 상태값 관리
    const [showModal, setShowModal] = useState<boolean>(false);

    const apiBoardType =
        boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";

    // 지역 선택 모달 상태값 관리
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState<string>("전체");

    // DTO 상태값 관리
    const [dto, setDto] = useState<BoardDto>({
      boardId: 0,             // 기본값 (신규 작성 시 0 또는 undefined)
      userId: 0,              // 로그인 사용자 ID
      userNickName: "",       // 작성자 닉네임
      userName: "",           // 작성자 이름
      accommodationId: 0,     // 숙소 ID
      accommodationName: "",  // 숙소 이름
      bookingId: 0,           // 예약 ID
      checkIn: "",            // 체크인 날짜
      checkOut: "",           // 체크아웃 날짜
      regionCode: selectedRegion,    // 지역 코드 (예시 기본값)
      regionName: "",         // 지역 이름
      boardType: apiBoardType,    // 게시판 타입
      title: "",              // 제목
      content: "",            // 내용
      rating: 0,              // 평점 (null 대신 0으로 초기화)
      likesCount: 0,               // 좋아요 수
      viewsCount: 0,          // 조회수
      createdAt: "",          // 작성일
    });

    // USER 상태값 관리
    const userId = useSelector((state: RootState) => state.userInfo?.userId)
    
    useEffect(() => {
      if (userId == null) return;
      setDto(prev => ({ ...prev, userId }));
    }, [userId]);

    // 수정 모드 => 기존 데이터 로드
    useEffect(() => {
      if (!isEdit) return;

      const fetchBoard = async () => {
        try {
          const res = await api.get(`/v1/boards/${boardId}`);
          setDto(res);
        } catch (err) {
          console.error("게시글 불러오기 실패:", err);
        }
      };
      fetchBoard();
    }, [isEdit, boardId]);

          


    const navigate = useNavigate();
   


    // 예약내역 불러오기 (userId 기반)
    useEffect(() => {
        if (userId == null) return;

        const fetchBookings = async () => {
            try {
                
                const res = await api.get(`/v1/boards/bookings/${userId}`);
                setBookings(res || []);
            } catch (err) {
                console.error("예약내역 조회 실패:", err);
            }   
        };
        fetchBookings();
    }, [userId]);

  


    // 게시글 제목 작성 핸들러
    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>)=>{
        setDto(prev =>({
            ...prev,
            title: e.target.value
        }));
    }

    // 게시글 내용 작성 핸들러
    const handleContentChange = (content: string)=>{
        setDto(prev =>({
            ...prev,
            content
        }));
    }

    // 게시글 등록 버튼 핸들러
    const handleSubmit = async(e: FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

       

        // 유효성 검사
        if (!dto.title.trim()) {
            alert("제목을 입력해주세요.");
            return;
        }
        if (!dto.content.trim()) {
        alert("내용을 입력해주세요.");
        return;
        }
        if (boardType === "review" && !dto.bookingId) {
        alert("예약 내역을 선택해주세요.");
        return;
        }
        if (boardType === "review" && !dto.rating) {
        alert("별점을 선택해주세요.");
        return;
        }

          
        try {
          if (isEdit) {
            await api.put(`/v1/boards/${boardId}`, dto);
            alert("게시글이 성공적으로 수정되었습니다.");
            navigate(`/${boardType}/${boardId}`);
            return;
          } else {

            console.log("📦 서버로 전송되는 dto:", dto);
            const res = await api.post("/v1/boards", dto);
            alert("게시글이 성공적으로 등록되었습니다.");
            
            navigate(`/${boardType}/${res.boardId}`);
          }

        }catch(err) {
            console.error("게시글 저장 실패:", err);
            alert("게시글 저장에 실패했습니다.");
        }
    }
    
    


   

    return <>
        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-4 p-4">
            <h3 className="fw-bold text-center mb-4">게시글 작성하기</h3>
    
            <Form onSubmit={handleSubmit}>
              {/* 제목 */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">제목</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="제목을 입력하세요..."
                  value={dto.title}
                  onChange={handleTitleChange}
                  className="py-2"
                />
              </Form.Group>
    
              {/* 예약내역 선택 (리뷰 전용) */}
              {boardType === "review" && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">예약 내역</Form.Label>
                  <div>
                  {isEdit ? (
                    <div className="p-2 border rounded-3 bg-light text-muted">
                      {dto.bookingId
                        ? `${dto.accommodationName} (${dto.checkIn} ~ ${dto.checkOut})`
                        : "예약 내역 없음"}
                    </div>
                  ) : (
                    <Button
                      variant="outline-primary"
                      className="rounded-3"
                      onClick={() => setShowModal(true)}
                    >
                      {dto.bookingId
                        ? `${dto.accommodationName} (${dto.checkIn} ~ ${dto.checkOut})`
                        : "예약 내역 선택"}
                    </Button>
                  )}

                  </div>
    
                  <BookingModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    bookings={bookings}
                    onSelect={(selectedBooking) => {
                      setDto((prev) => ({
                        ...prev,
                        bookingId: selectedBooking.bookingId,
                        accommodationId: selectedBooking.accommodationId,
                        accommodationName: selectedBooking.accommodationName,
                        regionCode: selectedBooking.regionCode,
                        checkIn: selectedBooking.checkIn,
                        checkOut: selectedBooking.checkOut,
                      }));
                      setShowModal(false);
                    }}
                  />
                </Form.Group>
              )}


              {/* 지역 선택 */}
              {boardType === "journal" && (
                <Form.Group>
                <Form.Label className="fw-semibold">지역 선택</Form.Label>
                <div>
                <Button
                variant="outline-primary"
                onClick={() => setShowRegionModal(true)}
                >                    
                    {selectedRegion === "전체" ? "지역 선택" : selectedRegion}
                
                </Button>
                </div>
            
                <RegionModal
                    show={showRegionModal}
                    onHide={() => setShowRegionModal(false)}
                    selectedRegion={selectedRegion}
                    setSelectedRegion={(regionName, regionCode)=>{
                        setSelectedRegion(regionName);
                        setDto(prev =>({
                            ...prev,
                            regionCode: regionCode,
                            regionName: regionName

                        }));
                    }}

                />
              </Form.Group>
                )}
    
              {/* 내용 */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">내용</Form.Label>
                <div className="border rounded-3 overflow-hidden">
                  <QuillEditor
                    value={dto.content ?? ""}
                    onChange={handleContentChange}
                  />
                </div>
              </Form.Group>
    
              {/* 별점 (리뷰 전용) */}
              {boardType === "review" && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">별점</Form.Label>
                  <div className="d-flex align-items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() =>
                          setDto((prev) => ({
                            ...prev,
                            rating: star,
                          }))
                        }
                        style={{
                          cursor: "pointer",
                          fontSize: "2rem",
                          color:
                            star <= (dto.rating ?? 0)
                              ? "#f8d24f"
                              : "#d6d6d6",
                          transition: "color 0.2s",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </Form.Group>
              )}


                  
    
              {/* 버튼 그룹 */}
              <div className="d-flex justify-content-center mt-4">
                <Button type="submit" variant="primary" className="px-4 me-4">
                  {isEdit ? "수정" : "등록"}
                </Button>
                <Button
                  type="reset"
                  variant="outline-secondary"
                  className="px-4"
                  onClick={()=>navigate(`/${boardType}/${boardId}`)}
                >
                  취소
                </Button>
              </div>
            </Form>
          </Card>
        </Container>
      
      </>
    }


export default BoardForm;