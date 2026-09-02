const K = "sela.";
export const LS = (k) => {
  try {
    return JSON.parse(localStorage.getItem(K + k));
  } catch {
    return null;
  }
};
export const SV = (k, v) => localStorage.setItem(K + k, JSON.stringify(v));
export const RM = (k) => localStorage.removeItem(K + k);
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const today = () => new Date().toISOString().slice(0, 10);
