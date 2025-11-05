import { useNavigate } from "react-router-dom";

function Board(){

  const navigate = useNavigate();
  return<>
  <button onClick={()=>navigate("/quill")}>글쓰기</button>
  </>
}

export default Board;