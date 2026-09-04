import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { LS, SV, RM, uid, today } from "../lib/storage";
import { BOOKS, DIK } from "../data/books";
import { supabase, HAS_DB } from "../lib/supabase";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const PENERBIT_RESMI = "Tim Sela";

export function AppProvider({ children }) {
  /* ===== data pribadi (lokal + tersinkron) ===== */
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
  const [bookTime, setBookTime] = useState(() => LS("bookTime") || {});

  /* ===== data global ===== */
  const [customBooks, setCustomBooks] = useState(() => LS("customBooks") || []);
  const [dbBooks, setDbBooks] = useState(() => LS("dbBooks") || []);
  const [hiddenIds, setHiddenIds] = useState(() => LS("hiddenIds") || []);
  const [glos, setGlos] = useState(() => LS("glos") || DIK);
  const [views, setViews] = useState(() => LS("views") || {});
  const [isAdmin, setIsAdmin] = useState(false);
  const hydrated = useRef(false);

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
  useEffect(() => SV("bookTime", bookTime), [bookTime]);
  useEffect(() => SV("customBooks", customBooks), [customBooks]);
  useEffect(() => SV("dbBooks", dbBooks), [dbBooks]);
  useEffect(() => SV("hiddenIds", hiddenIds), [hiddenIds]);
  useEffect(() => SV("glos", glos), [glos]);
  useEffect(() => SV("views", views), [views]);

  /* ===== muat data global ===== */
  useEffect(() => {
    if (!HAS_DB) return;
    (async () => {
      const [b, g, m, v] = await Promise.all([
        supabase.from("books").select("slug,data"),
        supabase.from("glossary").select("kata,arti"),
        supabase
          .from("meta")
          .select("value")
          .eq("key", "hidden_ids")
          .maybeSingle(),
        supabase.from("views").select("slug,hits"),
      ]);
      if (b.data) setDbBooks(b.data.map((r) => r.data));
      if (g.data && g.data.length) {
        const o = {};
        g.data.forEach((r) => (o[r.kata.toLowerCase()] = r.arti));
        setGlos(o);
      }
      if (m.data) setHiddenIds(m.data.value || []);
      if (v.data) {
        const vm = {};
        v.data.forEach((r) => (vm[r.slug] = Number(r.hits)));
        setViews(vm);
        SV("views", vm);
      }
    })();
  }, []);

  /* ===== sesi login + admin ===== */
  const cekAdmin = async (email) => {
    if (!HAS_DB || !email) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const applyUser = (su) => {
    const lama = LS("user");
    const u = {
      id: su.id,
      email: su.email,
      name: lama?.email === su.email ? lama.name : su.email.split("@")[0],
    };
    setUser(u);
    SV("user", u);
    cekAdmin(su.email);
    pullSync(su);
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
        setIsAdmin(false);
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
    setIsAdmin(false);
    RM("user");
  };

  /* ===== manajemen admin ===== */
  const listAdmin = async () => {
    const { data, error } = await supabase.from("admins").select("email");
    if (error) throw error;
    return (data || []).map((d) => d.email);
  };
  const addAdmin = async (email) => {
    if (!isAdmin) return;
    const e = (email || "").trim().toLowerCase();
    if (!e.includes("@")) throw new Error("Email tidak valid.");
    const { error } = await supabase.from("admins").insert({ email: e });
    if (error) throw error;
  };
  const removeAdmin = async (email) => {
    if (!isAdmin) return;
    const { error } = await supabase.from("admins").delete().eq("email", email);
    if (error) throw error;
  };

  /* ===== SINKRON ANTAR PERANGKAT ===== */
  const pushSync = (uidArg) => {
    if (!HAS_DB || !user) return;
    supabase
      .from("user_data")
      .upsert({
        user_id: uidArg || user.id,
        data: { progress, shelf, highlights, bookTime, readlog, finished },
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => error && console.error(error));
  };

  const pullSync = async (su) => {
    if (!HAS_DB || !su) return;
    hydrated.current = false;
    const { data } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", su.id)
      .maybeSingle();
    if (data?.data) {
      const d = data.data; // server menang
      if (d.progress) setProgress(d.progress);
      if (d.shelf) setShelf(d.shelf);
      if (d.highlights) setHighlights(d.highlights);
      if (d.bookTime) setBookTime(d.bookTime);
      if (d.readlog) setReadlog(d.readlog);
      if (d.finished) setFinished(d.finished);
    } else {
      pushSync(su.id); // akun baru: dorong data lokal
    }
    hydrated.current = true;
  };

  /* auto-push (debounce 1.5 dtk) */
  useEffect(() => {
    if (!HAS_DB || !user || !hydrated.current) return;
    const t = setTimeout(() => pushSync(), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [progress, shelf, highlights, bookTime, readlog, finished, user]);

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
  const logBookRead = (bookId, sec) =>
    setBookTime((t) => ({ ...t, [bookId]: (t[bookId] || 0) + sec }));
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

  /* ===== buku global ===== */
  const addCustomBook = (b) => {
    const withOwner = { ...b, owner: user?.email || null };
    setCustomBooks((bs) => [
      withOwner,
      ...bs.filter((x) => x.slug !== withOwner.slug),
    ]);
    setDbBooks((bs) => [
      withOwner,
      ...bs.filter((x) => x.slug !== withOwner.slug),
    ]);
    if (user && HAS_DB)
      supabase
        .from("books")
        .upsert({
          slug: withOwner.slug,
          data: withOwner,
          owner: withOwner.owner,
        })
        .then(({ error }) => error && gagal(error));
  };
  const removeCustomBook = (slug) => {
    setCustomBooks((bs) => bs.filter((b) => b.slug !== slug));
    setDbBooks((bs) => bs.filter((b) => b.slug !== slug));
    if (user && HAS_DB)
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
      if (!isAdmin) return;
      setHiddenIds((h) => {
        const next = h.includes(b.id) ? h : [...h, b.id];
        supabase
          .from("meta")
          .upsert({ key: "hidden_ids", value: next })
          .then(({ error }) => error && gagal(error));
        return next;
      });
    }
  };
  const restoreBuiltin = () => {
    if (!isAdmin) return;
    setHiddenIds([]);
    supabase
      .from("meta")
      .upsert({ key: "hidden_ids", value: [] })
      .then(({ error }) => error && gagal(error));
  };

  /* ===== glosarium ===== */
  const addGlos = async (kata, arti) => {
    const k = (kata || "").trim().toLowerCase();
    const v = (arti || "").trim();
    if (!k || !v) return;
    setGlos((g) => ({ ...g, [k]: v }));
    if (HAS_DB) {
      const { error } = await supabase
        .from("glossary")
        .upsert({ kata: k, arti: v, oleh: user?.email || "Tamu" });
      if (error) gagal(error);
    }
  };
  const removeGlos = async (kata) => {
    if (!isAdmin) return;
    const k = (kata || "").trim().toLowerCase();
    if (!k) return;
    setGlos((g) => {
      const c = { ...g };
      delete c[k];
      return c;
    });
    const { error } = await supabase.from("glossary").delete().eq("kata", k);
    if (error) gagal(error);
  };
  const restoreGlos = async () => {
    if (!isAdmin) return;
    setGlos((g) => ({ ...g, ...DIK }));
    const rows = Object.entries(DIK).map(([kata, arti]) => ({ kata, arti }));
    const { error } = await supabase.from("glossary").upsert(rows);
    if (error) gagal(error);
  };

  /* ===== VIEWS ===== */
  const bumpView = (slug) => {
    if (!HAS_DB) return;
    const k = "sela.viewed." + slug;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    supabase.rpc("increment_views", { bslug: slug }).then(({ error }) => {
      if (!error) setViews((v) => ({ ...v, [slug]: (v[slug] || 0) + 1 }));
    });
  };

  /* ===== REVIEWS ===== */
  const fetchReviews = async (slug) => {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("slug", slug)
      .order("created_at", { ascending: false });
    return data || [];
  };
  const submitReview = async (slug, bintang, teks) => {
    if (!user) throw new Error("Masuk dulu untuk memberi rating.");
    const { error } = await supabase.from("reviews").insert({
      slug,
      email: user.email,
      nama: user.name || user.email.split("@")[0],
      bintang,
      teks: (teks || "").trim() || null,
    });
    if (error) throw error;
  };
  const deleteReview = async (id) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  };

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
        listAdmin,
        addAdmin,
        removeAdmin,
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
        bookTime,
        logBookRead,
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
        views,
        bumpView,
        fetchReviews,
        submitReview,
        deleteReview,
        books,
        getBook,
      }}>
      {children}
    </Ctx.Provider>
  );
}
