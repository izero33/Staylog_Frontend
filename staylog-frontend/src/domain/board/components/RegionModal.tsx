// src/domain/board/components/RegionModal.tsx

import { Button, ListGroup, Modal } from "react-bootstrap";
import useRegions from "../../common/hooks/useRegions";
import { useEffect, useState } from "react";

interface Props {
    show: boolean;
    onHide: () => void;
    selectedRegion: string;
    setSelectedRegion: (regionName: string, regionCode: string) => void; // 이름 + 코드 전달
}


function RegionModal({ 
    show, onHide,
    selectedRegion,
    setSelectedRegion }: Props) {
    
    // 지역 목록
    const regions = useRegions();

    // 임시 선택값 (열릴 때마다 현재 선택된 값으로 초기화)
    const [tempSelection, setTempSelection] = useState<string>(selectedRegion);

    useEffect(() => {
        if(show)
        setTempSelection(selectedRegion);
    }, [selectedRegion]);


    // 지역 선택 토글
    const toggleRegion = (regionName: string) => {
    setTempSelection(regionName); // 단일 선택은 클릭 시 그냥 선택값 변경
    };

    
    // 지역 선택 확정
    const handleConfirm = () => {
    const selected = regions.find((r) => r.codeName === tempSelection);
    if (selected) {
        setSelectedRegion(selected.codeName, selected.codeId);
    }
    onHide();
    };

    // 선택 취소
    const handleCancel = () => {
        setTempSelection(selectedRegion);
        onHide();
    }

    
    return (

        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>지역 선택</Modal.Title>
            </Modal.Header>

            <Modal.Body>
        <ListGroup variant="flush">
          {regions.map((region) => {
            const isSelected = tempSelection === region.codeName;
            return (
              <ListGroup.Item
                key={region.codeId}
                onClick={() => toggleRegion(region.codeName)}
                className={`d-flex justify-content-between align-items-center region-item ${
                  isSelected ? "selected bg-light border-primary" : ""
                }`}
                style={{
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <span>{region.codeName}</span>
                {isSelected && <i className="bi bi-check text-primary"></i>}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          취소
        </Button>
        <Button variant="primary" onClick={handleConfirm}>
          선택 완료
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RegionModal;