// src/domain/board/components/RegionModal.tsx

import { useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import useRegions from "../../common/hooks/useRegions";

interface Props {
  show: boolean;
  onHide: () => void;
  selectedRegion: string;
  setSelectedRegion: (regionName: string, regionCode: string) => void;
}

function RegionModal({ show, onHide, selectedRegion, setSelectedRegion }: Props) {
  const regions = useRegions();

  // 임시 선택 상태
  const [tempSelection, setTempSelection] = useState<string>(selectedRegion);

  useEffect(() => {
    if (show) setTempSelection(selectedRegion);
  }, [show, selectedRegion]);

  // 지역 선택
  const toggleRegion = (regionName: string) => {
    setTempSelection(regionName);
  };

  // 선택 완료
  const handleConfirm = () => {
    const selected = regions.find((r) => r.codeName === tempSelection);
    if (selected) {
      setSelectedRegion(selected.codeName, selected.codeId);
    }
    onHide();
  };

  // 취소
  const handleCancel = () => {
    setTempSelection(selectedRegion);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">지역 선택</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        

        {/* 2열 카드형 레이아웃 */}
        <Row xs={2} sm={2} md={2} className="g-1">
          {regions.map((region) => {
            const isSelected = tempSelection === region.codeName;
            return (
              <Col key={region.codeId}>
                <Card
                  onClick={() => toggleRegion(region.codeName)}
                  className={`border-0 text-center shadow-sm ${
                    isSelected ? "bg-primary text-white" : "bg-light text-dark"
                  }`}
                  style={{
                    cursor: "pointer",
                    borderRadius: "12px",
                    transition: "all 0.25s ease",
                    transform: isSelected ? "scale(1)" : "scale(1)",
                  }}
                >
                  <Card.Body className="py-3 fw-semibold d-flex align-items-center justify-content-center gap-2">
                    {region.codeName}
                    {isSelected && <i className="bi bi-check-circle-fill"></i>}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex justify-content-center gap-3">
        <Button variant="outline-secondary" onClick={handleCancel} className="px-4">
          취소
        </Button>
        <Button variant="primary" onClick={handleConfirm} className="px-4">
          선택 완료
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default RegionModal;
