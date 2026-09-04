import { useEffect, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";
import { G2M } from "../data/books";
import ReaderShell, { useAutoHide } from "../components/reader/ReaderShell";
import ContentRenderer from "../components/reader/ContentRenderer";
import Minimap from "../components/reader/Minimap";
import PopoverKata from "../components/reader/PopoverKata";
import EndOfChapter from "../components/reader/EndOfChapter";
import SettingsDrawer from "../components/reader/SettingsDrawer";

export default function Reader() {
  const { slug } = useParams();
  const {
    user, books, progress, saveProgress, logRead, logBookRead,
    addHighlight, finishBook, shelf, moveTo,
  } = useApp();
  const [sp] = useSearchParams();
  const book = books.find((b) => b.slug === slug);
  const saved = book ? progress[book.id] : null;

  /* tamu: selalu bab 1; login: lanjutkan posisi */
  const [chap, setChap] = useState(() => {
    if (!user) return 0;
    return Math.min(sp.get("bab") ? +sp.get("bab") : (saved?.chap ?? 0), book.bab.length - 1);
  });
  const [gate, setGate] = useState(false);

  const mintaGanti = (c) => {
    if (!user && c > 0) { setGate(true); window.scrollTo(0, 0); return; }
    setGate(false);
    setChap(c);
  };

  const [mode, setMode] = useState(() => (book ? G2M[book.genre] || "imersi" : "imersi"));
  const [rfs, setRfs] = useState(() => (localStorage.getItem("sela.rfs") ? +localStorage.getItem("sela.rfs") : 18));
  const [setOpen, setSetOpen] = useState(false);
  const [pop, setPop] = useState(null);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [spk, setSpk] = useState(false);
  const show = useAutoHide();
  const restored = useRef(false);
  const speaking = useRef(false);

  /* ===== deteksi aktivitas: baca = halaman terlihat + ada gerakan < 1 mnt ===== */
  const aktif = useRef(Date.now());
  useEffect(() => {
    const f = () => { aktif.current = Date.now(); };
    ["mousemove", "keydown", "touchstart", "scroll", "wheel"].forEach((ev) =>
      addEventListener(ev, f, { passive: true }));
    return () => ["mousemove", "keydown", "touchstart", "scroll", "wheel"].forEach((ev) =>
      removeEventListener(ev, f));
  }, []);

  useEffect(() => {
    localStorage.setItem("sela.rfs", String(rfs));
    document.documentElement.style.setProperty("--rfs", rfs + "px");
  }, [rfs]);

  useEffect(() => {
    document.documentElement.style.scrollSnapType = mode === "lambat" ? "y proximity" : "";
    return () => { document.documentElement.style.scrollSnapType = ""; };
  }, [mode]);

  useEffect(() => {
    if (!book) return;
    if (!shelf.baca.includes(book.id) && !shelf.selesai.includes(book.id))
      moveTo(book.id, "baca");
    // eslint-disable-next-line
  }, [book?.id]);

  useEffect(() => {
    if (!book) return;
    let lastSave = 0;
    const f = () => {
      const max = document.body.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      setPct(p);
      setPop(null);
      const now = Date.now();
      if (now - lastSave > 2000) {
        lastSave = now;
        saveProgress(book.id, chap, Math.round(p * 100));
      }
    };
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
    // eslint-disable-next-line
  }, [book?.id, chap]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setDone(false);
    setPop(null);
    setGate(false);
  }, [chap]);

  useEffect(() => {
    if (!book || !user || restored.current) return;
    restored.current = true;
    const p = progress[book.id];
    if (p && !sp.get("bab") && p.chap === chap && p.pct > 3 && p.pct < 98) {
      setTimeout(() => window.scrollTo(0, ((document.body.scrollHeight - innerHeight) * p.pct) / 100), 100);
    }
    // eslint-disable-next-line
  }, []);

  /* ===== pencatat waktu: total harian + per buku, hanya saat benar-benar membaca ===== */
  useEffect(() => {
    const iv = setInterval(() => {
      const membaca = document.visibilityState === "visible" && Date.now() - aktif.current < 60000;
      if (membaca && book) {
        logRead(15);
        logBookRead(book.id, 15);
      } else if (membaca) {
        logRead(15); // tamu: tetap hitung total harian
      }
    }, 15000);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, [book?.id]);

  useEffect(() => () => speechSynthesis.cancel(), []);

  if (!book)
    return (
      <div className="mx-auto px-5 py-24 max-w-[68ch] text-center">
        <p className="font-display text-2xl">Buku tidak ditemukan.</p>
        <Link to="/jelajah" className="mt-4 btn btn-o">Kembali ke Jelajah</Link>
      </div>
    );

  const onTap = (data) => { if (data.name || data.arti || data.para) setPop(data); };
  const doHighlight = () => {
    const raw = (pop.para || "").replace(/<[^>]+>/g, "").replace(/[{}]/g, "").trim();
    if (raw)
      addHighlight({
        book: book.judul, bookSlug: book.slug, chap,
        chapTitle: book.bab[chap].judul, text: raw.slice(0, 240),
      });
    setPop(null);
  };
  const speak = () => {
    if (speaking.current) {
      speechSynthesis.cancel(); speaking.current = false; setSpk(false); return;
    }
    const text = book.bab[chap].isi
      .map((b) => (typeof b.v === "string" ? b.v.replace(/\{|\}|<[^>]+>/g, "") : (b.v || "").join?.(" ") || ""))
      .join(". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID"; u.rate = 0.95;
    u.onend = () => { speaking.current = false; setSpk(false); };
    speaking.current = true; setSpk(true);
    speechSynthesis.speak(u);
  };
  const seek = (p) => window.scrollTo(0, (document.body.scrollHeight - innerHeight) * p);

  return (
    <div className="pb-24">
      <ReaderShell show={show && !pop} book={book} chap={chap} setChap={mintaGanti} pct={pct}
        onSettings={() => setSetOpen(true)} mode={mode} onSpeak={speak} speaking={spk} />
      <Minimap pct={pct} onSeek={seek} />
      <article className="px-5 pt-24">
        {gate ? (
          <div className="max-w-md mx-auto text-center py-20 fadein">
            <p className="text-5xl">🔒</p>
            <h2 className="font-display font-bold text-2xl mt-4 leading-snug">
              Bab selanjutnya untuk pembaca terdaftar
            </h2>
            <p className="text-ink2 text-sm mt-3 leading-relaxed">
              Gratis, cukup satu menit. Bab 1 tetap bisa kamu baca tanpa akun.
            </p>
            <div className="flex gap-3 justify-center mt-7">
              <Link to="/masuk" className="btn btn-p">Masuk / Daftar</Link>
              <button onClick={() => mintaGanti(0)} className="btn btn-o">Kembali ke bab 1</button>
            </div>
          </div>
        ) : (
          <>
            <ContentRenderer book={book} chap={chap} mode={mode} onTap={onTap} />
            <EndOfChapter key={chap} book={book} chap={chap} done={done}
              onNext={() => mintaGanti(Math.min(chap + 1, book.bab.length - 1))}
              onFinish={() => { finishBook(book.id); setDone(true); saveProgress(book.id, chap, 100); }} />
          </>
        )}
      </article>
      <PopoverKata data={pop} onClose={() => setPop(null)} onHighlight={doHighlight} />
      <SettingsDrawer open={setOpen} onClose={() => setSetOpen(false)}
        mode={mode} setMode={setMode} rfs={rfs} setRfs={setRfs} />
    </div>
  );
}