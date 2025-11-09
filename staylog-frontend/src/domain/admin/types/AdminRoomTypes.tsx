
import type { PageRequest, PageResponse } from "../../../global/types/Paginationtypes";

export interface AdminRoom {
    accommodationId: number;
    accommodationName: string;
    roomId: number;
    name?: string;
    rmType: string;
    typeName: string;
    price?: number;
    maxAdult?: number;
    maxChildren?: number;
    maxInfant?: number;
    checkInTime?: string;
    checkOutTime?: string;
    area?: number;
    deletedYn: 'Y' | 'N';
    singleBed?: number;
    doubleBed?: number;
    queenBed?: number;
    kingBed?: number;
    createdAt: string;
    updatedAt?: string;
    description: string;
}

export interface AdminRoomSearchParams extends PageRequest {
    accommodationId: number;
    rmType?: string;
    keyword?: string;
    deletedYn?: 'Y' | 'N';
}

export interface AdminRoomListResponse {
    rooms: AdminRoomListData[];
    page: PageResponse;
}

export interface AdminRoomListData {
    accommodationId: number;
    accommodationName: string;
    roomId: number;
    name?: string;
    rmType: string;
    typeName: string;
    price?: number;
    maxAdult: number;
    deletedYn: 'Y' | 'N';
    createdAt: string;
}

