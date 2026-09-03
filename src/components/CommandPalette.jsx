import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const PAGES = [
  { label: "Beranda", to: "/" },
  { label: "Jelajah", to: "/jelajah" },
  { label: "Rak saya", to: "/saya" },
  { label: "Highlight & Flashcard", to: "/saya/highlight" },
  { label: "Statistik", to: "/saya/statistik" },
  { label: "Pengaturan", to: "/saya/pengaturan" },
  { label: "Impor buku", to: "/impor" },
  { label: "Studio", to: "/studio" },
  { label: "Masuk", to: "/masuk" },
  { label: "Cara buat buku (tutorial)", to: "/tutorial" },
];

export default function CommandPalette({ open, onClose }) {
  const { books } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inp = useRef(null);
  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => inp.current?.focus(), 10);
    }
  }, [open]);

  const items = useMemo(() => {
    const s = q.toLowerCase().trim();
    const pages = PAGES.filter(
      (p) => !s || p.label.toLowerCase().includes(s),
    ).map((p) => ({ ...p, kind: "Halaman", sub: null }));
    const bk = books
      .flatMap((b) => [
        {
          kind: "Buku",
          label: b.judul,
          sub: `${b.penulis} · ${b.genre}`,
          to: `/buku/${b.slug}`,
        },
        ...b.bab.map((c, ci) => ({
          kind: "Bab",
          label: c.judul,
          sub: b.judul,
          to: `/baca/${b.slug}?bab=${ci}`,
        })),
      ])
      .filter((x) => !s || (x.label + (x.sub || "")).toLowerCase().includes(s));
    const all = [...pages, ...bk];
    return s ? all.slice(0, 12) : [...pages.slice(0, 5), ...bk.slice(0, 7)];
  }, [q, books]);
  useEffect(() => setI(0), [q]);
  if (!open) return null;

  const go = (it) => {
    onClose();
    nav(it.to);
  };
  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-start bg-black/40 px-4 pt-[12vh]"
      onClick={onClose}>
      <div
        className="shadow-2xl w-full max-w-xl overflow-hidden card fadein"
        onClick={(e) => e.stopPropagation()}>
        <input
          ref={inp}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setI((v) => Math.min(v + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setI((v) => Math.max(v - 1, 0));
            }
            if (e.key === "Enter" && items[i]) go(items[i]);
          }}
          placeholder="Cari buku, bab, atau halaman…"
          className="bg-transparent px-5 py-4 outline-none w-full placeholder:text-ink2/60 text-base"
        />
        <div className="p-1.5 border-line border-t max-h-80 overflow-y-auto">
          {items.length === 0 && (
            <p className="px-4 py-6 text-ink2 text-sm text-center">
              Tidak ada hasil untuk “{q}”.
            </p>
          )}
          {items.map((it, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setI(idx)}
              onClick={() => go(it)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left ${idx === i ? "bg-line/60" : ""}`}>
              <span className="w-20 text-[10px] text-ink2/70 truncate uppercase tracking-wider shrink-0">
                {it.kind}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm truncate">{it.label}</span>
                {it.sub && (
                  <span className="block text-ink2 text-xs truncate">
                    {it.sub}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
