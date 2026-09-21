export function downloadCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columnHeaders?: Record<string, string>
): void {
  if (!rows || rows.length === 0) return;
  const rawKeys = Object.keys(rows[0]);
  const headerRow = columnHeaders
    ? rawKeys.map((k) => columnHeaders[k] ?? k)
    : rawKeys;

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return '""';
    if (Array.isArray(value)) {
      return `"${value.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join("; ").replaceAll('"', '""')}"`;
    }
    if (typeof value === "object") {
      return `"${JSON.stringify(value).replaceAll('"', '""')}"`;
    }
    return `"${String(value).replaceAll('"', '""')}"`;
  };

  const csv = [
    headerRow.map((h) => `"${String(h).replaceAll('"', '""')}"`).join(","),
    ...rows.map((row) => rawKeys.map((k) => escape(row[k])).join(",")),
  ].join("\r\n");

  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
