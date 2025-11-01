// src/domain/board/types/boardtypes.ts



export type BoardDto = {

   boardType: string;
   regionCode: number;
   regionName: string;


   boardId: number;
   userId: number;
   userName: string;
   accommodationId: number;
   accommodationName: string;
   bookingId: number;

   rating: number;
   title: string;
   content: string;
   viewCount?: number;
   likes: number;

   createdAt?: string;
   updatedAt?: string;
   deleted: string;


}