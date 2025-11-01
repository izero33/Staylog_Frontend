// src/domain/board/types/boardtypes.tsx

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../global/api";
import type { BoardDto } from "../types/boardtypes";

import QuillEditor from "../components/QuillEditor";




function BoardForm() {

    

    // DTO 관리
    const [dto, setDto] = useState<Partial<BoardDto>>({
        boardType: "review",    // 임시 카테고리 리뷰
        regionCode: 333,    // 임시 서울 
        userId: 0,
        accommodationId: 111, // 임시 숙소
        bookingId: 333,       // 임시 예약

        
        rating: 0,
        title: "",
        content: "",
    });

    const navigate = useNavigate();

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
        console.log("보내는 데이터:", dto);
        
        try {

            const res = await api.post("/v1/boards", dto);
            console.log("게시글 등록 결과: ", res.data);
            alert("게시글 등록 성공")
            navigate("/review")
        } catch (err) {
            console.log("게시글 등록 실패: ", err);
            alert("게시글 등록 실패")      
         }
        };

    
    


   

    return <>

    <h1>게시글 작성하기</h1>

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
        <div className="mb-2">
            <label htmlFor="editor" className="form-label">내용</label>
            <QuillEditor 
                value={dto.content ?? ""} 
                onChange={handleContentChange} />
        </div>
        <button type="submit" className="btn btn-secondary">등록</button>

    </form>



    </>
}


export default BoardForm;