import React, { useState } from 'react';
import Modal from './Modal';
import { Nav } from 'react-bootstrap';
import PolicyContent from './PolicyContent';

type PolicyType = 'privacy' | 'terms';

interface FooterProps { }

const policyLinks = [
    { label: '개인정보 처리방침', type: 'privacy' as PolicyType },
    { label: '이용약관', type: 'terms' as PolicyType },
];

const Footer: React.FC<FooterProps> = () => {

    const [modalType, setModalType] = useState<PolicyType | null>(null);

    const openModal = (type: PolicyType) => setModalType(type);

    const closeModal = () => setModalType(null);

    const getModalContent = (type: PolicyType) => {
        return <PolicyContent type={type} />;
    };

    return (
        // 전체 푸터 컨테이너: 이미지와 비슷한 밝은 회색 배경과 얇은 하단 경계선
        <footer className="mt-5 py-5 px-5" style={{ backgroundColor: '#ebebebff' }}>
            <div className="max-w-7xl mx-auto text-gray-700 text-sm leading-relaxed">

                {/* 고객 센터 섹션 */}
                <section className="mb-8">
                    <h6 className="fw-bold text-base mb-2">
                        고객 센터 <span className="fw-normal fs-6 ms-2">평일 10:00 ~ 19:00 / 주말 및 공휴일 제외</span>
                    </h6>
                </section>

                {/* 상단 메뉴 링크 섹션 */}
                <section className="mb-4 text-xs font-semibold tracking-wider d-flex">
                    {policyLinks.map((link, index) => (
                        <React.Fragment key={index}>
                            <Nav.Link
                                href="#"
                                onClick={(e) => { e.preventDefault(); openModal(link.type); }}
                                className="d-inline-block text-muted"
                            >
                                {link.label}
                            </Nav.Link>
                            {index < policyLinks.length - 1 && <span className="mx-2 text-gray-400 font-normal">·</span>}
                        </React.Fragment>
                    ))}
                </section>

                {/* 회사 정보 섹션 */}
                <section className="font-bold fs-9">
                    <p>
                        (주)스테이로그 | 대표자: 고조장 | 주소: 서울특별시 강남구 테헤란로 124, 501호 | 사업자등록번호: 000-00-00000 | 통신판매업신고: 제2025-서울강남-0522호
                        <br />
                        전화: 1234-1234 | 전자우편: help@staylog.store
                    </p>
                </section>
            </div>

            {/* 재사용 가능한 Modal 컴포넌트 렌더링 */}
            {modalType && (
                <Modal
                    isOpen={!!modalType}
                    onClose={closeModal}
                >
                    {getModalContent(modalType)} {/* 내용(Children) 전달 */}
                </Modal>
            )}
        </footer>
    );
};

export default Footer;