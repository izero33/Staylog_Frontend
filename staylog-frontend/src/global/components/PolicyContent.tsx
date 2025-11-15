// src/components/policy/PolicyContent.tsx

import React from 'react';

type PolicyType = 'privacy' | 'terms';

interface PolicyContentProps {
    type: PolicyType; // 이 prop을 기준으로 내부에서 분기 처리
}

const PolicyContent: React.FC<PolicyContentProps> = ({ type }) => {
    let title = '';
    let content = null;

    if (type === 'terms') {
        title = '스테이로그 이용약관';
        content = (
            <>
                <h6 className="fw-bold mb-2">제 1장 총칙</h6>
                <p className="fw-bold mb-1">제 1조 (목적)</p>
                <p className="mb-3 text-muted">
                    본 약관은 (주)스테이로그(이하 "회사")가 제공하는 모든 서비스(이하 "서비스")의 이용에 관하여 회사와 회원의 권리, 의무 및 책임사항, 기타 필요 사항을 규정함을 목적으로 합니다.
                </p>

                <p className="fw-bold mb-1">제 2조 (정의)</p>
                <p className="mb-2 text-muted">
                    본 약관에서 사용하는 용어의 정의는 다음과 같습니다.
                </p>
                <ul className="list-disc list-inside text-muted">
                    <li>"회원"이라 함은 본 약관에 동의하고 회사와 서비스 이용계약을 체결하여 서비스를 이용하는 자를 말합니다.</li>
                    <li>"아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
                </ul>

                <h6 className="fw-bold mt-4 mb-2">제 2장 서비스 이용 계약</h6>
                <p className="fw-bold mb-1">제 4조 (약관의 효력 및 변경)</p>
                <p className="mb-2 text-muted">
                    ① 이 약관은 회원이 약관 내용에 동의 후 서비스 이용을 신청하고, 회사가 그 신청을 승낙함으로써 효력이 발생합니다.
                </p>
                <p className="mb-3 text-muted">
                    ② 회사는 「전자상거래 등에서의 소비자보호에 관한 법률」, 「약관의 규제에 관한 법률」 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
                </p>
            </>
        );
    } else if (type === 'privacy') {
        title = '개인정보 처리방침';
        content = (
            <>
                <p className="mb-4 text-muted">
                    (주)스테이로그는 이용자의 개인정보를 중요시하며, 「개인정보보호법」 및 관련 법령을 준수하고 있습니다.
                    본 방침을 통해 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
                </p>

                <h6 className="fw-bold mt-4 mb-2">1. 수집하는 개인정보 항목 및 수집 방법</h6>
                <p className="mb-2 text-muted">
                    회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집하고 있습니다.
                </p>
                <ul className="text-muted mb-2">
                    <li>필수 항목: 이름, 아이디, 비밀번호, 이메일 주소, 연락처</li>
                    <li>선택 항목: 주소, 생년월일, 성별, 서비스 이용 기록, 접속 로그, 쿠키</li>
                </ul>
                <p className="text-muted">
                    수집 방법: 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력하거나 자동 수집 장치를 통해 수집.
                </p>

                <h6 className="fw-bold mt-4 mb-2">2. 개인정보의 처리 및 이용 목적</h6>
                <p className="text-muted mb-2">
                    회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.
                </p>
                <ul className="list-disc list-inside text-muted">
                    <li>서비스 제공 및 계약 이행, 요금 정산</li>
                    <li>회원 관리 및 본인 확인, 불만 처리 등 민원 처리</li>
                    <li>신규 서비스 개발 및 마케팅, 광고 활용</li>
                </ul>

                <h6 className="fw-bold mt-4 mb-2">3. 개인정보의 보유 및 이용 기간</h6>
                <p className="text-muted mb-2">
                    원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계 법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계 법령에서 정한 기간 동안 개인정보를 보관합니다.
                </p>
                <ul className="text-muted mb-2">
                    <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                    <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래 등에서의 소비자 보호에 관한 법률)</li>
                </ul>
            </>
        );
    } else {
        return <p>유효하지 않은 정책 유형입니다.</p>;
    }

    return (
        <div className="p-2">
            <h5 className="fw-bold mb-5">{title}</h5>
            {content}
        </div>
    );
};

export default PolicyContent;