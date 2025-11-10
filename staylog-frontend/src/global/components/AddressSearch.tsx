import React from 'react';
import { Modal } from 'react-bootstrap';
import DaumPostcode from 'react-daum-postcode';
import type { Address } from 'react-daum-postcode';

// Props 및 Coordinates 인터페이스는 그대로 유지합니다.
interface Coordinates {
    lat: number | null; // 위도 (Latitude)
    lng: number | null; // 경도 (Longitude)
}

interface AddressSearchProps {
    show: boolean; // 모달 표시 여부
    onClose: () => void; // 모달을 닫는 함수
    onAddressSelect: (address: string, coords: Coordinates) => void; // 주소 선택 완료 시 호출 함수
}

const AddressSearch: React.FC<AddressSearchProps> = ({ show, onClose, onAddressSelect }) => {

    // 주소-좌표 변환 함수
    const getCoordinates = (roadAddress: string) => {
        if (!window.kakao || !window.kakao.maps.services.Geocoder) {
            console.error("Kakao 지도 API의 Geocoder 객체가 로드되지 않았습니다.");
            // API 로드 실패 시에도 결과는 전달하고 모달을 닫음
            onAddressSelect(roadAddress, { lat: null, lng: null });
            onClose();
            return;
        }

            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.addressSearch(roadAddress, (result: any[], status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const firstResult = result[0];
                    const newCoords: Coordinates = {
                    lat: parseFloat(firstResult.y), // 위도
                    lng: parseFloat(firstResult.x), // 경도
                    };

                // 부모 컴포넌트로 최종 주소와 좌표를 전달
                    onAddressSelect(roadAddress, newCoords);
                onClose(); // 모달 닫기
                } else {
                // 좌표 변환 실패 시 null 값을 전달
                    onAddressSelect(roadAddress, { lat: null, lng: null });
                onClose(); // 모달 닫기
                }
            });
    };

    // 다음 우편번호 검색 완료 시 처리 함수
    const onCompletePost = (data: Address) => {
        const roadAddr = data.roadAddress;
        // 주소를 받은 후 좌표 변환 로직 실행
        getCoordinates(roadAddr);
    };

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>주소 검색</Modal.Title>
            </Modal.Header>

            {/* Modal.Body에 상대 위치 및 높이 지정 */}
            <Modal.Body style={{ position: 'relative', padding: 0, height: '500px' }}>
                <DaumPostcode
                    // 팝업이 Modal.Body 영역을 꽉 채우도록 설정
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    autoClose={false}
                    onComplete={onCompletePost}
                />
            </Modal.Body>
        </Modal>
    );
};

export default AddressSearch;