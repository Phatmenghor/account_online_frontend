export function formatDate(raw: string): string {
  const [dd, mm, yyyy] = raw.split("/");
  if (!dd || !mm || !yyyy) return raw; // already ISO or invalid
  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}
