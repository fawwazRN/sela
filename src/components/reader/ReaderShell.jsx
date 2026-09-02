import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export function useAutoHide() {
  const [show, setShow] = useState(true);
  const t = useRef(null);
  useEffect(() => {
    const wake = () => {
      setShow(true);
      clearTimeout(t.current);
      t.current = setTimeout(() => setShow(false), 2600);
    };
    wake();
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    window.addEventListener("touchstart", wake);
    return () => {
      window.removeEventListener("mousemove", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("touchstart", wake);
      clearTimeout(t.current);
    };
  }, []);
  return show;
}

export default function ReaderShell({
  show,
  book,
  chap,
  setChap,
  pct,
  onSettings,
  mode,
  onSpeak,
  speaking,
}) {
  const c = book.bab[chap];
  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="bg-paper/90 backdrop-blur border-line border-b">
          <div className="flex items-center gap-3 mx-auto px-4 py-2.5 max-w-4xl">
            <Link
              to={`/buku/${book.slug}`}
              className="!px-3 !py-1.5 text-xs btn btn-o shrink-0">
              ← Keluar
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{book.judul}</p>
              <p className="text-[11px] text-ink2 truncate">{c.judul}</p>
            </div>
            {mode === "ceria" && (
              <button
                onClick={onSpeak}
                className="!px-3 !py-1.5 text-xs btn btn-o shrink-0">
                {speaking ? "■ Stop" : "🔊 Bacakan"}
              </button>
            )}
            <select
              value={chap}
              onChange={(e) => setChap(+e.target.value)}
              className="hidden sm:block !py-1.5 !w-auto text-xs inp">
              {book.bab.map((b, i) => (
                <option key={i} value={i}>
                  Bab {i + 1} — {b.judul}
                </option>
              ))}
            </select>
            <button
              onClick={onSettings}
              className="!px-3 !py-1.5 text-xs btn btn-o shrink-0">
              Aa
            </button>
          </div>
          <div className="bg-line h-0.5">
            <div
              className="bg-accent h-full"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
      </header>
      <footer
        className={`fixed bottom-0 inset-x-0 z-40 transition-transform duration-300 ${show ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-paper/90 backdrop-blur border-line border-t">
          <div className="flex justify-between items-center mx-auto px-4 py-2.5 max-w-4xl">
            <button
              disabled={chap === 0}
              onClick={() => setChap(chap - 1)}
              className="disabled:opacity-30 !px-3 !py-1.5 text-xs btn btn-o">
              ← Sebelumnya
            </button>
            <span className="text-[11px] text-ink2">
              {Math.round(pct * 100)}% · bab {chap + 1}/{book.bab.length}
            </span>
            <button
              disabled={chap === book.bab.length - 1}
              onClick={() => setChap(chap + 1)}
              className="disabled:opacity-30 !px-3 !py-1.5 text-xs btn btn-o">
              Berikutnya →
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
