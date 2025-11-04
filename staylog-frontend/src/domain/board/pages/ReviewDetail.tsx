// src/domain/board/pages/ReviewDetail.tsx

import { useEffect, useState } from "react";
import type { BoardDto, likesDto } from "../types/boardtypes";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";



function ReviewDetail() {
    

    

    // 게시글 번호
    const {boardId} = useParams();

    // DTO 상태값 관리
    const [dto, setDto] = useState<BoardDto | null>(null);


    const navigate = useNavigate();


    // 게시글 상세 불러오기
    useEffect(()=>{
        const fetchBoard = async() =>{
            try {
                
                const res = await api.get(`/v1/boards/${boardId}`);
                console.log("📦 불러온 게시글 상세:", res);
                
                setDto(res);

                
            }catch(err) {
                console.error("게시글 상세 조회 불가:", err);
            } 
        };

        fetchBoard();
    },[boardId]);


    // USER 상태값 관리
    const userId = useGetUserIdFromToken();
    
    // 좋아요 상태값 관리    
    const [likesDto, setLikesDto] = useState<likesDto | null>({
        likeId: 0,
        boardId: boardId,
        userId: userId
    });
    const [liked, setLiked] = useState<boolean>(false);
    const [likes, setLikes] = useState<number>(0);

    // 좋아요
    useEffect(()=>{
        const fetchLikes = async() =>{
            try {
                
                const resLikeCount = await api.get(`/v1/likes/${boardId}`);
                setLikes(resLikeCount ?? 0);

                // 현재 사용자의 좋아요 여부
                if (userId) {
                const resLiked = await api.get(`/v1/likes/${boardId}/${userId}`);
                const isLiked = resLiked === 1 || resLiked === true || resLiked === "true";
                setLiked(isLiked);
                } else {
                    setLiked(false);
                }

            }catch(err) {
                console.error("좋아요 조회 불가:", err);
            } 
        };

        fetchLikes();
    },[boardId, userId]);


    // 좋아요 버튼
    const handleLike = async () => {
        
        if (!userId) {
            alert("로그인 후 이용해주세요.");
            return;
        }

        const payload = {
            boardId: Number(boardId),
            userId: Number(userId),
          };
          
        try {
            if (!liked) {   // ✅ 좋아요 추가
                      
                await api.post(`/v1/likes`, payload);
                setLikes((prev) => prev + 1);
                setLiked(true);

            } else {        // ✅ 좋아요 취소
                
                await api.delete(`/v1/likes`, { data:payload});
                setLikes((prev) => (prev > 0 ? prev - 1 : 0));
                setLiked(false);
            }
        } catch (err) {
            console.error("좋아요 처리 실패:", err);
        }
    };



    return <>
    
    <div className="board-container">

        {/* 게시글 제목 */}
        <div className="d-flex justify-content-center align-items-center my-5">
            <h1 className="board-title">{dto?.title}</h1>
        </div>

        <div className="border-top my-3 border-dark"></div>

        {/* 작성자, 작성일, 조회수 */}
        <div className="board-meta-info d-flex justify-content-end">
            <span className="me-2">작성자: {dto?.userNickName || dto?.userName || dto?.userId}</span>
            <span className="me-2">작성일: {dto?.createdAt}</span>
            <span>조회수: {dto?.viewsCount ?? 0}</span>
        </div>  


        {/* 게시글 내용 */}
        <div dangerouslySetInnerHTML={{ __html: dto?.content || "" }} className="m-3" />

        {/* 별점 */}
        <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
            
            {[1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}  
                style={{ color: star <= (dto?.rating || 0) ? "#f1e25bff" : "#dddddcff", 
                fontSize: "2rem" }} // 노란색 / 회색
            >
                ★
            </span>
            ))}
        </div>

        



    </div>
    

    {/* 숙소 링크 */}
    <div className="d-flex justify-content-center mb-5">
        <button
            className="btn btn-secondary"
            onClick={() => {
                if (dto?.accommodationId) {
                    navigate(`/accommodations/${dto.accommodationId}`);
                }
            }}
        >
            숙소 보러가기
        </button>
    </div>

    {/* 좋아요 */}
    <div className="d-flex justify-content-center mb-5">

        <button
            className={`btn ${liked ? "btn-danger" : "btn-outline-danger"}`}
            onClick={handleLike}>
            {liked ? "❤️" : "🤍"} {likes}
        </button>
    </div>


    <div className="border-top my-3 border-dark"></div>

    </>
}

export default ReviewDetail;