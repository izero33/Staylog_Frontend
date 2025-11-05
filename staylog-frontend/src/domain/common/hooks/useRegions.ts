import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../global/store/types';
import type { Region } from '../../search/types';

/**
 * 지역 공통코드를 Region 타입으로 변환하는 커스텀 훅
 *
 * @returns Region[] - "전체" 옵션이 포함된 지역 목록
 * @author danjae
 */
function useRegions(): Region[] {
  const commonCodes = useSelector((state: RootState) => state.commonCodes);

  return useMemo(() => {
    // "전체" 옵션 (프론트엔드 전용 - UI에서만 사용, API로 전송 안 됨)
    const allRegion: Region = {
      codeId: '전체',  // 백엔드에 없는 값이므로 한글로 명시
      codeName: '전체',
      displayOrder: 0,
    };

    // 공통코드가 로드되지 않았으면 "전체"만 반환
    if (!commonCodes?.regions) {
      return [allRegion];
    }

    // CommonCodeDto[] → Region[] 변환 및 정렬
    const regionList: Region[] = commonCodes.regions
      .filter((dto) => dto.useYn === 'Y') // 사용 가능한 코드만
      .sort((a, b) => a.displayOrder - b.displayOrder) // 정렬 순서대로
      .map((dto) => ({
        codeId: dto.codeId,           // "REGION_SEOUL"
        codeName: dto.codeName,       // "서울"
        displayOrder: dto.displayOrder,
      }));

    return [allRegion, ...regionList];
  }, [commonCodes]);
}

export default useRegions;
