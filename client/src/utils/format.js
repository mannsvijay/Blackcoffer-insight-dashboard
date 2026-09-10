export function formatNumber(value, fallback = "—") {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDecimal(value, fallback = "—") {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return value.toFixed(1);
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export const CHART_COLORS = [
  "#E3A857",
  "#3FBFAA",
  "#6C8EBF",
  "#C97064",
  "#8E7CC3",
  "#7FA650",
  "#D4A5A5",
  "#5FA8D3",
];
