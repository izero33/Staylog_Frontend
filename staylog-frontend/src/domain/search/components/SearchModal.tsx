import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import GuestSelector from './GuestSelector';
import useRegions from '../../common/hooks/useRegions';
import type { GuestCount } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();

  // 공통코드에서 지역 목록 가져오기
  const regions = useRegions();

  // 선택된 지역 코드들 (codeId 저장)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // 날짜 선택
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);

  // 인원수
  const [guestCount, setGuestCount] = useState<GuestCount>({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [totalGuests, setTotalGuests] = useState<number>(2);

  // GuestSelector 초기화를 위한 key
  const [resetKey, setResetKey] = useState<number>(0);

  // 지역 선택/해제
  const toggleRegion = (codeId: string) => {
    if (codeId === '전체') {
      // "전체" 선택 시 모든 지역 해제 (프론트 전용, API로 전송 안 됨)
      setSelectedRegions([]);
    } else {
      setSelectedRegions((prev) =>
        prev.includes(codeId)
          ? prev.filter((id) => id !== codeId)
          : [...prev, codeId]
      );
    }
  };

  // 인원수 변경 핸들러
  const handleGuestChange = (guests: GuestCount, total: number) => {
    setGuestCount(guests);
    setTotalGuests(total);
  };

  // 초기화
  const handleReset = () => {
    setSelectedRegions([]);
    setCheckInDate(null);
    setCheckOutDate(null);
    setGuestCount({ adults: 2, children: 0, infants: 0 });
    setTotalGuests(2);
    // GuestSelector 강제 리렌더링을 위해 key 변경
    setResetKey(prev => prev + 1);
  };

  // 검색
  const handleSearch = () => {
    // 쿼리 파라미터 생성
    const params = new URLSearchParams();

    // 지역 코드 추가 (codeId 전송)
    if (selectedRegions.length > 0) {
      selectedRegions.forEach((codeId) => {
        params.append('regionCodes', codeId);
      });
    }

    // 날짜 추가
    if (checkInDate) {
      params.append('checkIn', format(checkInDate, 'yyyy-MM-dd'));
    }
    if (checkOutDate) {
      params.append('checkOut', format(checkOutDate, 'yyyy-MM-dd'));
    }

    // 인원수 추가
    params.append('people', totalGuests.toString());

    // 숙소 리스트 페이지로 이동
    navigate(`/accommodations?${params.toString()}`);
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>숙소 검색</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 날짜 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-calendar-event me-2"></i>
            날짜
          </label>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small">체크인</label>
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="form-control"
                placeholderText="체크인 날짜"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">체크아웃</label>
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate || new Date()}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="form-control"
                placeholderText="체크아웃 날짜"
              />
            </div>
          </div>
        </div>

        {/* 인원 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-people-fill me-2"></i>
            인원
          </label>
          <GuestSelector
            key={resetKey}
            onGuestChange={handleGuestChange}
            initialGuests={guestCount}
          />
        </div>

        {/* 지역 선택 */}
        <div className="mb-4">
          <label className="form-label fw-semibold mb-3">
            <i className="bi bi-geo-alt-fill me-2"></i>
            지역
          </label>
          <div className="row g-2">
            {regions.map((region) => (
              <div key={region.codeId} className="col-6 col-sm-4 col-md-3">
                <button
                  type="button"
                  className={`btn w-100 ${
                    region.codeId === '전체'
                      ? selectedRegions.length === 0
                        ? 'btn-dark'
                        : 'btn-outline-dark'
                      : selectedRegions.includes(region.codeId)
                      ? 'btn-dark'
                      : 'btn-outline-dark'
                  }`}
                  onClick={() => toggleRegion(region.codeId)}
                  style={{
                    borderRadius: '20px',
                    padding: '12px 20px',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}
                >
                  {region.codeName}
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="outline-dark" onClick={handleReset}>
          초기화
        </Button>
        <Button variant="dark" onClick={handleSearch}>
          검색
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SearchModal;
