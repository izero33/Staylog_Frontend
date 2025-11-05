import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../../global/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatKST } from "../../../global/utils/date";
import type { AdminUserDto, AdminUser, Role, MemberStatus } from "../types/AdminUserTypes";
import { roleOptions, statusOptions, mapDtoToAdminUser } from "../types/AdminUserTypes";
import AdminUserDetailModal from "../components/AdminUserDetailModal";
import useCommonCodeSelector from "../../common/hooks/useCommonCodeSelector";
import type { CommonCodeDto } from "../../common/types";

function AdminUserPage() {


  // DB 공통 코드 1. Redux의 공통 코드 스토어에서 특정 그룹 불러오기
  const userStatusList = useCommonCodeSelector("userStatus") as CommonCodeDto[];

  // 빠른 조회를 위한 codeId = CommonCodeDto Mapping 2. 그 리스트를 Map 형태로 변환 
  const userStatusMap = useMemo(() => {
    const m = new Map<string, CommonCodeDto>();
    for (const row of userStatusList ?? []) m.set(row.codeId, row);
    return m;
  }, [userStatusList]);

  //  codeId 포맷 함수 s = status
  const toStatusCodeId = (s?: MemberStatus | null) =>
    s ? `USER_STATUS_${String(s).toUpperCase()}` : "";

  // 상태(공통코드 기반 라벨 + 색상)
  const getStatusView = (status?: MemberStatus | null) => {
    const cc = userStatusMap.get(toStatusCodeId(status));
    return {
      label: cc?.codeName ?? status ?? "—", // 한글명 없으면 영문 fallback
      color: cc?.attr1 ?? "#6c757d", // attr1에 HEX 색상 저장
    };
  };

  //  상태값 관리
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  //  목록 조회
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);

    api
      .get<{ users: AdminUserDto[] }>("/v1/admin/users", { params: { pageNum: 1 } })
      .then((res) => {
        const list = Array.isArray(res.users) ? res.users : [];
        if (mounted) setUsers(list.map(mapDtoToAdminUser));
      })
      .catch((err) => {
        console.error("유저 목록 조회 불가:", err);
        if (mounted) setErrorMsg("유저 목록을 불러오지 못했습니다.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  // 상세 모달 열기 / 닫기
  const openDetail = useCallback((userId: number) => {
    setSelectedUserId(userId);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedUserId(null);
  }, []);

  // 권한 변경
  async function onChangeRole(userId: number, nextRole: Role) {
    const prev = users.find((u) => u.userId === userId)?.role;
    setUpdatingUserId(userId);
    setUsers((list) =>
      list.map((u) => (u.userId === userId ? { ...u, role: nextRole } : u))
    );

    try {
      await api.patch(`/v1/admin/users/${userId}/role`, { role: nextRole });
    } catch (err) {
      console.log("유저 권한 변경 실패");
      setUsers((list) =>
        list.map((u) =>
          u.userId === userId ? { ...u, role: prev ?? u.role } : u
        )
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  // 상태 변경
  async function onChangeStatus(userId: number, nextStatus: MemberStatus) {
    const prev = users.find((u) => u.userId === userId)?.status;
    setUpdatingUserId(userId);
    setUsers((list) =>
      list.map((u) => (u.userId === userId ? { ...u, status: nextStatus } : u))
    );

    try {
      await api.patch(`/v1/admin/users/${userId}/status`, { status: nextStatus });
    } catch (err) {
      console.log("유저 상태 변경 실패");
      setUsers((list) =>
        list.map((u) =>
          u.userId === userId ? { ...u, status: prev ?? u.status } : u
        )
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <div className="container-fluid py-3">
      <h1>회원 관리 페이지</h1>

      {/* 로딩 / 에러 처리 */}
      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>불러오는 중…</span>
        </div>
      )}
      {!loading && errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && (
        <>
          {/* 반응형 UI  */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: 140 }}>회원 이름</th>
                    <th style={{ minWidth: 200 }}>이메일</th>
                    <th style={{ width: 140 }}>Role</th>
                    <th style={{ width: 160 }}>가입일</th>
                    <th style={{ width: 160 }} className="d-none d-lg-table-cell">
                      수정일
                    </th>
                    <th style={{ width: 160 }} className="d-none d-xl-table-cell">
                      마지막 로그인
                    </th>
                    <th style={{ width: 160 }}>회원 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none"
                          onClick={() => openDetail(user.userId)}
                        >
                          {user.name}
                        </button>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 260 }}>
                        {user.email}
                      </td>
                      <td>
                        <select
                          value={user.role}
                          disabled={updatingUserId === user.userId}
                          onChange={(e) =>
                            onChangeRole(user.userId, e.target.value as Role)
                          }
                          className="form-select form-select-sm"
                        >
                          {roleOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>{formatKST(user.createdAt)}</td>
                      <td className="d-none d-lg-table-cell">
                        {formatKST(user.updatedAt)}
                      </td>
                      <td className="d-none d-xl-table-cell">
                        {formatKST(user.lastLogin)}
                      </td>
                      <td>
                        <select
                          value={user.status}
                          disabled={updatingUserId === user.userId}
                          onChange={(e) => 
                          onChangeStatus(user.userId, e.target.value as MemberStatus)
                          }
                          className="form-select form-select-sm"
                        >
                          {statusOptions.map((opt) => {
                            const view = getStatusView(opt);
                            return (
                              <option key={opt} value={opt}>
                                {view.label}
                              </option>
                            );
                          })}
                        </select>
                        {(() => {
                          const view = getStatusView(user.status);
                          return (
                            <span
                              className="badge ms-2"
                              style={{
                                backgroundColor: view.color,
                                color: "#fff",
                              }}
                            >
                              {view.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <AdminUserDetailModal
        userId={selectedUserId}
        open={detailOpen}
        onClose={closeDetail}
      />
    </div>
  );
}

export default AdminUserPage;
