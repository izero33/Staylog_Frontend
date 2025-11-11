import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../global/api';
import axios from 'axios';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import AddressSearch from '../../../global/components/AddressSearch';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';

const AdminAccommodationUpdate: React.FC = () => {
    const { accommodationId: accommodationIdStr } = useParams();
    const accommodationId = Number(accommodationIdStr);
    const navigate = useNavigate();

    const [data, setData] = useState<Omit<AdminAccommodation, 'description'> | null>(null);
    const [description, setDescription] = useState<string>('');
    const [originalData, setOriginalData] = useState<AdminAccommodation | null>(null);
    const [resetTrigger, setResetTrigger] = useState<number>(0);
    const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
    const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!accommodationId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const [detailRes, acTypeRes, regionRes] = await Promise.all([
                    api.get<AdminAccommodation>(`/v1/admin/accommodations/${accommodationId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } }),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
                ]);

                const { description, ...restData } = detailRes;
                setData(restData);
                setDescription(description || '');
                setOriginalData(detailRes);
                setAcTypeCodeList(acTypeRes);
                setRegionCodeList(regionRes);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.status === 404 ? '해당 숙소는 존재하지 않습니다.' : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`);
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [accommodationId]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setIsSubmitting(true);

        try {
            const payload = { ...data, description };
            await api.patch(`/v1/admin/accommodations/${accommodationId}`, payload);
            console.log('숙소 기본 정보 수정 성공:', payload);
            setImageUploadTrigger(prev => prev + 1);
        } catch (err) {
            console.error('숙소 정보 수정 실패:', err);
            alert('숙소 정보 수정에 실패했습니다.');
            setIsSubmitting(false);
        }
    }, [data, description, accommodationId]);

    const handleImageUploadComplete = useCallback(() => {
        setIsSubmitting(false);
        alert('숙소 정보가 성공적으로 수정되었습니다!');
        navigate(`/admin/accommodations/${accommodationId}`);
    }, [navigate, accommodationId]);

    const handleImageUploadError = useCallback((errorMsg: string) => {
        setIsSubmitting(false);
        setImageUploadError(errorMsg);
        alert(`이미지 업로드 중 오류가 발생했습니다: ${errorMsg}`);
    }, []);

    const handleReset = () => {
        if (window.confirm("정말 초기화하시겠습니까?")) {
            if (originalData) {
                const { description, ...restData } = originalData;
                setData(restData);
                setDescription(description || '');
                setResetTrigger(prev => prev + 1);
                alert('입력 내용이 초기화되었습니다.');
            }
        }
    };

    if (loading) {
        return (
            <Container fluid className="p-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-danger">{error}</div>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-info">숙소 정보를 찾을 수 없습니다.</div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-3 p-md-4">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mb-3 mb-md-4">
                <h3 className="mb-2 mb-sm-0 me-2">
                    {data.name} 수정폼
                </h3>
                <Badge 
                    bg={data.deletedYn === 'N' ? 'success' : 'secondary'}
                    className="fs-6"
                >
                    {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                </Badge>
            </div>

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
                                    size="sm"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
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
                                    value={data.acType}
                                    onChange={(e) => setData({ ...data, acType: e.target.value })}
                                    required
                                >
                                    {acTypeCodeList.map(item => (
                                        <option key={item.codeId} value={item.codeId}>
                                            {item.codeName}
                                        </option>
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
                                    value={data.regionCode}
                                    onChange={(e) => setData({ ...data, regionCode: e.target.value })}
                                    required
                                >
                                    {regionCodeList.map(item => (
                                        <option key={item.codeId} value={item.codeId}>
                                            {item.codeName}
                                        </option>
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
                                        value={data.address}
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
                                        setData({ ...data, address, latitude: coords.lat, longitude: coords.lng });
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
                                            value={data.checkInTime}
                                            onChange={(e) => setData({ ...data, checkInTime: e.target.value })}
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
                                            value={data.checkOutTime}
                                            onChange={(e) => setData({ ...data, checkOutTime: e.target.value })}
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
                                <div className="mt-2 mb-5">
                                    <QuillEditor
                                        key={`quill-${resetTrigger}`}
                                        value={description}
                                        onChange={setDescription}
                                        style={{ height: '400px' }}
                                        targetType="ACCOMMODATION"
                                        targetId={accommodationId}
                                    />
                                </div>
                            </Col>
                        </Form.Group>

                        {/* 대표/갤러리 이미지 */}
                        <Form.Group as={Row} className="mb-3 mt-5 mt-md-4 pt-md-4 mt-lg-0 pt-lg-0">
                            <Form.Label column xs={12} md={3} lg={2} className="fw-bold mb-2">
                                대표/갤러리 이미지
                            </Form.Label>
                            <Col xs={12} md={9} lg={10}>
                                <ImageManager
                                    key={`image-manager-${resetTrigger}`}
                                    targetType="ACCOMMODATION"
                                    targetId={accommodationId}
                                    isEditMode={true}
                                    uploadTrigger={imageUploadTrigger}
                                    onUploadComplete={handleImageUploadComplete}
                                    onUploadError={handleImageUploadError}
                                />
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
                        disabled={isSubmitting}
                        className="order-2 order-sm-0"
                    >
                        {isSubmitting ? '수정 중...' : '수정 완료'}
                    </Button>
                    <Button 
                        type="button" 
                        variant="danger"
                        onClick={handleReset}
                        className="order-1 order-sm-1"
                    >
                        초기화
                    </Button>
                    <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => navigate(`/admin/accommodations/${accommodationId}`)}
                        className="order-0 order-sm-2"
                    >
                        취소
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AdminAccommodationUpdate;