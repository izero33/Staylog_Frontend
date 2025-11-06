// src/domain/board/components/Comments.tsx

import { useEffect, useState } from "react";
import api from "../../../global/api";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import { group } from "console";


/*

    이거 없애고 채린이껄로.

    Comment 의 props 로 전달되는 CommentListResponse 는 아래 구조이다.
    {
        list: 댓글목록[],
        pageNum: 현재 페이지,
        startPageNum: 시작 페이지 번호,
        endPageNum: 끝 페이지 번호,
        totalPageCount: 전체 페이지 갯수
    }

    onMove 구조  (이동할 댓글의 pageNum 을 전달받는 함수)
    (num)=>{ }

*/


function Comments( { boardId, parentNum, parentWriter }) {

    const [ commentListResponse, setCommentListResponse ] = useState({
        list: [],
        startPageNum: 0,
        endPageNum: 0,
        pageNum: 0,
        totalPageCount: 0
    });

    // 댓글 얻어오는 함수
    const fetchComments = async (pageNum: number) => {
        try{
            const res = await api.get(`/v1/comments/${boardId}`);
            setCommentListResponse(res);


        }catch(err){
            console.log(err);
        }
    }

    
    useEffect(()=>{
        // 처음에는 1페이지 내용 받아오기
        fetchComments(1);
    },[]);

    // PaginationBar 컴포넌트에 전달할 callback 함수
    const handleMove=(num: Number)=>{
        // 이동할 페이지 번호 이용
        fetchComments(num);
    }

    
    // USER 상태값 관리
    let userId = useGetUserIdFromToken();

    // 로그인 X => 빈 object 넣어주기(null=>error)
    if(!userId)userId = {};

    

    // 대댓글이 펼쳐진 상태면 댓글의 그룹번호를 추가하고
    // 대댓글이 숨겨진 상태면 댓글의 그룹번호 제거할 set
    // 초기값은 어떤 번호도 추가되지 않은 상태
    const [openGroups, setOpenGroups] = useState(new Set());
    // 대댓글 폼 펼침 상태관리
    const [openFormGroups, setOpenFormGroups] = useState(new Set());
    // 댓글 수정 폼 상태관리
    const [openUpdateFormGroups, setOpenUpdateFormGroups] = useState(new Set());


    // 대댓글 보기 버튼 
    const handleReplyCountBtn = (groupNum: number) =>{
        // 기존 set 
    }


    return <>
    
    </>
}

export default Comments;