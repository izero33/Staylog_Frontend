
import { Carousel, Container, Image } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import AddressSearch from '../../../global/components/AddressSearch';
/*
    Carousel : 숙소 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminAccommodationUpdate() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // 숙소의 번호  /admin/accommodations/:accommodationId  에서 accommodationId 경로 변수 얻어내기 
    const { accommodationId: accommodationIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);

    //주소 검색 모달 상태
    const [showAddressModal, setShowAddressModal] = useState(false);

    // 숙소 상세 데이터
    const [data, setData] = useState<AdminAccommodation | null>(null);

    //롤백용 숙소 데이터
    const [originalData, setOriginalData] = useState<AdminAccommodation | null>(null);

    //공통 코드 상태 정의
    const [acTypeCodeList, setAcTypeCodeList] = useState<CommonCodeNameList[]>([]);
    const [regionCodeList, setRegionCodeList] = useState<CommonCodeNameList[]>([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);
    // 페이지 이동
    const navigate = useNavigate();

    // 숙소 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소 번호가 없다면
        if (!accommodationId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                // 병렬로 데이터 로드
                const [detailRes, acTypeRes, regionRes] = await Promise.all([
                    api.get<AdminAccommodation>(`/v1/admin/accommodations/${accommodationId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ACCOMMODATION_TYPE' } }),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'REGION_TYPE' } })
                ]);
                // 데이터 상태 업데이트

                setData(detailRes);
                setOriginalData(detailRes);
                setAcTypeCodeList(acTypeRes);
                setRegionCodeList(regionRes);

                console.log('숙소 상세 데이터:', detailRes);
            } catch (err) {
                // axios 에러 처리
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.status === 404
                            ? '해당 숙소는 존재하지 않습니다.'
                            : `API 호출 실패: ${err.response?.status || '네트워크 오류'}`
                    );
                } else {
                    setError('알 수 없는 오류 발생');
                }
            } finally {
                // 로딩 종료
                setLoading(false);
            }
        };
        fetchDetail();
    }, [accommodationId]);

    // 숙소 ID 유효성 검사
    if (!accommodationId || isNaN(accommodationId)) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    올바른 숙소 ID가 없습니다
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/accommodations')}>
                    숙소 목록으로 돌아가기
                </button>
            </Container>
        );
    }

    // 로딩 중
    if (loading) {
        return (
            <Container fluid className="p-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">숙소 정보를 불러오는 중입니다...</p>
            </Container>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/accommodations')}>
                    숙소 목록으로 돌아가기
                </button>
            </Container>
        );
    }

    // 데이터 없음
    if (!data) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    숙소 정보를 찾을 수 없습니다
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/accommodations')}>
                    숙소 목록으로 돌아가기
                </button>
            </Container>
        );
    }

    //폼 제출 버튼을 눌렀을때 실행할 함수
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data) return;

        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}`, data);
            alert("숙소 정보를 수정했습니다");

            // 수정된 데이터를 originalData도 업데이트 (초기화 기준점 갱신)
            setOriginalData(data);
            //숙소 상세 페이지로 이동
            navigate(`/admin/accommodations/${accommodationId}`);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error('에러 상세:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message
                });

                const errorMessage = err.response?.data?.message ||
                    err.response?.data?.error ||
                    '알 수 없는 오류가 발생했습니다.';
                alert(`숙소 정보 수정에 실패했습니다.\n\n${errorMessage}`);
            }
        }
    };

    const handleReset = () => {
        if (originalData) {
            setData(originalData);
        }
    };

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            <h3 className="mb-0">
                {data.name}
                <span
                    className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`}
                    style={{ fontSize: '0.8rem' }}
                >
                    {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                </span>
            </h3>
            <div className="mt-5 justify-content-end d-flex">
                <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => navigate(`/admin/accommodations/${accommodationId}`)}
                >
                    <i className="bi bi-arrow-left"></i> 뒤로가기
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <table className="table table-bordered mt-2" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <tbody>
                        {/* 세로 헤더 (왼쪽이 헤더) */}
                        <tr>
                            <th className="bg-light text-center" style={{ width: '25%' }}>숙소명</th>
                            <td>
                                <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    value={data.name}
                                    onChange={(e) => setData({ ...data, name: e.target.value })}
                                    required
                                />
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">유형</th>
                            <td>
                                <select
                                    name="acType"
                                    className="form-select form-select-sm"
                                    value={data.acType}
                                    onChange={(e) => {
                                        const changeValue = e.target.value != 'ACCOMMODATION_TYPE' ? e.target.value : originalData?.acType!;
                                        setData({ ...data, acType: changeValue });
                                    }}
                                    required
                                >
                                    {acTypeCodeList.length === 0 ? (
                                        <option value="">로딩 중...</option>
                                    ) : (
                                        acTypeCodeList.map(item => (
                                            <option key={item.codeId} value={item.codeId}>
                                                {item.codeName}
                                            </option>
                                        ))
                                    )}
                                </select>

                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">지역</th>
                            <td>
                                <select
                                    name="regionCode"
                                    className="form-select form-select-sm"
                                    value={data.regionCode}
                                    onChange={(e) => {
                                        const changeValue = e.target.value != 'REGION_TYPE' ? e.target.value : originalData?.regionCode!;
                                        setData({ ...data, regionCode: changeValue });
                                    }}
                                    required
                                >
                                    {regionCodeList.length === 0 ? (
                                        <option value="">로딩 중...</option>
                                    ) : (
                                        regionCodeList.map(item => (
                                            <option key={item.codeId} value={item.codeId}>
                                                {item.codeName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">주소</th>
                            <td>
                                <div className='input-group input-group-sm align-items-start'>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        value={data.address}
                                        onChange={(e) => setData({ ...data, address: e.target.value })}
                                        placeholder="기본 주소를 검색하세요"
                                        readOnly
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        style={{ border: '1px solid #ced4da' }}
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        주소검색
                                    </button>
                                </div>
                                <small className='d-block mt-1 text-secondary text-opacity-50' style={{ fontSize: '10px' }}>
                                    좌표: Lat {data.latitude?.toFixed(6) ?? 'N/A'}, Lng {data.longitude?.toFixed(6) ?? 'N/A'}
                                </small>
                                {/* 모달 표시 */}
                                <AddressSearch
                                    show={showAddressModal}
                                    onClose={() => setShowAddressModal(false)}
                                    onAddressSelect={(address, coords) => {
                                        setData({ ...data, address, latitude: coords.lat, longitude: coords.lng });
                                        setShowAddressModal(false);
                                    }}
                                />
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">체크인</th>
                            <td>
                                <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    value={data?.checkInTime}
                                    onChange={(e) => setData({ ...data, checkInTime: e.target.value })}
                                />
                                <small className="text-muted d-block mt-1">
                                    저장된 값: {data?.checkInTime || '미설정'}
                                </small>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center">체크아웃</th>
                            <td>
                                <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    value={data?.checkOutTime}
                                    onChange={(e) => setData({ ...data, checkOutTime: e.target.value })}
                                />
                                <small className="text-muted d-block mt-1">
                                    저장된 값: {data?.checkOutTime || '미설정'}
                                </small>
                            </td>
                        </tr>
                        {/* 구분선 */}
                        <tr>
                            <td colSpan={2}></td>
                        </tr>

                        {/* 가로 헤더 (위쪽이 헤더) */}
                        <tr>
                            <th colSpan={2} className="bg-light text-center">이미지</th>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div className="accommodationImages images-slider">
                                    <Carousel>
                                        <Carousel.Item>
                                            {/* 이미지 비율에 맞게 나오게 함*/}
                                            <Image src={img1} alt="숙소 이미지 1" className="d-block w-100" style={{ objectFit: "contain" }} />
                                        </Carousel.Item>
                                        <Carousel.Item>
                                            <Image src={img2} alt="숙소 이미지 2" className="d-block w-100" style={{ objectFit: "contain" }} />
                                        </Carousel.Item>
                                    </Carousel>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th colSpan={2} className="bg-light text-center">설명</th>
                        </tr>
                        <tr>
                            <td colSpan={2} dangerouslySetInnerHTML={{ __html: data.description }} />
                        </tr>
                    </tbody>
                </table>
                <button className="btn btn-primary btn-sm me-1" type="submit">저장</button>
                <button className="btn btn-danger btn-sm" type='button' onClick={handleReset}>초기화</button>
            </form>
        </Container>
    </>
}

export default AdminAccommodationUpdate;