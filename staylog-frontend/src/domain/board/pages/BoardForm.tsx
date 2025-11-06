// src/domain/board/types/boardtypes.tsx

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import type { BoardDto } from "../types/boardtypes";
import BookingModal from "../components/BookingModal";


import QuillEditor from "../components/QuillEditor";
import { Button } from "react-bootstrap";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";




function BoardForm() {

    // 게시판 카테고리 boradType
    const { boardType } = useParams<{ boardType: string }>();


    // USER 상태값 관리
    const rawUserId = useGetUserIdFromToken();
    const [userId, setUserId] = useState<number | null>(null);

    // 예약내역 상태값 관리
    const [bookings, setBookings] = useState<any[]>([]);

    // 예약내역 모달 상태값 관리
    const [showModal, setShowModal] = useState<boolean>(false);

    const apiBoardType =
        boardType === "journal" ? "BOARD_JOURNAL" : "BOARD_REVIEW";


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
        regionCode: "REGION_SEOUL",    // 지역 코드 (예시 기본값)
        regionName: "",         // 지역 이름
        boardType: apiBoardType,    // 게시판 타입
        title: "",              // 제목
        content: "",            // 내용
        rating: 0,              // 평점 (null 대신 0으로 초기화)
        likes: 0,               // 좋아요 수
        viewsCount: 0,          // 조회수
        createdAt: "",          // 작성일
      });


    const navigate = useNavigate();

    // userId 설정
    useEffect(() => {
        if (rawUserId ===undefined || rawUserId === null) {
            setUserId(null);
        return;
        }
        
        const parsedId = Number(rawUserId);
        if (!isNaN(parsedId)) {
          setUserId(parsedId);
          setDto((prev) => ({ ...prev, userId: parsedId })); // dto에도 반영
        } else {
          console.warn("잘못된 userId 형식:", rawUserId);
          setUserId(null);
        }
      }, [rawUserId]);

    // 예약내역 불러오기 (userId 기반)
    useEffect(() => {
        if (userId === null) return;

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
            console.log("📦 서버로 전송되는 dto:", dto);
            const res = await api.post("/v1/boards", dto);
            alert("게시글이 성공적으로 등록되었습니다.");
            navigate(`/${boardType}/${res.boardId}`);
            

        }catch(err) {
            console.error("게시글 등록 실패:", err);
            alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
        }
    }
    
    


   

    return <>

    <h1>게시글 작성하기</h1>

    {/* 제목 */}
    <form onSubmit={handleSubmit} method="post">
        <div className="mb-2">
            <label htmlFor="title" className="form-label">제목</label>
            <input onChange={handleTitleChange} type="text" 
                className="form-control" 
                id="title" 
                name="title" 
                value={dto.title}
                placeholder="제목을 입력하세요.." />
        </div>

        {/* 예약내역 선택 모달 - 리뷰 작성폼에만 */}
        {boardType === "review" && (
        <div className="mb-3 d-flex align-items-center gap-2">
        <div>
            <label className="form-label mb-1">예약내역</label>
            <div>
            <Button
                variant="outline-primary"
                onClick={() => setShowModal(true)}
            >
                {dto.bookingId
                ? `${dto.accommodationName} ${dto.checkIn} ~ ${dto.checkOut}`
                : "예약 내역 선택"}
            </Button>
            </div>
        </div>

        <BookingModal
            show={showModal}
            onHide={() => setShowModal(false)}
            bookings={bookings}
            onSelect={(selectedBooking) => {
            console.log("선택된 예약:", selectedBooking);
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
        </div>
        )}

        {/* 내용 */}
        <div className="mb-2">
            <label htmlFor="editor" className="form-label">내용</label>
            <QuillEditor 
                value={dto.content ?? ""} 
                onChange={handleContentChange} />
        </div>

        {/* 별점 - 리뷰 작성폼에만 */}
        {boardType === "review" && (
        <div className="mb-3">
            <label className="form-label mt-2">별점</label>
            <div className="star-rating d-flex align-items-center">
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
                    color: star <= (dto.rating ?? 0) ? "#f0de77ff" : "#dddddcff", // 노란색 / 회색
                    transition: "color 0.2s",
                    }}
                >★</span>
                ))}
            </div>
        </div>

        )}

        {/* 등록 버튼 */}
        <button type="submit" className="btn btn-secondary">등록</button>

    </form>



    </>
}


export default BoardForm;