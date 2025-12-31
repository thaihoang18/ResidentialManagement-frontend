export function toLocalYmd(value) {
  if (value === null || value === undefined || value === "") return "";

  // Already yyyy-mm-dd
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Try parse as Date/ISO and return local yyyy-mm-dd
  const d = value instanceof Date ? value : new Date(s);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
