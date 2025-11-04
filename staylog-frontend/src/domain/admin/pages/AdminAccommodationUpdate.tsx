
import { Container, Carousel, Image } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../../global/api';
import axios from 'axios';
import type { AdminAccommodation } from '../types/AdminAccommodationTypes';
import '../css/AdminAccommodationDetail.css';
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

    //롤백용 숙소 데이터
    const [originalData, setOriginalData] = useState<AdminAccommodation | null>(null);

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
                const res = await api.get(`/v1/admin/accommodations/${accommodationId}`);
                // 데이터 상태 업데이트
                setData(res);
                setOriginalData(res);
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
    }, [accommodationId]);

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
        return <div style={{ padding: "40px", textAlign: "center" }}>t숙소 정보를 찾을 수 없습니다</div>;
    }

    //폼 제출 버튼을 눌렀을때 실행할 함수
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //현재 data 를 콘솔에 출력하기
        console.log(data);
        try {
            const res = await api.patch(`/v1/admin/accommodations/${accommodationId}`, data);
            alert("글을 수정했습니다");
            //글 자세히 보기로 이동
            navigate(`/admin/accommodations/${accommodationId}`);
        } catch (err) {
            console.log(err);
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

            <form onSubmit={handleSubmit} action="/v1/board">
                <table className="table table-bordered mt-5">
                    <tbody>
                        <tr>
                            <th className="bg-light">유형</th>
                            <td><input type="text" value={data.typeName} onChange={(e) => setData({ ...data, typeName: e.target.value })} /></td>
                        </tr>
                        <tr>
                            <th className="bg-light">지역</th>
                            <td><input type="text" value={data.regionName} onChange={(e) => setData({ ...data, regionName: e.target.value })} /></td>
                        </tr>
                        <tr>
                            <th className="bg-light">주소</th>
                            <td><input type="text" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} /></td>
                        </tr>
                        <tr>
                            <th className="bg-light">체크인</th>
                            <td><input type="text" value={data.checkInTime} onChange={(e) => setData({ ...data, checkInTime: e.target.value })} /></td>
                        </tr>
                        <tr>
                            <th className="bg-light">체크아웃</th>
                            <td><input type="text" value={data.checkOutTime} onChange={(e) => setData({ ...data, checkOutTime: e.target.value })} /></td>
                        </tr>
                    </tbody>
                </table>
                <div>이미지, 설명</div>
                <button className="btn btn-primary btn-sm me-1" type="submit">저장</button>
                <button className="btn btn-danger btn-sm" type='reset' onClick={() => setData(originalData)}>초기화</button>
            </form>
        </Container>
    </>
}

export default AdminAccommodationDetail;