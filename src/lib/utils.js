export const fmtMin = (m) =>
  m < 60
    ? Math.round(m) + " mnt"
    : (m / 60).toFixed(1).replace(".0", "") + " jam";
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
