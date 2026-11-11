export const fmtNum = (n) => (n ?? 0).toLocaleString("pt-BR");
export const fmtDec = (n, d = 2) =>
  (n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtMin = (min) => {
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};
export const truncar = (t, n = 18) => (t && t.length > n ? t.slice(0, n - 1) + "…" : t);
