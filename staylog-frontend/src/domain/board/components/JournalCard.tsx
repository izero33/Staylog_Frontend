import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../global/hooks/getImageUrl";



export default function JournalCard({ board }: { board: any }) {
  const navigate = useNavigate();

  // ✅ 저널 전용이므로 하드코딩
  const apiBoardType = "BOARD_JOURNAL";

  const imageUrl = getImageUrl(apiBoardType, board.boardId);

  return (
    <Card
      className="shadow-sm h-100 hover-card border-0"
      style={{ cursor: "pointer", transition: "transform 0.2s ease" }}
      onClick={() => navigate(`/journal/${board.boardId}`)}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-4px)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.transform = "translateY(0)")
      }
    >
      {/* 이미지 */}
      <Card.Img
        variant="top"
        src={imageUrl || "/default-thumbnail.jpg"}
        alt="thumbnail"
        style={{
          height: "180px",
          objectFit: "cover",
          borderTopLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
        }}
      />

      {/* 오버레이 정보 */}
      <div
        className="position-absolute top-0 end-0 d-flex gap-2 p-2 text-white fw-semibold"
        style={{
          background: "rgba(0, 0, 0, 0.4)",
          fontSize: "0.85rem",
        }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-eye me-1"></i>
          {board.viewsCount ?? 0}
        </div>
        <div className="d-flex align-items-center">
          <i className="bi bi-heart-fill text-danger me-1"></i>
          {board.likesCount ?? 0}
        </div>
      </div>

      {/* 본문 */}
      <Card.Body className="d-flex flex-column justify-content-between">
        <Card.Title className="fw-bold text-truncate mb-2">
          {board.title}
        </Card.Title>
        <Card.Text className="text-muted small mb-2">
          {board.regionName} | {board.userNickName}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
