import { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import { fetchMemberInfo, updateMemberInfo } from "../api/mypageApi";
import useGetUserIdFromToken from "../../auth/hooks/useGetUserIdFromToken";
import type { MemberInfo } from "../types/mypageTypes";
import { useSelector } from "react-redux";
import type { RootState } from "../../../global/store/types";

function MemberInfoSection() {
    const userId = useGetUserIdFromToken();
    const nickname = useSelector((state: RootState) => state.userInfo?.nickname);
    const [member, setMember] = useState<MemberInfo | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 업로드 시 미리보기 이미지
    

    useEffect(() => {
        // 회원정보 조회
        if (!userId) return;

        fetchMemberInfo(userId)
        .then((data) => setMember(data))
        .catch((err) => {
            console.error("회원정보 조회 실패:", err);
            alert("회원 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
        });
    }, [userId]);

    // 입력값 변경
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!member) return;
        setMember({ ...member, [e.target.name]: e.target.value });
    };

    //프로필 이미지 변경 (미리보기 & 상태 업데이트)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 브라우저 미리보기용 URL 생성
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);

        // 실제 서버 업로드 로직 (S3 등) — 지금은 URL만 업데이트
        setMember((prev) => prev ? { ...prev, profileImageUrl: preview } : prev);
    };

    // 저장 버튼
    const handleSave = async () => {
        if (!member || !userId) return;
        try {
            // userId 추가해서 body 구조 맞춤
            await updateMemberInfo({ ...member, userId });
                alert("회원 정보가 수정되었습니다.");
                setEditMode(false);
            } catch {
                alert("수정 실패. 잠시 후 다시 시도해주세요.");
        }
    };

    if (!member) {
        return <p className="text-center mt-5">회원 정보를 불러오는 중...</p>;
    }

    return (
        <Card className="shadow-sm border-0 w-100">
        <Card.Body className="p-4">
            {/* 상단 인사 영역 */}
            <div className="mb-4 text-center text-md-centre">
                <h3 className="fw-bold">{member.nickname} 님 반가워요 👋</h3>
                <p className="text-muted mb-0">
                    {new Date(member.createdAt).getFullYear()}년부터 StayLog를 함께하고 있어요.
                </p>
                <hr />
            </div>

            {/* 폼 + 프로필 */}
            <Row className="g-4 align-items-start">
            {/* 왼쪽 폼 */}
            <Col xs={12} md={8}>
                {/* ...Form 영역... */}
                <Form>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>로그인 ID</Form.Label>
                    <Form.Control type="text" value={member.loginId} disabled />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>이메일</Form.Label>
                    <Form.Control type="email" name="email" value={member.email || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>닉네임</Form.Label>
                    <Form.Control type="text" name="nickname" value={member.nickname || ""} onChange={handleChange} disabled={!editMode} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>이름</Form.Label>
                    <Form.Control type="text" name="name" value={member.name || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>전화번호</Form.Label>
                    <Form.Control type="text" name="phone" value={member.phone || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>생년월일</Form.Label>
                    <Form.Control type="text" name="birthdate" value={member.birthDate || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-start d-block" style={{ marginBottom: "0.4rem" }}>성별</Form.Label>
                    <Form.Control type="text" name="gender" value={member.gender || ""} onChange={handleChange} disabled={!editMode}/>
                </Form.Group>

                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                    {!editMode ? (
                        <Button variant="dark" className="flex-fill" onClick={() => setEditMode(true)}>수정하기</Button>
                    ) : (
                        <Button variant="success" className="flex-fill" onClick={handleSave}>저장하기</Button>
                    )}
                        <Button variant="outline-secondary" className="flex-fill">비밀번호 변경</Button>
                </div>
                </Form>
            </Col>

            {/* 오른쪽 폼 */}
            <Col xs={12} md={4} className="text-center">
                <div
                    className="border rounded-circle mx-auto d-flex justify-content-center align-items-center bg-light overflow-hidden"
                    style={{ width: "130px", height: "130px" }}
                >
                    <Image 
                        onClick={() => document.getElementById("formFile")?.click()} 
                        src={previewUrl || member.profileImageUrl || "https://cdn-icons-png.flaticon.com/512/847/847969.png"} alt="profile" roundedCircle fluid
                    />
                </div>
                <p className="text-muted mt-2 mb-1">프로필 사진</p>

                {/* editMode일 때만 보이는 업로드 버튼 */}
                {editMode && (
                    <Form.Group controlId="formFile" className="mt-2">
                        <Form.Control type="file" accept="image/*" onChange={handleImageChange}/>
                    </Form.Group>
                )}
            </Col>
            </Row>   
        </Card.Body>
        </Card>
    );
}

export default MemberInfoSection;
