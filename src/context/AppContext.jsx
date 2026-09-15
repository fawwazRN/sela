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

const KOSONG = { baca: [], selesai: [], simpan: [] };
const KUNCI_PRIBADI = [
  "progress",
  "shelf",
  "highlights",
  "bookTime",
  "readlog",
  "finished",
];

export function AppProvider({ children }) {
  /* ============================================================
     ARSITEKTUR:
     - Server (Supabase) = SUMBER KEBENARAN saat login
     - localStorage = CACHE saja (tema, font, tamu, paint instan)
     - draft      → tabel `drafts`  (satu baris per draft)
     - statistik,
       rak, highlight,
       progres    → tabel `user_data`
     - buku tayang → tabel `books`
     ============================================================ */

  const [user, setUser] = useState(() => LS("user"));
  const [theme, setTheme] = useState(() => LS("theme") || "terang");
  const [progress, setProgress] = useState(() => LS("progress") || {});
  const [shelf, setShelf] = useState(() => LS("shelf") || KOSONG);
  const [highlights, setHighlights] = useState(() => LS("highlights") || []);
  const [readlog, setReadlog] = useState(() => LS("readlog") || {});
  const [finished, setFinished] = useState(() => LS("finished") || {});
  const [bookTime, setBookTime] = useState(() => LS("bookTime") || {});
  const [goal, setGoalState] = useState(() => {
    const g = Number(LS("goal"));
    return g > 0 ? g : 20;
  });
  const setGoal = (m) => {
    const v = Number(m) > 0 ? Number(m) : 20;
    setGoalState(v);
    SV("goal", v);
  };

  /* draft: mulai dari cache, lalu DITIMPA data server saat login */
  const [drafts, setDrafts] = useState(() => LS("drafts") || []);

  /* ===== data global ===== */
  const [customBooks, setCustomBooks] = useState(() => LS("customBooks") || []);
  const [dbBooks, setDbBooks] = useState(() => LS("dbBooks") || []);
  const [hiddenIds, setHiddenIds] = useState(() => LS("hiddenIds") || []);
  const [glos, setGlos] = useState(() => LS("glos") || DIK);
  const [views, setViews] = useState(() => LS("views") || {});
  const [isAdmin, setIsAdmin] = useState(false);

  const hydrated = useRef(false);
  const pulledEmail = useRef(null);
  const skipPush = useRef(false);
  const userRef = useRef(null);
  const draftsRef = useRef(drafts);
  const dirtyDrafts = useRef(new Set());

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  /* ===== persist lokal (peran: CACHE) ===== */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    SV("theme", theme);
  }, [theme]);
  useEffect(() => SV("progress", progress), [progress]);
  useEffect(() => SV("shelf", shelf), [shelf]);
  useEffect(() => SV("highlights", highlights), [highlights]);
  useEffect(() => SV("readlog", readlog), [readlog]);
  useEffect(() => SV("finished", finished), [finished]);
  useEffect(() => SV("bookTime", bookTime), [bookTime]);
  useEffect(() => SV("goal", goal), [goal]);
  useEffect(() => SV("customBooks", customBooks), [customBooks]);
  useEffect(() => SV("dbBooks", dbBooks), [dbBooks]);
  useEffect(() => SV("hiddenIds", hiddenIds), [hiddenIds]);
  useEffect(() => SV("glos", glos), [glos]);
  useEffect(() => SV("views", views), [views]);
  useEffect(() => {
    draftsRef.current = drafts;
    SV("drafts", drafts); // cache
  }, [drafts]);

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

  const bersihkanPribadi = () => {
    setProgress({});
    setShelf(KOSONG);
    setHighlights([]);
    setBookTime({});
    setReadlog({});
    setFinished({});
    setDrafts([]);
    KUNCI_PRIBADI.forEach((k) => RM(k));
    RM("drafts");
  };

  const applyUser = (su) => {
    const lama = LS("user");
    const u = {
      id: su.id,
      email: su.email,
      name: lama?.email === su.email ? lama.name : su.email.split("@")[0],
    };
    if (LS("dataOwner") !== su.email) {
      bersihkanPribadi();
      SV("dataOwner", su.email);
    }
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
        pulledEmail.current = null;
        hydrated.current = false;
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
    if (HAS_DB && userRef.current && hydrated.current) {
      pushSync();
      flushDrafts();
    }
    if (HAS_DB) await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    setDrafts([]);
    RM("user");
    pulledEmail.current = null;
    hydrated.current = false;
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

  /* ============================================================
     SINKRON STATISTIK & RAK  (tabel user_data)
     ============================================================ */
  const pushSync = () => {
    const u = userRef.current;
    if (!HAS_DB || !u) return;
    supabase
      .from("user_data")
      .upsert({
        user_id: u.id,
        data: {
          progress,
          shelf,
          highlights,
          bookTime,
          readlog,
          finished,
          goal,
        },
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => error && console.error("Push gagal:", error));
  };

  /* ============================================================
     SINKRON DRAFT  (tabel drafts — write-through, debounce 800ms)
     ============================================================ */
  const flushDrafts = () => {
    const u = userRef.current;
    if (!HAS_DB || !u || !dirtyDrafts.current.size) return;
    const ids = [...dirtyDrafts.current];
    dirtyDrafts.current.clear();
    const rows = draftsRef.current
      .filter((d) => ids.includes(d.id))
      .map((d) => ({
        id: d.id,
        user_id: u.id,
        judul: d.judul,
        genre: d.genre,
        md: d.md,
        updated_at: new Date().toISOString(),
      }));
    if (!rows.length) return;
    supabase
      .from("drafts")
      .upsert(rows)
      .then(({ error }) => {
        if (error) {
          console.error("Draft gagal ke server:", error);
          rows.forEach((r) => dirtyDrafts.current.add(r.id)); // ulangi nanti
        }
      });
  };

  const pullSync = async (su) => {
    if (!HAS_DB || !su || pulledEmail.current === su.email) return;
    pulledEmail.current = su.email;
    hydrated.current = false;

    /* --- 1. statistik & rak --- */
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", su.id)
      .maybeSingle();
    if (error) {
      console.error("Pull gagal:", error);
      gagal(error);
      pulledEmail.current = null;
      return;
    }
    if (data?.data) {
      const d = data.data;
      if (d.progress) setProgress(d.progress);
      if (d.shelf) setShelf(d.shelf);
      if (d.highlights) setHighlights(d.highlights);
      if (d.bookTime) setBookTime(d.bookTime);
      if (d.readlog) setReadlog(d.readlog);
      if (d.finished) setFinished(d.finished);
      if (d.goal && Number(d.goal) > 0) setGoalState(Number(d.goal));
    }

    /* --- 2. draft dari tabel drafts --- */
    const { data: rows, error: dErr } = await supabase
      .from("drafts")
      .select("*")
      .eq("user_id", su.id)
      .order("updated_at", { ascending: false });
    if (dErr) {
      console.error("Pull draft gagal:", dErr);
      gagal(dErr);
      pulledEmail.current = null;
      return;
    }
    const serverDrafts = (rows || []).map((r) => ({
      id: r.id,
      judul: r.judul,
      genre: r.genre,
      md: r.md || "",
      at: r.updated_at,
    }));

    /* --- 3. RESCUE sekali jalan: draft yang hanya ada di
       perangkat ini (cache lama / versi lama / user_data versi
       lama) diunggah ke server supaya ikut tersinkron --- */
    const idServer = new Set(serverDrafts.map((d) => d.id));
    const lokalOnly = (LS("drafts") || []).filter((d) => !idServer.has(d.id));
    const legacy = (data?.data?.drafts || []).filter(
      (d) => !idServer.has(d.id) && !lokalOnly.some((l) => l.id === d.id),
    );
    const semuaRescue = [...lokalOnly, ...legacy];
    if (semuaRescue.length) {
      const { error: upErr } = await supabase.from("drafts").upsert(
        semuaRescue.map((d) => ({
          id: d.id,
          user_id: su.id,
          judul: d.judul,
          genre: d.genre,
          md: d.md || "",
          updated_at: new Date().toISOString(),
        })),
      );
      if (upErr) console.error("Rescue draft gagal:", upErr);
    }

    setDrafts([...semuaRescue, ...serverDrafts]);
    skipPush.current = true; // baru ditarik, jangan push balik
    hydrated.current = true;
  };

  /* auto-push statistik (debounce 1.5 dtk) — setelah pull sukses */
  useEffect(() => {
    if (!HAS_DB || !user || !hydrated.current) return;
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const t = setTimeout(() => pushSync(), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [progress, shelf, highlights, bookTime, readlog, finished, goal, user]);

  /* auto-push draft (debounce 800 dtk setelah ketikan berhenti) */
  useEffect(() => {
    if (!HAS_DB || !user || !hydrated.current) return;
    if (!dirtyDrafts.current.size) return;
    const t = setTimeout(() => flushDrafts(), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [drafts, user]);

  /* flush semua saat tab ditutup */
  useEffect(() => {
    if (!HAS_DB) return;
    const f = () => {
      if (userRef.current && hydrated.current) {
        pushSync();
        flushDrafts();
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
    // eslint-disable-next-line
  }, [progress, shelf, highlights, bookTime, readlog, finished, goal, drafts]);

  /* retry kalau pull pernah gagal (offline dkk) */
  useEffect(() => {
    if (!HAS_DB) return;
    const f = () => {
      const u = LS("user");
      if (u?.id && !hydrated.current) pullSync(u);
    };
    window.addEventListener("focus", f);
    return () => window.removeEventListener("focus", f);
  }, []);

  /* ============================================================
     AKSI DATA PRIBADI (state dulu → otomatis terdorong ke server)
     ============================================================ */
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

  /* draft: tulis lokal + tandai kotor → 800ms kemudian otomatis naik ke server */
  const saveDraft = (d) => {
    const id = d.id || uid();
    setDrafts((ds) => {
      const ada = ds.some((x) => x.id === id);
      return ada
        ? ds.map((x) => (x.id === id ? { ...x, ...d } : x))
        : [{ id, at: today(), ...d }, ...ds];
    });
    dirtyDrafts.current.add(id);
    return id;
  };
  const removeDraft = (id) => {
    setDrafts((ds) => ds.filter((d) => d.id !== id));
    dirtyDrafts.current.delete(id);
    const u = userRef.current;
    if (HAS_DB && u)
      supabase
        .from("drafts")
        .delete()
        .eq("id", id)
        .then(({ error }) => error && gagal(error));
  };

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

  /* ===== katalog gabungan ===== */
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
        goal,
        setGoal,
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
