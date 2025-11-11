import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../global/api';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';
import { fetchDraftIdForTable } from '../../../global/api/commonApi';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';

interface RoomRegisterData {
  roomId: number | null;
  accommodationId: number;
  accommodationName: string;
  name: string;
  rmType: string;
  price: number;
  maxAdult: number;
  maxChildren: number;
  maxInfant: number;
  singleBed: number;
  doubleBed: number;
  queenBed: number;
  kingBed: number;
  area: number;
  checkIn: string;
  checkOut: string;
}

const AdminRoomRegisterPage: React.FC = () => {
  const { accommodationId: accommodationIdStr } = useParams();
  const accommodationId = Number(accommodationIdStr);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RoomRegisterData>({
    roomId: null,
    accommodationId: accommodationId,
    accommodationName: '',
    name: '',
    rmType: '',
    price: 0,
    maxAdult: 2,
    maxChildren: 0,
    maxInfant: 0,
    singleBed: 0,
    doubleBed: 0,
    queenBed: 0,
    kingBed: 0,
    area: 0,
    checkIn: '15:00',
    checkOut: '11:00',
  });

  const [description, setDescription] = useState<string>('');
  const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  useEffect(() => {
    if (!accommodationId || isNaN(accommodationId)) {
      alert('올바른 숙소 ID가 없습니다. 숙소 목록으로 돌아갑니다.');
      navigate('/admin/accommodations');
      return;
    }

    const initializePage = async () => {
      try {
        const [draftRoomId, rmTypeRes, accommodationDetailRes] = await Promise.all([
          fetchDraftIdForTable('ROOM'),
          api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } }),
          api.get<AdminAccommodation>(`/v1/admin/accommodations/${accommodationId}`)
        ]);

        setFormData(prev => ({
          ...prev,
          roomId: draftRoomId,
          accommodationName: accommodationDetailRes.name
        }));
        setRmTypeCodeList(rmTypeRes);
        if (rmTypeRes.length > 0) setFormData(prev => ({ ...prev, rmType: rmTypeRes[0].codeId }));

      } catch (err) {
        console.error('페이지 초기화 실패:', err);
        alert('객실 등록 페이지를 여는 데 실패했습니다. 다시 시도해주세요.');
        navigate(`/admin/accommodations/${accommodationId}/rooms`);
      }
    };
    initializePage();
  }, [accommodationId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const numberFields = ['price', 'maxAdult', 'maxChildren', 'maxInfant', 'singleBed', 'doubleBed', 'queenBed', 'kingBed', 'area'];

    if (numberFields.includes(name)) {
      // 빈 문자열이면 0, 숫자로 변환했을 때 NaN이면 0, 아니면 변환된 숫자
      const numValue = value === '' ? 0 : Number(value);
      
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.roomId === null) {
      alert('객실 ID가 아직 발급되지 않았습니다. 잠시 후 다시 시도해주세요.');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = { ...formData, description };
      await api.post(`/v1/admin/accommodations/${accommodationId}/rooms`, payload);
      console.log('객실 기본 정보 저장 성공:', payload);
      setImageUploadTrigger(prev => prev + 1);

    } catch (err) {
      console.error('객실 기본 정보 저장 실패:', err);
      alert('객실 정보 저장에 실패했습니다.');
      setIsSubmitting(false);
    }
  }, [formData, description, accommodationId]);

  const handleImageUploadComplete = useCallback(() => {
    setIsSubmitting(false);
    alert('객실 등록이 완료되었습니다!');
    navigate(`/admin/accommodations/${accommodationId}/rooms`);
  }, [navigate, accommodationId]);

  const handleImageUploadError = useCallback((errorMsg: string) => {
    setIsSubmitting(false);
    setImageUploadError(errorMsg);
    alert('이미지 업로드 중 오류가 발생했습니다: ' + errorMsg);
  }, []);

  return (
    <Container fluid className="p-3 p-md-4">
      <h3 className="mb-3 mb-md-4">
        새 객실 등록
        <span className="text-muted fs-6 ms-2">
          ({formData.accommodationName || '로딩 중...'})
        </span>
      </h3>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Body>
            {/* 객실명 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                객실명 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Form.Control
                  type="text"
                  name="name"
                  size="sm"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="객실명을 입력하세요"
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
                  name="rmType"
                  size="sm"
                  value={formData.rmType}
                  onChange={handleChange}
                  required
                >
                  {rmTypeCodeList.map(item => (
                    <option key={item.codeId} value={item.codeId}>
                      {item.codeName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Form.Group>

            {/* 가격 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                가격 <span className="text-danger">*</span>
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    name="price"
                    size="sm"
                    className="text-end"
                    style={{ maxWidth: '200px' }}
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                  <span className="ms-2">원</span>
                </div>
              </Col>
            </Form.Group>

            {/* 최대 인원 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                최대 인원
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Card style={{ maxWidth: '400px' }}>
                  <Card.Body className="gap-2 d-flex flex-column">
                    <Form.Group className='d-flex justify-content-between'>
                      <Form.Label className='fw-bold'>성인</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name='maxAdult'
                          size="sm"
                          className="text-end"
                          value={formData.maxAdult}
                          onChange={handleChange}
                        />
                        <span className="ms-2">명</span>
                      </div>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between">
                      <Form.Label className='fw-bold'>어린이</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name='maxChildren'
                          size="sm"
                          className="text-end"
                          value={formData.maxChildren}
                          onChange={handleChange}
                        />
                        <span className="ms-2">명</span>
                      </div>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between">
                      <Form.Label className='fw-bold'>유아</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name='maxInfant'
                          size="sm"
                          className="text-end"
                          value={formData.maxInfant}
                          onChange={handleChange}
                        />
                        <span className="ms-2">명</span>
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Form.Group>

            {/* 침대 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                침대
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <Card style={{ maxWidth: '400px' }}>
                  <Card.Body className="gap-2 d-flex flex-column">
                    <Form.Group className="d-flex justify-content-between">
                      <Form.Label className='fw-bold'>싱글</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="singleBed"
                          size="sm"
                          className="text-end"
                          value={formData.singleBed}
                          onChange={handleChange}
                        />
                        <span className="ms-2">개</span>
                      </div>
                    </Form.Group>
                    <Form.Group className='d-flex justify-content-between'>
                      <Form.Label className='fw-bold'>더블</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="doubleBed"
                          size="sm"
                          className="text-end"
                          value={formData.doubleBed}
                          onChange={handleChange}
                        />
                        <span className="ms-2">개</span>
                      </div>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between">
                      <Form.Label className='fw-bold'>퀸</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="queenBed"
                          size="sm"
                          className="text-end"
                          value={formData.queenBed}
                          onChange={handleChange}
                        />
                        <span className="ms-2">개</span>
                      </div>
                    </Form.Group>
                    <Form.Group className="d-flex justify-content-between">
                      <Form.Label className='fw-bold'>킹</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="text"
                          name="kingBed"
                          size="sm"
                          className="text-end"
                          value={formData.kingBed}
                          onChange={handleChange}
                        />
                        <span className="ms-2">개</span>
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            </Form.Group>

            {/* 면적 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                면적
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                <div className="d-flex align-items-center">
                  <Form.Control
                    type="text"
                    name="area"
                    size="sm"
                    className="text-end"
                    style={{ maxWidth: '200px' }}
                    value={formData.area}
                    onChange={handleChange}
                  />
                  <span className="ms-2">m²</span>
                </div>
              </Col>
            </Form.Group>

            {/* 상세 설명 */}
            <Form.Group as={Row} className="mb-3">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                상세 설명
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                {formData.roomId ? (
                  <div className="mt-2 mb-5">
                    <QuillEditor
                      key={`quill-${resetTrigger}`}
                      value={description}
                      onChange={setDescription}
                      style={{ height: '400px' }}
                      targetType="ROOM"
                      targetId={formData.roomId}
                    />
                  </div>
                ) : <p className="text-muted">ID 발급 중...</p>}
              </Col>
            </Form.Group>

            {/* 대표/갤러리 이미지 */}
            <Form.Group as={Row} className="mb-3 mt-5 mt-md-4 pt-md-4 mt-lg-0 pt-lg-0">
              <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                대표/갤러리 이미지
              </Form.Label>
              <Col xs={12} md={9} lg={10}>
                {formData.roomId ? (
                  <ImageManager
                    key={`image-manager-${resetTrigger}`}
                    targetType="ROOM"
                    targetId={formData.roomId}
                    isEditMode={false}
                    uploadTrigger={imageUploadTrigger}
                    onUploadComplete={handleImageUploadComplete}
                    onUploadError={handleImageUploadError}
                  />
                ) : <p className="text-muted">ID 발급 중...</p>}
                {imageUploadError && (
                  <p className="text-danger mt-2">{imageUploadError}</p>
                )}
              </Col>
            </Form.Group>
          </Card.Body>
        </Card>

        {/* 버튼 영역 */}
        <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || formData.roomId === null}
            className="order-1 order-sm-0"
          >
            {isSubmitting ? '등록 중...' : '객실 등록'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms`)}
            className="order-0 order-sm-1"
          >
            취소
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AdminRoomRegisterPage;