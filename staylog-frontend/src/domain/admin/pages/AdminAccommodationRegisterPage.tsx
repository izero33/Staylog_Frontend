import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';
import api from '../../../global/api';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import AddressSearch from '../../../global/components/AddressSearch';
import { fetchDraftIdForTable } from '../../../global/api/commonApi';

interface AccommodationRegisterData {
  accommodationId: number | null;
  name: string;
  acType: string;
  regionCode: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
}

/**
 * 어드민 숙소 등록 페이지 컴포넌트 (반응형)
 */
const AdminAccommodationRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<AccommodationRegisterData>({
    accommodationId: null,
    name: '',
    acType: '',
    regionCode: '',
    address: '',
    latitude: null,
    longitude: null,
    checkInTime: '15:00',
    checkOutTime: '11:00',
  });

  const [description, setDescription] = useState<string>('');
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
  const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const [draftId, acTypeRes, regionRes] = await Promise.all([
          fetchDraftIdForTable('ACCOMMODATION'),
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } }),
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
        ]);

        setFormData(prev => ({ ...prev, accommodationId: draftId }));
        setAcTypeCodeList(acTypeRes);
        setRegionCodeList(regionRes);
        if (acTypeRes.length > 0) setFormData(prev => ({ ...prev, acType: acTypeRes[0].codeId }));
        if (regionRes.length > 0) setFormData(prev => ({ ...prev, regionCode: regionRes[0].codeId }));

      } catch (error) {
        console.error('페이지 초기화 실패:', error);
        alert('숙소 등록 페이지를 여는 데 실패했습니다. 다시 시도해주세요.');
        navigate('/admin/accommodations');
      }
    };
    initializePage();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.accommodationId === null) {
      alert('숙소 ID가 아직 발급되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...formData, description };
      await api.post('/v1/admin/accommodations', payload);
      console.log('숙소 기본 정보 저장 성공:', payload);
      setImageUploadTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('숙소 기본 정보 저장 실패:', error);
      alert('숙소 정보 저장에 실패했습니다.');
      setIsSubmitting(false);
    }
  }, [formData, description]);

  const handleImageUploadComplete = useCallback(() => {
    setIsSubmitting(false);
    alert('숙소 등록이 완료되었습니다!');
    navigate('/admin/accommodations');
  }, [navigate]);

  const handleImageUploadError = useCallback((errorMsg: string) => {
    setIsSubmitting(false);
    setImageUploadError(errorMsg);
    alert('이미지 업로드 중 오류가 발생했습니다: ' + errorMsg);
  }, []);

  return (
    <Container fluid className="p-3 p-md-4">
      <h3 className="mb-3 mb-md-4">새 숙소 등록</h3>
      
      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Body>
            {/* 숙소명 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                숙소명 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Form.Control
                  type="text"
                  name="name"
                  size="sm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="숙소명을 입력하세요"
                />
              </Col>
            </Form.Group>

            {/* 유형 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                유형 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Form.Select
                  name="acType"
                  size="sm"
                  value={formData.acType}
                  onChange={handleChange}
                  required
                >
                  {acTypeCodeList.map(item => (
                    <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* 지역 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                지역 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Form.Select
                  name="regionCode"
                  size="sm"
                  value={formData.regionCode}
                  onChange={handleChange}
                  required
                >
                  {regionCodeList.map(item => (
                    <option key={item.codeId} value={item.codeId}>{item.codeName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* 주소 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                주소 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <div className='input-group input-group-sm'>
                  <Form.Control
                    type="text"
                    size="sm"
                    value={formData.address}
                    placeholder="주소 검색 버튼을 클릭하세요"
                    readOnly
                  />
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                  >
                    주소 검색
                  </Button>
                </div>
                <AddressSearch
                  show={showAddressModal}
                  onClose={() => setShowAddressModal(false)}
                  onAddressSelect={(address, coords) => {
                    setFormData(prev => ({ ...prev, address, latitude: coords.lat, longitude: coords.lng }));
                    setShowAddressModal(false);
                  }}
                />
              </Col>
            </Form.Group>

            {/* 체크인/체크아웃 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                체크인/체크아웃
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Row className="g-2">
                  <Col xs={5} sm={5}>
                    <Form.Control
                      type="time"
                      name="checkInTime"
                      size="sm"
                      value={formData.checkInTime}
                      onChange={handleChange}
                    />
                  </Col>
                  <Col xs={2} sm={2} className="text-center d-flex align-items-center justify-content-center">
                    <span>~</span>
                  </Col>
                  <Col xs={5} sm={5}>
                    <Form.Control
                      type="time"
                      name="checkOutTime"
                      size="sm"
                      value={formData.checkOutTime}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
              </Col>
            </Form.Group>

            {/* 상세 설명 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                상세 설명
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                {formData.accommodationId ? (
                  <div className="mt-2 mb-5">
                    <QuillEditor
                      value={description}
                      onChange={setDescription}
                      style={{ height: '400px' }}
                      targetType="ACCOMMODATION"
                      targetId={formData.accommodationId}
                    />
                  </div>
                ) : <p className="text-muted">ID 발급 중...</p>}
              </Col>
            </Form.Group>

            {/* 이미지 */}
            <Form.Group as={Row} className="mb-3 mt-5 mt-md-4 pt-md-4 mt-lg-0 pt-lg-0">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                대표/갤러리 이미지
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                {formData.accommodationId ? (
                  <ImageManager
                    targetType="ACCOMMODATION"
                    targetId={formData.accommodationId}
                    uploadTrigger={imageUploadTrigger}
                    onUploadComplete={handleImageUploadComplete}
                    onUploadError={handleImageUploadError}
                  />
                ) : <p className="text-muted">ID 발급 중...</p>}
                {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* 버튼 영역 */}
        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting || formData.accommodationId === null}
            className="order-1 order-sm-0"
          >
            {isSubmitting ? '등록 중...' : '숙소 등록'}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => navigate('/admin/accommodations')}
            className="order-0 order-sm-1"
          >
            취소
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AdminAccommodationRegisterPage;