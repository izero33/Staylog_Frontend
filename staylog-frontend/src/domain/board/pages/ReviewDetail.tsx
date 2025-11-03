// src/domain/board/pages/ReviewDetail.tsx

import { useEffect, useState } from "react";
import type { BoardDto } from "../types/boardtypes";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../global/api";



function ReviewDetail() {

    // 게시글 번호
    const {boardId} = useParams();

    // DTO 상태값 관리
    const [dto, setDto] = useState<BoardDto | null>(null);


    useEffect(()=>{
        const fetchBoards = async() =>{
            try {
                const res = await api.get(`/v1/boards/${boardId}`);
                const board = res?.data?.data || res?.data || {};
                setDto(board);
            }catch(err) {
                console.error("게시글 상세 조회 불가:", err);
            } 
        };

        fetchBoards();
    },[boardId]);

    const navigate = useNavigate();

    return <>
    
    <div className="board-container">

        {/* 게시글 제목 */}
        <div className="board-header-fixed">
            <h1 className="board-title">{dto?.title}</h1>

            <div className="board-meta-line"></div>

            <div className="board-meta-info">
                <span className="board-author">작성자: {dto?.userNickName || dto?.userName}</span>
                <span className="board-date">작성일: {dto?.createdAt}</span>
                <span className="board-views">조회수: {dto?.likes || 0}</span>
            </div>  


        </div>
        



        {/* 게시글 내용 */}
        dangerouslySetInnerHTML={{ __html: dto?.content || "" }}
        


    </div>

    {/* 숙소 링크 */}


    </>
}

export default ReviewDetail;