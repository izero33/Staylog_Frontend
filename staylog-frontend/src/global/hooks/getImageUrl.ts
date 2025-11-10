import { useEffect, useState } from "react";
import api from "../api";

export function getImageUrl(targetType: string, targetId:number){

  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(()=>{
    if(!targetType || !targetId) return;

    api.get(`/v1/images/${targetType}/${targetId}`)
    .then((res) => {
      const firstImg = res?.images?.[0]?.imageUrl ?? undefined;
      setUrl(firstImg);
    })
    .catch(()=>setUrl(undefined))//실패시 빈 문자열
  },[targetType, targetId])

  return url;
}