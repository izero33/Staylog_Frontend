import type { PageRequest, PageResponse } from "../../../global/types/Paginationtypes";

export interface AdminAccommodation {
    accommodationId?: number;
    name: string;
    acType: string;
    typeName: string;
    regionCode: string;
    regionName: string;
    address?: string;
    description: string;
    deletedYn: 'Y' | 'N';
    checkInTime?: string;
    checkOutTime?: string;
    longitude: number | null;
    latitude: number | null;
    createdAt: string;
    updatedAt?: string;
}

export interface AdminAccommodationSearchParams extends PageRequest {
    regionCode?: string;
    acType?: string;
    keyword?: string;
    deletedYn?: 'Y' | 'N';
}

export interface AdminAccommodationListResponse {
    accommodations: AdminAccommodationListData[];
    page: PageResponse;
}

export interface AdminAccommodationListData {
    accommodationId: number;
    name: string;
    acType: string;
    typeName: string;
    regionCode: string;
    regionName: string;
    deletedYn: 'Y' | 'N';
    createdAt: string;
}

