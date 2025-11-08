
import { Container, Carousel, Image } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import { formatKST } from '../../../global/utils/date';

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

    // 숙소의 번호  /admin/accommodations/:accommodationId  에서 accommodationId 경로 변수 얻어내기 
    const { accommodationId: accommodationIdStr } = useParams();
    // 경로 변수를 숫자로 변환
    const accommodationId = Number(accommodationIdStr);

    // 숙소 상세 데이터
    const [data, setData] = useState<AdminAccommodation | null>(null);
    // 로딩 상태
    const [loading, setLoading] = useState(true);
    // 에러 메세지
    const [error, setError] = useState<string | null>(null);
    // 페이지 이동
    const navigate = useNavigate();
    const location = useLocation();

    // 숙소 상세데이터를 가져오는 API 호출
    useEffect(() => {
        // 숙소 번호가 없다면
        if (!accommodationId) return;
        const fetchDetail = async () => {
            // 로딩 시작
            setLoading(true);

            try {
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}`);
                // 데이터 상태 업데이트
                setData(res);
                // 확인용
                console.log(res);
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
    }, [accommodationId, data?.deletedYn]);

    // 숙소 ID 가 없다면
    if (!accommodationId) {
        return <div>숙소 ID가 없습니다</div>;
    }

    // 페이지 로딩 중 표시
    if (loading) {
        return <div style={{ padding: "40px", textAlign: "center" }}> 숙소 정보 불러오는 중</div>;
    }

    // 에러 발생 표시
    if (error) {
        return <div style={{ padding: "40px", color: "#f00", textAlign: "center" }}> 데이터 불러오기 실패 {error}</div>;
    }

    // 데이터가 없다면 표시
    if (!data) {
        return <div style={{ padding: "40px", textAlign: "center" }}>숙소 정보를 찾을 수 없습니다</div>;
    }

    //숙소 수정 페이지 이동 핸들러
    const handleGoToUpdate = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/update`);
    };

    //객실 목록 페이지 이동 핸들러
    const handleGoToRooms = (accommodationId: number) => {
        navigate(`/admin/accommodations/${accommodationId}/rooms`);
    };

    // 숙소 목록 페이지 이동 핸들러
    const handleGoToList = () => {
        if (location.state?.from) {
            // 저장된 검색 상태와 함께 목록으로 돌아가기
            navigate(location.state.from, {
                state: {
                    searchParams: location.state.searchParams,
                    inputKeyword: location.state.inputKeyword
                }
            });
        } else {
            // state가 없으면 그냥 뒤로가기
            navigate(-1);
        }
    };

    // 상태 업데이트 API 호출 함수 (컴포넌트 외부에 정의하여 재사용)
    const updateAccommodationStatus = async (accommodationId: number, status: 'Y' | 'N') => {
        try {
            await api.patch(`/v1/admin/accommodations/${accommodationId}/status`, {
                deletedYn: status
            });
            setData(data => ({ ...data!, deletedYn: status })); // 상태 업데이트
            return true;
        } catch (err) {
            console.error(`숙소 ID ${accommodationId} 상태 업데이트 실패:`, err);
            return false;
        }
    };

    // 전체 화면 너비 사용 : Container fluid
    return <>
        <Container fluid className="p-0">
            <h3 className="justify-content-between d-flex align-items-end">
                <div>
                    {data.name}
                    <span className={`ms-2 badge ${data.deletedYn === 'N' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.8rem' }}>
                        {data.deletedYn === 'N' ? '활성화' : '비활성화'}
                    </span>
                </div>
                {data.avgRating ? (
                    <div style={{ fontSize: '1rem' }}>
                        <i title='평균별점' className="bi bi-star-fill text-warning me-1"></i> {data.avgRating}&nbsp;
                        (<i title='리뷰' className="bi bi-person"></i> {data.reviewCount}개)
                    </div>
                ) : (
                    <span style={{ fontSize: '1rem' }}>등록된 리뷰가 없습니다.</span>
                )}
            </h3>

            <div className="text-muted mt-3">
                <span className='me-2'>등록일 : {formatKST(data.createdAt)}</span>
                <span>수정일 : {formatKST(data.updatedAt)}</span>
            </div>

            <div className="justify-content-between d-flex mt-5">
                <div>
                    <button
                        className="btn btn-sm btn-outline-secondary me-1"
                        title="목록으로 돌아가기"
                        onClick={handleGoToList} // 이동 함수 연결
                    >
                        <i className="bi bi-arrow-left"></i> 뒤로가기
                    </button>
                </div>

                <div className="d-flex gap-1">
                    <button title="수정하기" className="btn btn-sm btn-primary" onClick={() => handleGoToUpdate(data.accommodationId!)}>수정하기</button>
                    {data.deletedYn === 'N' ? (
                        <button title="비활성화하기" className="btn btn-sm btn-danger text-white" onClick={() => updateAccommodationStatus(data.accommodationId!, 'Y')}>비활성화하기</button>
                    ) : (
                        <button title="활성화하기" className="btn btn-sm btn-success" onClick={() => updateAccommodationStatus(data.accommodationId!, 'N')}>활성화하기</button>
                    )}
                    <button
                        className="btn btn-sm btn-outline-primary"
                        title="객실 목록 보기"
                        onClick={() => handleGoToRooms(data.accommodationId!)} // 이동 함수 연결
                    >
                        객실 목록 <i className="bi bi-list"></i>
                    </button>
                </div>
            </div>
            
            <table className="table table-bordered mt-2" style={{ tableLayout: 'fixed', width: '100%' }}>
                <tbody>
                    {/* 세로 헤더 (왼쪽이 헤더) */}
                    <tr>
                        <th className="bg-light text-center" style={{ width: '25%' }}>유형</th>
                        <td>{data.typeName}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">지역</th>
                        <td>{data.regionName}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">주소</th>
                        <td>{data.address}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">체크인</th>
                        <td>{data.checkInTime}</td>
                    </tr>
                    <tr>
                        <th className="bg-light text-center">체크아웃</th>
                        <td>{data.checkOutTime}</td>
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
                                        <Image src={img1} alt="숙소 이미지 1" className="d-block w-100" style={{objectFit: "contain" }} />
                                    </Carousel.Item>
                                    <Carousel.Item>
                                        <Image src={img2} alt="숙소 이미지 2" className="d-block w-100" style={{objectFit: "contain" }} />
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
        </Container>
    </>
}

export default AdminAccommodationDetail;