export type HomeAccommodationItem = {
  accommodationId: number;
  name: string;
  regionCode: string;
  acType?: string | null;
  ratingAvg?: number | null;
  reviewCnt?: number | null;
  minPrice?: number | null;
  address?: string | null;
  imageUrl?: string | null;
  regionName?: string | null;
}

export type HomeAccommodationListResponse = HomeAccommodationItem[];