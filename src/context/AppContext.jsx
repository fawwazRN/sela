import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { LS, SV, RM, uid, today } from "../lib/storage";
import { BOOKS } from "../data/books";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const fnv1a = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return "h" + h.toString(36);
};

const ADMIN_HASHES = [
  "h1b941zk", // ← WAJIB DIGANTI dengan hasil dari console
];

export const PENERBIT_RESMI = "Tim Sera";

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => LS("user"));
  const [theme, setTheme] = useState(() => LS("theme") || "terang");
  const [progress, setProgress] = useState(() => LS("progress") || {});
  const [shelf, setShelf] = useState(
    () => LS("shelf") || { baca: [], selesai: [], simpan: [] },
  );
  const [highlights, setHighlights] = useState(() => LS("highlights") || []);
  const [drafts, setDrafts] = useState(() => LS("drafts") || []);
  const [readlog, setReadlog] = useState(() => LS("readlog") || {});
  const [finished, setFinished] = useState(() => LS("finished") || {});
  const [customBooks, setCustomBooks] = useState(() => LS("customBooks") || []);
  const [hiddenIds, setHiddenIds] = useState(() => LS("hiddenIds") || []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    SV("theme", theme);
  }, [theme]);
  useEffect(() => SV("progress", progress), [progress]);
  useEffect(() => SV("shelf", shelf), [shelf]);
  useEffect(() => SV("highlights", highlights), [highlights]);
  useEffect(() => SV("drafts", drafts), [drafts]);
  useEffect(() => SV("readlog", readlog), [readlog]);
  useEffect(() => SV("finished", finished), [finished]);
  useEffect(() => SV("customBooks", customBooks), [customBooks]);
  useEffect(() => SV("hiddenIds", hiddenIds), [hiddenIds]);

  /* admin dicek dari hash email — akun lama pun otomatis kena */
  const isAdmin =
    !!user && ADMIN_HASHES.includes(fnv1a((user.email || "").toLowerCase()));

  const login = (name, email) => {
    const u = { id: uid(), name, email };
    setUser(u);
    SV("user", u);
  };
  const logout = () => {
    setUser(null);
    RM("user");
  };

  const saveProgress = (bookId, chap, pct) =>
    setProgress((p) => ({ ...p, [bookId]: { chap, pct, at: Date.now() } }));

  const moveTo = (bookId, list) =>
    setShelf((s) => ({
      baca: s.baca.filter((x) => x !== bookId),
      selesai: s.selesai.filter((x) => x !== bookId),
      simpan: s.simpan.filter((x) => x !== bookId),
      [list]: [...s[list].filter((x) => x !== bookId), bookId],
    }));

  const toggleShelf = (bookId) =>
    setShelf((s) =>
      s.simpan.includes(bookId)
        ? { ...s, simpan: s.simpan.filter((x) => x !== bookId) }
        : { ...s, simpan: [...s.simpan, bookId] },
    );

  const addHighlight = (h) =>
    setHighlights((hs) => [{ id: uid(), at: today(), ...h }, ...hs]);
  const removeHighlight = (id) =>
    setHighlights((hs) => hs.filter((h) => h.id !== id));

  const saveDraft = (d) => {
    const id = d.id || uid();
    setDrafts((ds) =>
      d.id
        ? ds.map((x) => (x.id === d.id ? { ...x, ...d } : x))
        : [{ id, at: today(), ...d }, ...ds],
    );
    return id;
  };
  const removeDraft = (id) => setDrafts((ds) => ds.filter((d) => d.id !== id));

  const logRead = (sec) =>
    setReadlog((r) => ({ ...r, [today()]: (r[today()] || 0) + sec }));

  const finishBook = (id) => {
    setFinished((f) => (f[id] ? f : { ...f, [id]: today() }));
    setShelf((s) => ({
      baca: s.baca.filter((x) => x !== id),
      simpan: s.simpan.filter((x) => x !== id),
      selesai: s.selesai.includes(id) ? s.selesai : [...s.selesai, id],
    }));
  };

  const addCustomBook = (b) =>
    setCustomBooks((bs) => [b, ...bs.filter((x) => x.slug !== b.slug)]);
  const removeCustomBook = (slug) =>
    setCustomBooks((bs) => bs.filter((b) => b.slug !== slug));

  /* admin: hapus buku APA PUN. Bawaan → disembunyikan; impor/studio → dihapus */
  const removeBook = (slug) => {
    const b = [...BOOKS, ...customBooks].find((x) => x.slug === slug);
    if (!b) return;
    if (b.custom) setCustomBooks((bs) => bs.filter((x) => x.slug !== slug));
    else setHiddenIds((h) => (h.includes(b.id) ? h : [...h, b.id]));
  };
  const restoreBuiltin = () => setHiddenIds([]);

  const books = useMemo(
    () => [...BOOKS, ...customBooks].filter((b) => !hiddenIds.includes(b.id)),
    [customBooks, hiddenIds],
  );
  const getBook = (slug) => books.find((b) => b.slug === slug);

  return (
    <Ctx.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        theme,
        setTheme,
        progress,
        saveProgress,
        shelf,
        moveTo,
        toggleShelf,
        highlights,
        addHighlight,
        removeHighlight,
        drafts,
        saveDraft,
        removeDraft,
        readlog,
        logRead,
        finished,
        finishBook,
        customBooks,
        addCustomBook,
        removeCustomBook,
        removeBook,
        restoreBuiltin,
        hiddenIds,
        books,
        getBook,
      }}>
      {children}
    </Ctx.Provider>
  );
}
