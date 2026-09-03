import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { LS, SV, RM, uid, today } from "../lib/storage";
import { BOOKS, DIK } from "../data/books";
import { supabase, HAS_DB } from "../lib/supabase";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

/* hash utk tampilan tombol admin di UI (keamanan sebenarnya ada di RLS Supabase) */
const fnv1a = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return "h" + h.toString(36);
};
const ADMIN_HASHES = ["GANTI_HASH_EMAIL_KAMU"]; // hasil dari console seperti sebelumnya

export const PENERBIT_RESMI = "Tim Sera";

export function AppProvider({ children }) {
  /* ===== data pribadi (lokal, per perangkat) ===== */
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

  /* ===== data global (Supabase) ===== */
  const [customBooks, setCustomBooks] = useState(() => LS("customBooks") || []); // lokal (non-admin)
  const [dbBooks, setDbBooks] = useState(() => LS("dbBooks") || []); // global (admin)
  const [hiddenIds, setHiddenIds] = useState(() => LS("hiddenIds") || []);
  const [glos, setGlos] = useState(() => LS("glos") || DIK);

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
  useEffect(() => SV("dbBooks", dbBooks), [dbBooks]);
  useEffect(() => SV("hiddenIds", hiddenIds), [hiddenIds]);
  useEffect(() => SV("glos", glos), [glos]);

  const isAdmin =
    !!user && ADMIN_HASHES.includes(fnv1a((user.email || "").toLowerCase()));

  /* ===== muat data global + sesi login ===== */
  useEffect(() => {
    if (!HAS_DB) return;
    (async () => {
      const [b, g, m] = await Promise.all([
        supabase.from("books").select("slug,data"),
        supabase.from("glossary").select("kata,arti"),
        supabase
          .from("meta")
          .select("value")
          .eq("key", "hidden_ids")
          .maybeSingle(),
      ]);
      if (b.data) {
        const arr = b.data.map((r) => r.data);
        setDbBooks(arr);
      }
      if (g.data && g.data.length) {
        const o = {};
        g.data.forEach((r) => (o[r.kata] = r.arti));
        setGlos(o);
      }
      if (m.data) setHiddenIds(m.data.value || []);
    })();
  }, []);

  const applyUser = (su) => {
    const u = {
      id: su.id,
      email: su.email,
      name:
        LS("user")?.email === su.email
          ? LS("user").name
          : su.email.split("@")[0],
    };
    setUser(u);
    SV("user", u);
  };

  useEffect(() => {
    if (!HAS_DB) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) applyUser(data.session.user);
    });
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) applyUser(s.user);
      else {
        setUser(null);
        RM("user");
      }
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const gagal = (e) => {
    console.error(e);
    alert("Gagal sinkron ke server: " + (e?.message || e));
  };

  /* ===== akun ===== */
  const login = async (email, pass) => {
    if (!HAS_DB) return;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  };
  const register = async (email, pass) => {
    if (!HAS_DB) return;
    const { error } = await supabase.auth.signUp({ email, password: pass });
    if (error) throw error;
  };
  const logout = async () => {
    if (HAS_DB) await supabase.auth.signOut();
    setUser(null);
    RM("user");
  };

  /* ===== baca pribadi ===== */
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

  /* ===== buku global (admin) / lokal (user biasa) ===== */
  const addCustomBook = (b) => {
    setCustomBooks((bs) => [b, ...bs.filter((x) => x.slug !== b.slug)]);
    if (isAdmin && HAS_DB && user)
      supabase
        .from("books")
        .upsert({ slug: b.slug, data: b })
        .then(({ error }) => error && gagal(error));
  };
  const removeCustomBook = (slug) => {
    setCustomBooks((bs) => bs.filter((b) => b.slug !== slug));
    setDbBooks((bs) => bs.filter((b) => b.slug !== slug));
    if (isAdmin && HAS_DB && user)
      supabase
        .from("books")
        .delete()
        .eq("slug", slug)
        .then(({ error }) => error && gagal(error));
  };
  const removeBook = (slug) => {
    const b = [...BOOKS, ...dbBooks, ...customBooks].find(
      (x) => x.slug === slug,
    );
    if (!b) return;
    if (b.custom) removeCustomBook(slug);
    else {
      setHiddenIds((h) => {
        const next = h.includes(b.id) ? h : [...h, b.id];
        if (isAdmin && HAS_DB && user)
          supabase
            .from("meta")
            .upsert({ key: "hidden_ids", value: next })
            .then(({ error }) => error && gagal(error));
        return next;
      });
    }
  };
  const restoreBuiltin = () => {
    setHiddenIds([]);
    if (isAdmin && HAS_DB && user)
      supabase
        .from("meta")
        .upsert({ key: "hidden_ids", value: [] })
        .then(({ error }) => error && gagal(error));
  };

  /* ===== glosarium global ===== */
  const addGlos = async (kata, arti) => {
    const k = (kata || "").trim().toLowerCase();
    const v = (arti || "").trim();
    if (!k || !v) return;
    setGlos((g) => ({ ...g, [k]: v }));
    if (isAdmin && HAS_DB && user) {
      const { error } = await supabase
        .from("glossary")
        .upsert({ kata: k, arti: v });
      if (error) gagal(error);
    }
  };
  const removeGlos = async (kata) => {
    const k = (kata || "").trim().toLowerCase();
    if (!k) return;
    setGlos((g) => {
      const c = { ...g };
      delete c[k];
      return c;
    });
    if (isAdmin && HAS_DB && user) {
      const { error } = await supabase.from("glossary").delete().eq("kata", k);
      if (error) gagal(error);
    }
  };
  const restoreGlos = async () => {
    setGlos((g) => ({ ...g, ...DIK }));
    if (isAdmin && HAS_DB && user) {
      const rows = Object.entries(DIK).map(([kata, arti]) => ({ kata, arti }));
      const { error } = await supabase.from("glossary").upsert(rows);
      if (error) gagal(error);
    }
  };

  /* katalog gabungan: bawaan → global(admin) → lokal(user) */
  const books = useMemo(() => {
    const m = new Map();
    [...BOOKS, ...dbBooks, ...customBooks].forEach((b) => {
      if (!m.has(b.slug)) m.set(b.slug, b);
    });
    return [...m.values()].filter((b) => !hiddenIds.includes(b.id));
  }, [dbBooks, customBooks, hiddenIds]);
  const getBook = (slug) => books.find((b) => b.slug === slug);

  return (
    <Ctx.Provider
      value={{
        user,
        login,
        register,
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
        glos,
        addGlos,
        removeGlos,
        restoreGlos,
        books,
        getBook,
      }}>
      {children}
    </Ctx.Provider>
  );
}
