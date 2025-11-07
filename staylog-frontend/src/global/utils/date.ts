/**
 *  날짜 문자열 한국시간 기준으로 표시하는 유틸 함수임
 * 
 */
export function formatKST(dateStr?: string | null) {
  if (!dateStr) return "—";

  // ✅ 날짜만 있는 경우 (2025-12-19)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // ✅ 날짜+시간인데 ISO 문자열이 아닌 경우 → KST라고 가정하고 그냥 split
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16);
  }

  // ✅ ISO 형식은 정상적으로 parsing
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const pad = (n: number) => String(n).padStart(2, "0");

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}
