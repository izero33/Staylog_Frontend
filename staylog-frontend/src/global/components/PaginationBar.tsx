// src/global/components/PaginationBar.tsx

import { Pagination } from "react-bootstrap";

/*
    pageState 는 아래 모양의 object
    {
        pageNum: 현재 페이지 번호,
        startPageNum: 시작 페이지 번호,
        endPageNum: 끝 페이지 번호,
        totalPageCount: 전체 페이지의 갯수
    }

    onMove는 아래 모양의 함수, num은 이동할 페이지의 번호를 전달하면 된다.
    (num)=>{ }
*/

export interface PageState {
    pageNum: number;
    startPage: number;
    endPage: number;
    pageSize: number;
    totalPage: number;
    
  }

  export interface PaginationBarProps {
    pageState: PageState;
    onMove: (num: number) => void;
  }
  
function PaginationBar({pageState, onMove}: PaginationBarProps) {

    //페이징 UI 만들 떄 사용할 배열 리턴해주는 함수
    function range(startPage: number, endPage: number) {
        const result = [];
        for (let i = startPage; i <= endPage; i++) {
            result.push(i);
        }
        return result;
    }

    // 페이지 번호 출력할 때 사용하는 숫자를 배열에 미리 준비한다.
    const pageNums = range(pageState.startPage, pageState.endPage);

    return <>
        <Pagination>
            <Pagination.Item
                onClick={()=>onMove(pageState.startPage-1)}
                disabled={pageState.startPage===1}>
                    Prev
                </Pagination.Item>
            {
                pageNums.map(num =>
                    <Pagination.Item
                        onClick={()=>onMove(num)}
                        active={pageState.pageNum===num}
                        key={num}>
                            {num}
                        </Pagination.Item>                
                )
            }
            <Pagination.Item
                onClick={()=>onMove(pageState.endPage+1)}
                disabled={pageState.endPage===pageState.totalPage}>
                    Next
                </Pagination.Item>

        </Pagination>
    </>
}

export default PaginationBar;