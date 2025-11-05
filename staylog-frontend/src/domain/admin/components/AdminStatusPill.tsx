// src/pages/admin/components/StatusPill.tsx
type Props = { label?: string; bgColor?: string };
export default function AdminStatusPill({ label = "—", bgColor }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: ".28rem .66rem",
        borderRadius: 9999,
        fontSize: ".8125rem",
        lineHeight: 1,
        whiteSpace: "nowrap",
        backgroundColor: bgColor ?? "#6c757d",
        color: "#fff",
        border: "1px solid rgba(0,0,0,.08)",
      }}
    >
      {label}
    </span>
  );
}
