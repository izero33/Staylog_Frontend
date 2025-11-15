export type HomeAccommodationListRequest = {
  regionCode? :String | null 
  sort?:'rating' | 'review' | 'price' | 'latest' | string | null;
  offset? : number
  limit? : number
}