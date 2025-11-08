
import { Carousel, Container, Image } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import type { AdminRoom } from '../types/AdminRoomTypes';
import type { CommonCodeNameList } from '../types/CommonCodeNameList';

/*
    Carousel : 객실 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminRoomUpdate() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // 숙소, 객실 번호  /admin/accommodations/:accommodationId/rooms/:roomId  에서 accommodationId, roomId 경로 변수 얻어내기
    const { accommodationId: accommodationIdStr, roomId: roomIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);
    const roomId = Number(roomIdStr);

    // 객실 상세 데이터
    const [data, setData] = useState<AdminRoom | null>(null);

    //롤백용 객실 데이터
    const [originalData, setOriginalData] = useState<AdminRoom | null>(null);
    //공통 코드 상태 정의
    const [rmTypeCodeList, setRmTypeCodeList] = useState<CommonCodeNameList[]>([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);
    // 페이지 이동
    const navigate = useNavigate();

    // 객실 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 객실 번호가 없다면
        if (!roomId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`);
                const [detailRes, rmTypeRes] = await Promise.all([
                    api.get<AdminRoom>(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`),
                    api.get<CommonCodeNameList[]>("/v1/commonCode", { params: { codeId: 'ROOM_TYPE' } }),
                ]);
                // 데이터 상태 업데이트
                setData(detailRes);
                setOriginalData(detailRes);
                setRmTypeCodeList(rmTypeRes);
                // 확인용
                console.log(res);
            } catch (err) {
                // axios 에러 처리
                if (axios.isAxiosError(err)) {
                    setError(
                        err.response?.status === 404
                            ? '해당 객실은 존재하지 않습니다.'
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
    }, [accommodationId, roomId]);

    // 숙소 ID 유효성 검사
    if (!accommodationId || isNaN(accommodationId)) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    올바른 숙소 ID가 없습니다
                </div>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/accommodations')}>
                    숙소 목록으로 돌아가기
                </button>
            </Container>
        );
    }

    // 객실 ID 가 없다면
    if (!roomId || isNaN(roomId)) {
        return (
            <Container fluid className="p-4 text-center">
                <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    올바른 객실 ID가 없습니다
                </div>
                <button className="btn btn-secondary" onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms`)}>
                    객실 목록으로 돌아가기
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
                <p className="mt-3 text-muted">객실 정보를 불러오는 중입니다...</p>
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
                <button className="btn btn-primary" onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms`)}>
                    객실 목록으로 돌아가기
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
                    객실 정보를 찾을 수 없습니다
                </div>
                <button className="btn btn-primary" onClick={() => navigate(`/admin/accommodations/${accommodationId}/rooms`)}>
                    객실 목록으로 돌아가기
                </button>
            </Container>
        );
    }

    //폼 제출 버튼을 눌렀을때 실행할 함수
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //현재 data 를 콘솔에 출력하기
        console.log(data);
        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`, data);
            alert("객실 정보를 수정했습니다");

            // 수정된 데이터를 originalData도 업데이트 (초기화 기준점 갱신)
            setOriginalData(data);
            //객실 자세히 보기로 이동
            navigate(`/admin/accommodations/${accommodationId}/rooms/${roomId}`);
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
                alert(`객실 정보 수정에 실패했습니다.\n\n${errorMessage}`);
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

            <form onSubmit={handleSubmit} action="/v1/board">
                <table className="table table-bordered mt-2" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <tbody>
                        {/* 세로 헤더 (왼쪽이 헤더) */}
                        <tr>
                            <th className="bg-light text-center align-middle" style={{ width: '25%' }}>객실명</th>
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
                            <th className="bg-light text-center align-middle">유형</th>
                            <td>
                                <select
                                    name="rmType"
                                    className="form-select form-select-sm"
                                    value={data.rmType}
                                    onChange={(e) => {
                                        const changeValue = e.target.value != 'ROOM_TYPE' ? e.target.value : originalData?.rmType!;
                                        setData({ ...data, rmType: changeValue });
                                    }}
                                    required
                                >
                                    {rmTypeCodeList.length === 0 ? (
                                        <option value="">로딩 중...</option>
                                    ) : (
                                        rmTypeCodeList.map(item => (
                                            <option key={item.codeId} value={item.codeId}>
                                                {item.codeName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle">가격</th>
                            <td className='d-flex align-items-center'>
                                <input
                                    type="number"
                                    className="form-control form-control-sm w-25 me-2 text-end pe-0"
                                    value={data.price}
                                    onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                                />
                                <span>원</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle" style={{ width: '30%' }}>최대 인원</th>
                            <td>
                                <table className="table table-sm mb-0" style={{ width: '50%' }}>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '50%' }}>성인</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.maxAdult}
                                                    onChange={(e) => setData({ ...data, maxAdult: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>어린이</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.maxChildren}
                                                    onChange={(e) => setData({ ...data, maxChildren: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>

                                        <tr>
                                            <th>유아</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.maxInfant}
                                                    onChange={(e) => setData({ ...data, maxInfant: Number(e.target.value) })} />
                                                <span>명</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle">침대</th>
                            <td>
                                <table className="table table-sm mb-0" style={{ width: '50%' }}>
                                    <tbody>
                                        <tr>
                                            <th style={{ width: '50%' }}>싱글</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.singleBed}
                                                    onChange={(e) => setData({ ...data, singleBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>더블</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.doubleBed}
                                                    onChange={(e) => setData({ ...data, doubleBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>퀸</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.queenBed}
                                                    onChange={(e) => setData({ ...data, queenBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>킹</th>
                                            <td className='d-flex align-items-center'>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm me-2 text-end pe-0"
                                                    value={data.kingBed}
                                                    onChange={(e) => setData({ ...data, kingBed: Number(e.target.value) })} />
                                                <span>개</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle">면적</th>
                            <td className='d-flex align-items-center'>
                                <input
                                    type="number"
                                    className="form-control form-control-sm w-25 me-2 text-end pe-0"
                                    value={data.area}
                                    onChange={(e) => setData({ ...data, area: Number(e.target.value) })} />
                                <span>m²</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle">체크인</th>
                            <td>
                                <input
                                    type="time"
                                    className="form-control form-control-sm me-2 w-50 pe-0"
                                    value={data?.checkIn}
                                    onChange={(e) => setData({ ...data, checkIn: e.target.value })}
                                />
                                <small className="text-muted d-block mt-1">
                                    저장된 값: {data?.checkIn || '미설정'}
                                </small>
                            </td>
                        </tr>
                        <tr>
                            <th className="bg-light text-center align-middle">체크아웃</th>
                            <td>
                                <input
                                    type="time"
                                    className="form-control form-control-sm me-2 w-50 pe-0"
                                    value={data?.checkOut}
                                    onChange={(e) => setData({ ...data, checkOut: e.target.value })}
                                />
                                <small className="text-muted d-block mt-1">
                                    저장된 값: {data?.checkOut || '미설정'}
                                </small>
                            </td>
                        </tr>

                        {/* 구분선 */}
                        <tr>
                            <td colSpan={2}></td>
                        </tr>

                        {/* 가로 헤더 (위쪽이 헤더) */}
                        <tr>
                            <th colSpan={2} className="bg-light text-center align-middle">이미지</th>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div className="accommodationImages images-slider">
                                    <Carousel>
                                        <Carousel.Item>
                                            {/* 이미지 비율에 맞게 나오게 함*/}
                                            <Image src={img1} alt="객실 이미지 1" className="d-block w-100" style={{ objectFit: "contain" }} />
                                        </Carousel.Item>
                                        <Carousel.Item>
                                            <Image src={img2} alt="객실 이미지 2" className="d-block w-100" style={{ objectFit: "contain" }} />
                                        </Carousel.Item>
                                    </Carousel>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <th colSpan={2} className="bg-light text-center align-middle">설명</th>
                        </tr>
                        <tr>
                            <td colSpan={2} dangerouslySetInnerHTML={{ __html: data.description }} />
                        </tr>
                    </tbody>
                </table>
                <button className="btn btn-primary btn-sm me-1" type="submit">저장</button>
                <button className="btn btn-danger btn-sm" type='reset' onClick={handleReset}>초기화</button>
            </form>
        </Container>
    </>
}

export default AdminRoomUpdate;