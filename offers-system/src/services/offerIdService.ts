export function formatOfferId(year: number, sequence: number): string {
  return `SDQ-${year}-${String(sequence).padStart(4, "0")}`;
}
