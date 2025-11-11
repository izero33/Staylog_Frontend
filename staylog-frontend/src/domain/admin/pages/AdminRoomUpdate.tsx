import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Card, Table } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../global/api';
import axios from 'axios';
import ImageManager from '../../../global/components/ImageManager';
import QuillEditor from '../../../global/components/QuillEditor';
import type { AdminRoom } from '../types/AdminRoomTypes';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';

const AdminRoomUpdate: React.FC = () => {
    const { accommodationId: accommodationIdStr, roomId: roomIdStr } = useParams();
    const accommodationId = Number(accommodationIdStr);
    const roomId = Number(roomIdStr);
    const navigate = useNavigate();

    const [data, setData] = useState<Omit<AdminRoom, 'description'> | null>(null);
    const [description, setDescription] = useState<string>('');
    const [originalData, setOriginalData] = useState<AdminRoom | null>(null);
    const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);
    const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resetTrigger, setResetTrigger] = useState<number>(0);

    useEffect(() => {
        if (!roomId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const [detailRes, rmTypeRes] = await Promise.all([
                    api.get<AdminRoom>(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } }),
                ]);

                console.log('API Response:', detailRes);

                const { description, ...restData } = detailRes;
                setData(restData);
                setDescription(description || '');
                setOriginalData(detailRes);
                setRmTypeCodeList(rmTypeRes);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.status === 404 ? '해당 객실은 존재하지 않습니다.' : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`);
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [accommodationId, roomId]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setIsSubmitting(true);

        try {
            const payload = { ...data, description };
            await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`, payload);
            console.log('객실 기본 정보 수정 성공:', payload);
            setImageUploadTrigger(prev => prev + 1);
        } catch (err) {
            console.error('객실 정보 수정 실패:', err);
            alert('객실 정보 수정에 실패했습니다.');
            setIsSubmitting(false);
        }
    }, [data, description, accommodationId, roomId]);

    const handleImageUploadComplete = useCallback(() => {
        setIsSubmitting(false);
        alert('객실 정보가 성공적으로 수정되었습니다!');
        navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`);
    }, [navigate, accommodationId, roomId]);

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
                <div className="alert alert-info">객실 정보를 찾을 수 없습니다.</div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-3 p-md-4">
            <h3 className="mb-3 mb-md-4">{data.name} 수정</h3>

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
                                    name="rmType"
                                    size="sm"
                                    value={data.rmType}
                                    onChange={(e) => setData({ ...data, rmType: e.target.value })}
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
                                가격
                            </Form.Label>
                            <Col xs={12} md={9} lg={10}>
                                <div className="d-flex align-items-center">
                                    <Form.Control
                                        type="text"
                                        name='price'
                                        size="sm"
                                        className="text-end"
                                        style={{ maxWidth: '200px' }}
                                        value={data.price}
                                        onChange={(e) => setData({ ...data, price: Number(e.target.value) || 0 })}
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
                                                    value={data.maxAdult}
                                                    onChange={(e) => setData({ ...data, maxAdult: Number(e.target.value) || 0 })}
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
                                                    value={data.maxChildren}
                                                    onChange={(e) => setData({ ...data, maxChildren: Number(e.target.value) || 0 })}
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
                                                    value={data.maxInfant}
                                                    onChange={(e) => setData({ ...data, maxInfant: Number(e.target.value) || 0 })}
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
                                                    name='singleBed'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.singleBed}
                                                    onChange={(e) => setData({ ...data, singleBed: Number(e.target.value) || 0 })}
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className='d-flex justify-content-between'>
                                            <Form.Label className='fw-bold'>더블</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='doubleBed'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.doubleBed}
                                                    onChange={(e) => setData({ ...data, doubleBed: Number(e.target.value) || 0 })}
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>퀸</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='queenBed'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.queenBed}
                                                    onChange={(e) => setData({ ...data, queenBed: Number(e.target.value) || 0 })}
                                                />
                                                <span className="ms-2">개</span>
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="d-flex justify-content-between">
                                            <Form.Label className='fw-bold'>킹</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="text"
                                                    name='kingBed'
                                                    size="sm"
                                                    className="text-end"
                                                    value={data.kingBed}
                                                    onChange={(e) => setData({ ...data, kingBed: Number(e.target.value) || 0 })}
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
                                        size="sm"
                                        className="text-end"
                                        style={{ maxWidth: '200px' }}
                                        value={data.area}
                                        onChange={(e) => setData({ ...data, area: Number(e.target.value) || 0 })}
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
                                <div className="mt-2 mb-5">
                                    <QuillEditor
                                        key={`quill-${resetTrigger}`}
                                        value={description}
                                        onChange={setDescription}
                                        style={{ height: '400px' }}
                                        targetType="ROOM"
                                        targetId={roomId}
                                    />
                                </div>
                            </Col>
                        </Form.Group>

                        {/* 대표/갤러리 이미지 */}
                        <Form.Group as={Row} className="mb-3 mt-5 mt-md-4 pt-md-4 mt-lg-0 pt-lg-0">
                            <Form.Label column xs={12} md={3} lg={2} className="fw-bold">
                                대표/갤러리 이미지
                            </Form.Label>
                            <Col xs={12} md={9} lg={10}>
                                <ImageManager
                                    key={`image-manager-${resetTrigger}`}
                                    targetType="ROOM"
                                    targetId={roomId}
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
                        onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`)}
                        className="order-0 order-sm-2"
                    >
                        취소
                    </Button>
                </div>
            </Form>
        </Container>
    );
};

export default AdminRoomUpdate;