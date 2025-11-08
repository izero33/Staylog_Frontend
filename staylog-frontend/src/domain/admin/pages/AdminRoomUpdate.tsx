import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
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

    // 폼 데이터 상태
    const [data, setData] = useState<Omit<AdminRoom, 'description'> | null>(null);
    // Quill Editor 내용은 별도 상태로 관리
    const [description, setDescription] = useState<string>('');
    // 롤백용 원본 데이터
    const [originalData, setOriginalData] = useState<AdminRoom | null>(null);

    // ImageManager의 저장 트리거 및 상태
    const [imageUploadTrigger, setImageUploadTrigger] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);

    // 기타 상태
    const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resetTrigger, setResetTrigger] = useState<number>(0);

    // 데이터 로딩 useEffect
    useEffect(() => {
        if (!roomId) return;
        const fetchDetail = async () => {
            setLoading(true);
            try {
                const [detailRes, rmTypeRes] = await Promise.all([
                    api.get<AdminRoom>(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } }),
                ]);

                console.log('API Response:', detailRes); // API 응답 데이터 확인

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

    // 폼 제출 핸들러 (2단계 저장)
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) return;
        setIsSubmitting(true);

        try {
            // 1. 텍스트 정보 수정
            const payload = { ...data, description };
            await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`, payload);
            console.log('객실 기본 정보 수정 성공:', payload);

            // 2. 이미지 저장을 트리거
            setImageUploadTrigger(prev => prev + 1);
        } catch (err) {
            console.error('객실 정보 수정 실패:', err);
            alert('객실 정보 수정에 실패했습니다.');
            setIsSubmitting(false);
        } 
    }, [data, description, accommodationId, roomId]);

    // ImageManager 업로드 완료 콜백
    const handleImageUploadComplete = useCallback(() => {
        setIsSubmitting(false);
        alert('객실 정보가 성공적으로 수정되었습니다!');
        navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`);
    }, [navigate, accommodationId, roomId]);

    // ImageManager 업로드 에러 콜백
    const handleImageUploadError = useCallback((errorMsg: string) => {
        setIsSubmitting(false);
        setImageUploadError(errorMsg);
        alert(`이미지 업로드 중 오류가 발생했습니다: ${errorMsg}`);
    }, []);

    // 초기화 핸들러
    const handleReset = () => {
        // confirm 대화상자를 띄워 사용자 확인을 받습니다.
        if (window.confirm("정말 초기화하시겠습니까?")) {
            if (originalData) {
                const { description, ...restData } = originalData;
                setData(restData);
                setDescription(description || '');
                setResetTrigger(prev => prev + 1);
                alert('입력 내용이 초기화되었습니다.'); // 확인 시에만 알림 표시
            }
        }
    };

    // 로딩 및 에러 처리 UI
    if (loading) return <Container fluid className="p-5 text-center"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></Container>;
    if (error) return <Container fluid className="p-4 text-center"><div className="alert alert-danger">{error}</div></Container>;
    if (!data) return <Container fluid className="p-4 text-center"><div className="alert alert-info">객실 정보를 찾을 수 없습니다.</div></Container>;

    return (
        <Container fluid className="p-4">
            <h3 className="mb-4">{data.name} 수정</h3>
            <form onSubmit={handleSubmit}>
                <table className="table table-bordered">
                    <tbody>
                        {/* 기존 필드들 */}
                        <tr>
                            <th className="bg-light text-center" style={{ width: '20%' }}>객실명</th>
                            <td>
                                <input type="text" className="form-control form-control-sm" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required />
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">유형</th>
                            <td>
                                <select name="rmType" className="form-select form-select-sm" value={data.rmType} onChange={(e) => setData({ ...data, rmType: e.target.value })} required>
                                    {rmTypeCodeList.map(item => <option key={item.codeId} value={item.codeId}>{item.codeName}</option>)}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">가격</th>
                            <td className='d-flex align-items-center'>
                                <input type="number" className="form-control form-control-sm w-25 me-2 text-end pe-0" value={data.price} onChange={(e) => setData({ ...data, price: Number(e.target.value) })} />
                                <span>원</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">최대 인원</th>
                            <td>
                                <table className="table table-sm mb-0" style={{ width: '50%' }}>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '50%' }}>성인</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.maxAdult} onChange={(e) => setData({ ...data, maxAdult: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>어린이</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.maxChildren} onChange={(e) => setData({ ...data, maxChildren: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>유아</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.maxInfant} onChange={(e) => setData({ ...data, maxInfant: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">침대</th>
                            <td>
                                <table className="table table-sm mb-0" style={{ width: '50%' }}>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '50%' }}>싱글</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.singleBed} onChange={(e) => setData({ ...data, singleBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>더블</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.doubleBed} onChange={(e) => setData({ ...data, doubleBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>퀸</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.queenBed} onChange={(e) => setData({ ...data, queenBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>킹</th>
                                            <td className='d-flex align-items-center'>
                                                <input type="number" className="form-control form-control-sm me-2 text-end pe-0" value={data.kingBed} onChange={(e) => setData({ ...data, kingBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">면적</th>
                            <td className='d-flex align-items-center'>
                                <input type="number" className="form-control form-control-sm w-25 me-2 text-end pe-0" value={data.area} onChange={(e) => setData({ ...data, area: Number(e.target.value) })} />
                                <span>m²</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">체크인/체크아웃 시간</th>
                            <td>
                                <div className="d-flex align-items-center">
                                    <input type="time" name="checkIn" className="form-control form-control-sm me-2" value={data.checkIn} onChange={(e) => setData({ ...data, checkIn: e.target.value })} />
                                    <span>~</span>
                                    <input type="time" name="checkOut" className="form-control form-control-sm ms-2" value={data.checkOut} onChange={(e) => setData({ ...data, checkOut: e.target.value })} />
                                </div>
                            </td>
                        </tr>
                        {/* 상세 설명 (QuillEditor) */}
                        <tr>
                            <th className="bg-light text-center align-middle">상세 설명</th>
                            <td>
                                <div className="mt-1 mb-5">
                                    <QuillEditor
                                        key={`quill-${resetTrigger}`}
                                        value={description}
                                        onChange={setDescription}
                                        style={{ height: '700px' }}
                                        targetType="ROOM"
                                        targetId={roomId}
                                    />
                                </div>
                            </td>
                        </tr>
                        {/* 대표/갤러리 이미지 (ImageManager) */}
                        <tr>
                            <th className="bg-light text-center align-middle">대표/갤러리 이미지</th>
                            <td>
                                <ImageManager
                                    key={`image-manager-${resetTrigger}`}
                                    targetType="ROOM"
                                    targetId={roomId}
                                    isEditMode={true} // 수정 모드 활성화
                                    uploadTrigger={imageUploadTrigger}
                                    onUploadComplete={handleImageUploadComplete}
                                    onUploadError={handleImageUploadError}
                                />
                                {imageUploadError && <p className="text-danger mt-2">{imageUploadError}</p>}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="d-flex justify-content-end mt-3">
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? '수정 중...' : '수정 완료'}
                    </button>
                    <button type="button" className="btn btn-danger ms-2" onClick={handleReset}>
                        초기화
                    </button>
                    <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`)}>
                        취소
                    </button>
                </div>
            </form>
        </Container>
    );
};

export default AdminRoomUpdate;