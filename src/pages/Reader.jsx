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
    books,
    progress,
    saveProgress,
    logRead,
    addHighlight,
    finishBook,
    shelf,
    moveTo,
  } = useApp();
  const [sp] = useSearchParams();
  const book = books.find((b) => b.slug === slug);
  const saved = book ? progress[book.id] : null;

  const [chap, setChap] = useState(() =>
    book
      ? Math.min(
          sp.get("bab") ? +sp.get("bab") : (saved?.chap ?? 0),
          book.bab.length - 1,
        )
      : 0,
  );
  const [mode, setMode] = useState(() =>
    book ? G2M[book.genre] || "imersi" : "imersi",
  );
  const [rfs, setRfs] = useState(() =>
    localStorage.getItem("sela.rfs") ? +localStorage.getItem("sela.rfs") : 18,
  );
  const [setOpen, setSetOpen] = useState(false);
  const [pop, setPop] = useState(null);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);
  const [spk, setSpk] = useState(false);
  const show = useAutoHide();
  const restored = useRef(false);
  const speaking = useRef(false);

  useEffect(() => {
    localStorage.setItem("sela.rfs", String(rfs));
    document.documentElement.style.setProperty("--rfs", rfs + "px");
  }, [rfs]);

  useEffect(() => {
    document.documentElement.style.scrollSnapType =
      mode === "lambat" ? "y proximity" : "";
    return () => {
      document.documentElement.style.scrollSnapType = "";
    };
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
  }, [chap]);

  useEffect(() => {
    if (!book || restored.current) return;
    restored.current = true;
    const p = progress[book.id];
    if (p && !sp.get("bab") && p.chap === chap && p.pct > 3 && p.pct < 98) {
      setTimeout(
        () =>
          window.scrollTo(
            0,
            ((document.body.scrollHeight - innerHeight) * p.pct) / 100,
          ),
        100,
      );
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      if (document.visibilityState === "visible") logRead(15);
    }, 15000);
    return () => clearInterval(iv);
    // eslint-disable-next-line
  }, []);

  useEffect(() => () => speechSynthesis.cancel(), []);

  if (!book)
    return (
      <div className="mx-auto px-5 py-24 max-w-[68ch] text-center">
        <p className="font-display text-2xl">Buku tidak ditemukan.</p>
        <Link to="/jelajah" className="mt-4 btn btn-o">
          Kembali ke Jelajah
        </Link>
      </div>
    );

  const onTap = (data) => {
    if (data.name || data.arti || data.para) setPop(data);
  };
  const doHighlight = () => {
    const raw = (pop.para || "")
      .replace(/<[^>]+>/g, "")
      .replace(/[{}]/g, "")
      .trim();
    if (raw)
      addHighlight({
        book: book.judul,
        bookSlug: book.slug,
        chap,
        chapTitle: book.bab[chap].judul,
        text: raw.slice(0, 240),
      });
    setPop(null);
  };
  const speak = () => {
    if (speaking.current) {
      speechSynthesis.cancel();
      speaking.current = false;
      setSpk(false);
      return;
    }
    const text = book.bab[chap].isi
      .map((b) =>
        typeof b.v === "string"
          ? b.v.replace(/\{|\}|<[^>]+>/g, "")
          : (b.v || "").join?.(" ") || "",
      )
      .join(". ");
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "id-ID";
    u.rate = 0.95;
    u.onend = () => {
      speaking.current = false;
      setSpk(false);
    };
    speaking.current = true;
    setSpk(true);
    speechSynthesis.speak(u);
  };
  const seek = (p) =>
    window.scrollTo(0, (document.body.scrollHeight - innerHeight) * p);

  return (
    <div className="pb-24">
      <ReaderShell
        show={show && !pop}
        book={book}
        chap={chap}
        setChap={setChap}
        pct={pct}
        onSettings={() => setSetOpen(true)}
        mode={mode}
        onSpeak={speak}
        speaking={spk}
      />
      <Minimap pct={pct} onSeek={seek} />
      <article className="px-5 pt-24">
        <ContentRenderer book={book} chap={chap} mode={mode} onTap={onTap} />
        <EndOfChapter
          book={book}
          chap={chap}
          done={done}
          onNext={() => setChap((c) => Math.min(c + 1, book.bab.length - 1))}
          onFinish={() => {
            finishBook(book.id);
            setDone(true);
            saveProgress(book.id, chap, 100);
          }}
        />
      </article>
      <PopoverKata
        data={pop}
        onClose={() => setPop(null)}
        onHighlight={doHighlight}
      />
      <SettingsDrawer
        open={setOpen}
        onClose={() => setSetOpen(false)}
        mode={mode}
        setMode={setMode}
        rfs={rfs}
        setRfs={setRfs}
      />
    </div>
  );
}
