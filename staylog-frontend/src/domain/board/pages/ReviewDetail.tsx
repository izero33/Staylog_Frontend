// src/domain/board/pages/ReviewDetail.tsx

import { use, useEffect, useState } from "react";
import type { BoardDto } from "../types/boardtypes";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";



function ReviewDetail() {
    

    // USER 상태값 관리
    const userId = useGetUserIdFromToken();
    const [liked, setLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);


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
                const board = res;
                setDto(board);

                // 좋아요
                const resLike = await api.get(`/v1/likes/${boardId}`);
                setLikesCount(resLike || 0);

                const resLiked = await api.get(`/v1/likes/${boardId}/${userId}`);
                setLiked(resLiked || 0);
                
            }catch(err) {
                console.error("게시글 상세 조회 불가:", err);
            } 
        };

        fetchBoard();
    },[boardId]);





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
            <span>조회수: {dto?.likes || 0}</span>
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


    <div className="border-top my-3 border-dark"></div>

    </>
}

export default ReviewDetail;