import { Modal } from "react-bootstrap";
import { ResponsivePie } from "@nivo/pie";

type Props = {
  show: boolean; // 모달 표시 여부
  onHide: () => void; // 모달 닫기 핸들러
  confirmedCount: number; // 확정 건
  canceledCount: number; // 취소 건
};

export default function AdminMonthlyStatsChart({
  show,
  onHide,
  confirmedCount,
  canceledCount,
}: Props) {
  const data = [
    { id: "확정", label: "확정", value: confirmedCount ?? 0 },
    { id: "취소", label: "취소", value: canceledCount ?? 0 },
  ];

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>확정 | 취소</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ height: 380 }}>
          <ResponsivePie
            data={data}
            colors={["#73D3F1", "#E65751"]} // 확정 / 취소
            innerRadius={0.6}
            padAngle={1.5}
            cornerRadius={6}
            activeOuterRadiusOffset={14}
            enableArcLinkLabels
            arcLinkLabelsSkipAngle={10}
            arcLabelsSkipAngle={10}
            // 확정 건 / 취소 건 % 로 표시
            arcLabel={(d) => {
            const total = confirmedCount + canceledCount;
            if (total === 0) return "0%";
            const percent = (d.value / total) * 100;
            return `${percent.toFixed(1)}%`; // 소수점 한 자리 표시
            }}
            valueFormat={(v) => `${v.toLocaleString("ko-KR")}건`}
            animate
            motionConfig="wobbly"
            borderWidth={1.2}
            borderColor={{ from: "color", modifiers: [["darker", 0.35]] }}
            legends={[
            {
                anchor: "bottom",
                direction: "row",
                translateY: 24,
                itemWidth: 80,
                itemHeight: 18,
                itemTextColor: "#6b7280",
                symbolSize: 12,
                symbolShape: "circle",
            },
            ]}
            theme={{
              labels: { text: { fontSize: 13, fontWeight: 600 } },
              legends: { text: { fontSize: 12 } },
              tooltip: {
                container: {
                  background: "white",
                  padding: 10,
                  borderRadius: 10,
                  boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  color: "#111827",
                },
              },
            }}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
}
