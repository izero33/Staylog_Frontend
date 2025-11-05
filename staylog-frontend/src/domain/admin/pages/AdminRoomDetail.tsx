
import { Container, Carousel, Image } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import { formatKST } from '../../../global/utils/date';
import type { AdminRoom } from '../types/AdminRoomTypes';

/*
    Carousel : 숙소 대표 이미지
    Accordion : 클릭 시 펼쳐지는 기능
*/

function AdminAccommodationDetail() {
    // 예비용 이미지
    const img1 = "https://picsum.photos/1400/500";
    const img2 = "https://picsum.photos/1400/500?grayscale";
    const img3 = "https://picsum.photos/200/300/?blur";
    const img4 = "https://picsum.photos/id/237/200/300";

    // 숙소, 객실의 번호  /admin/accommodations/:accommodationId/rooms/:roomId  에서 accommodationId, roomId 경로 변수 얻어내기
    const { accommodationId: accommodationIdStr, roomId: roomIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);
    const roomId = Number(roomIdStr);

    // 객실 상세 데이터
    const [data, setData] = useState<AdminRoom | null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);
    // 페이지 이동
    const navigate = useNavigate();

    // 객실 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소, 객실 번호가 없다면
        if (!accommodationId || !roomId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}`);
                // 데이터 상태 업데이트
                setData(res);
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
    }, [accommodationId, roomId, data?.deletedYn]);

    // 객실 ID 가 없다면
    if (!roomId) {
        return <div>객실 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}> 객실 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if (error) {
        return <div style={{ padding: "40px", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if (!data) {
        return <div style={{ padding: "40px", textAlign: "center" }}>객실 정보를 찾을 수 없습니다</div>;
    }

    //숙소 상세 페이지 이동 핸들러
    const handleGoToAccommDetail = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}`);
    };

    // 상태 업데이트 API 호출 함수
    const updateRoomStatus = async (roomId: number, status: 'Y' | 'N') => {
        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}/rooms/${roomId}/status`, {
                deletedYn: status
            });
            setData(data => ({ ...data!, deletedYn: status })); // 상태 업데이트
            return true;
        } catch (err) {
            console.error(`객실 ID ${roomId} 상태 업데이트 실패:`, err);
            return false;
        }
    };

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            <h3>{data.name}
                <span className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                    {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                </span>
            </h3>
            <div className="text-end text-muted">
                <span className='me-2'>등록일 : {formatKST(data.createdAt)}</span>
                <span>수정일 : {formatKST(data.updatedAt)}</span>
            </div>

            <div className="mt-3 justify-content-end d-flex gap-2">
                <button title="수정하기" className="btn btn-sm btn-primary mb-3" onClick={() => navigate(-1)}>수정하기</button>
                {data.deletedYn === 'N' ? (
                    <button title="비활성화하기" className="btn btn-sm btn-danger text-white mb-3" onClick={() => updateRoomStatus(data.roomId!, 'Y')}>비활성화하기</button>
                ) : (
                    <button title="활성화하기" className="btn btn-sm btn-success mb-3" onClick={() => updateRoomStatus(data.roomId!, 'N')}>활성화하기</button>
                )}
                <button
                    className="btn btn-sm btn-outline-primary mb-3"
                    title="숙소 상세 보기"
                    onClick={() => handleGoToAccommDetail(data.accommodationId!)} // 이동 함수 연결
                >숙소 상세
                    <i className="bi bi-arrow-left ms-1"></i> </button>
            </div>

            <table className="table table-bordered mt-5">
                <tbody>
                    <tr>
                        <th className="bg-light">유형</th>
                        <td>{data.typeName}</td>
                    </tr>
                    <tr>
                        <th className="bg-light">가격</th>
                        <td>{data.price}</td>
                    </tr>
                    <tr>
                        <th className="bg-light" style={{ width: '30%' }}>최대 인원</th>
                        <td>
                            <table className="table table-sm mb-0">
                                <tbody>
                                    {data.maxAdult !== 0 && (
                                        <tr>
                                            <th style={{ width: '33%' }}>성인</th>
                                            <td>{data.maxAdult}명</td>
                                        </tr>
                                    )}
                                    {data.maxChildren !== 0 && (
                                        <tr>
                                            <th>어린이</th>
                                            <td>{data.maxChildren}명</td>
                                        </tr>
                                    )}
                                    {data.maxInfant !== 0 && (
                                        <tr>
                                            <th>유아</th>
                                            <td>{data.maxInfant}명</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <th className="bg-light">침대</th>
                        <td>
                            <table className="table table-sm mb-0">
                                <tbody>
                                    {data.singleBed !== 0 && (
                                        <tr>
                                            <th style={{ width: '33%' }}>싱글</th>
                                            <td>{data.singleBed}개</td>
                                        </tr>
                                    )}
                                    {data.doubleBed !== 0 && (
                                        <tr>
                                            <th>더블</th>
                                            <td>{data.doubleBed}개</td>
                                        </tr>
                                    )}
                                    {data.queenBed !== 0 && (
                                        <tr>
                                            <th>퀸</th>
                                            <td>{data.queenBed}개</td>
                                        </tr>
                                    )}

                                    {data.kingBed !== 0 && (
                                        <tr>
                                            <th>킹</th>
                                            <td>{data.kingBed}개</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <th className="bg-light">면적</th>
                        <td>{data.area} m²</td>
                    </tr>
                    {data.checkInTime && (
                        <tr>
                            <th className="bg-light">체크인</th>
                            <td>{data.checkInTime}</td>
                        </tr>
                    )}
                    {data.checkOutTime && (
                        <tr>
                            <th className="bg-light">체크아웃</th>
                            <td>{data.checkOutTime}</td>
                        </tr>
                    )}
                    <tr>
                        <th className="bg-light">이미지</th>
                        <td>
                            <div className="accommodationImages images-slider">
                                <Carousel>
                                    <Carousel.Item>
                                        {/* 이미지 비율에 맞게 나오게 함*/}
                                        <Image src={img1} alt="객실 이미지 1" className="d-block w-100" style={{ height: "300px", objectFit: "contain" }} />
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <Image src={img2} alt="객실 이미지 2" className="d-block w-100" style={{ height: "300px", objectFit: "contain" }} />
                                    </Carousel.Item>
                                </Carousel>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <th className="bg-light">설명</th>
                        <td>{data.description}</td>
                    </tr>
                </tbody>
            </table>
        </Container >
    </>
}

export default AdminAccommodationDetail;