import { useEffect, useState } from "react";
import api from "../api";

export function getImageUrl(targetType: string, targetId:number){


  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(()=>{
    if(!targetType || !targetId) return;

    api.get(`/v1/images/${targetType}/${targetId}`)
    .then((res) => {
        console.log("이미지 응답:", res);
      const firstImg = res?.images?.[0]?.imageUrl ?? "";
      setUrl(firstImg);
    })
    .catch(()=>setUrl(""))//실패시 빈 문자열
  },[targetType, targetId])

  return url;
}