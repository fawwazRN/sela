import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

const GRUP_HALAMAN = [
  {
    grup: "Halaman",
    items: [
      { label: "Beranda", to: "/", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
      { label: "Jelajah", to: "/jelajah", icon: "M4 6h16M4 12h16M4 18h10" },
      {
        label: "Glosarium",
        to: "/glosarium",
        icon: "M12 6.25c-2.5-2-6-2-8 0v11.5c2-2 5.5-2 8 0 2.5-2 6-2 8 0V6.25c-2-2-5.5-2-8 0",
      },
      {
        label: "Catatan",
        to: "/catatan",
        icon: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
      },
      {
        label: "Cara buat buku",
        to: "/tutorial",
        icon: "M12 6.25c-2.5-2-6-2-8 0v11.5c2-2 5.5-2 8 0 2.5-2 6-2 8 0V6.25c-2-2-5.5-2-8 0",
      },
    ],
  },
  {
    grup: "Untuk penulis",
    items: [
      {
        label: "Studio",
        to: "/studio",
        icon: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
      },
      {
        label: "Impor buku",
        to: "/impor",
        icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
      },
    ],
  },
  {
    grup: "Akun",
    items: [
      {
        label: "Rak saya",
        to: "/saya",
        icon: "M4 6h16v14H4z M8 6v14 M16 6v14",
      },
      {
        label: "Highlight & Flashcard",
        to: "/saya/highlight",
        icon: "M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z",
      },
      {
        label: "Statistik",
        to: "/saya/statistik",
        icon: "M4 20V10M10 20V4M16 20v-6",
      },
      {
        label: "Pengaturan",
        to: "/saya/pengaturan",
        icon: "M12 8a4 4 0 100 8 4 4 0 000-8z",
      },
    ],
  },
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

  /* flatten semua item dengan grupnya */
  const semua = useMemo(() => {
    const hal = GRUP_HALAMAN.flatMap((g) =>
      g.items.map((it) => ({ ...it, kind: "Halaman", grup: g.grup })),
    );
    const bk = books.flatMap((b) => [
      {
        label: b.judul,
        sub: `${b.penulis} · ${b.genre}`,
        to: `/buku/${b.slug}`,
        kind: "Buku",
        icon: null,
        grup: "Buku",
      },
      ...b.bab.map((c, ci) => ({
        label: c.judul,
        sub: b.judul,
        to: `/baca/${b.slug}?bab=${ci}`,
        kind: "Bab",
        icon: null,
        grup: "Bab",
      })),
    ]);
    return { hal, bk, all: [...hal, ...bk] };
  }, [books]);

  const hasil = useMemo(() => {
    const s = q.toLowerCase().trim();
    const cocok = (x) =>
      !s || (x.label + (x.sub || "")).toLowerCase().includes(s);
    const hal = semua.hal.filter(cocok);
    const bk = semua.bk.filter(cocok);
    return { hal, bk, all: [...hal, ...bk].slice(0, 14) };
  }, [q, semua]);

  const flat = hasil.all;
  useEffect(() => setI(0), [q]);

  if (!open) return null;

  const go = (it) => {
    onClose();
    nav(it.to);
  };

  /* render per grup dengan indeks global berjalan */
  let idx = -1;

  const Row = ({ it }) => {
    idx += 1;
    const my = idx;
    const aktip = my === i;
    return (
      <button
        onMouseEnter={() => setI(my)}
        onClick={() => go(it)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors ${aktip ? "bg-accent/10 ring-1 ring-accent/30" : "hover:bg-line/40"}`}>
        {it.icon ? (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className={`shrink-0 ${aktip ? "text-accent" : "text-ink2"}`}>
            <path d={it.icon} />
          </svg>
        ) : (
          <span
            className={`w-10 shrink-0 text-[9px] uppercase tracking-wider text-center px-1 py-0.5 rounded ${it.kind === "Buku" ? "bg-accent/15 text-accent" : "bg-line text-ink2"}`}>
            {it.kind}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-sm truncate">{it.label}</span>
          {it.sub && (
            <span className="block text-ink2 text-xs truncate">{it.sub}</span>
          )}
        </span>
        {aktip && <span className="kbd shrink-0">↵</span>}
      </button>
    );
  };

  const TidakAda = () => (
    <div className="py-10 text-center">
      <p className="font-display text-lg">Tidak ada hasil untuk “{q}”.</p>
      <p className="mt-1 text-ink2 text-xs">
        Coba kata kunci lain — atau jalan-jalan dulu ke Jelajah.
      </p>
    </div>
  );

  return (
    <div
      className="z-50 fixed inset-0 flex justify-center items-start bg-black/50 backdrop-blur-sm px-4 pt-[10vh]"
      onClick={onClose}>
      <div
        className="shadow-2xl w-full max-w-xl overflow-hidden card fadein"
        onClick={(e) => e.stopPropagation()}>
        {/* INPUT */}
        <div className="flex items-center gap-3 px-5 py-4 border-line border-b">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-ink2 shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inp}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setI((v) => Math.min(v + 1, flat.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setI((v) => Math.max(v - 1, 0));
              }
              if (e.key === "Enter" && flat[i]) go(flat[i]);
            }}
            placeholder="Cari buku, bab, atau halaman…"
            className="flex-1 bg-transparent outline-none placeholder:text-ink2/60 text-base"
          />
          <span className="kbd">esc</span>
        </div>

        {/* HASIL */}
        <div className="p-1.5 max-h-[55vh] overflow-y-auto">
          {flat.length === 0 ? (
            <TidakAda />
          ) : q ? (
            /* hasil pencarian: flat */
            flat.map((it) => <Row key={it.to + it.label} it={it} />)
          ) : (
            /* default: dikelompokkan */
            <>
              {hasil.hal.length > 0 && (
                <p className="px-4 pt-2 pb-1 !text-[9px] lbl">Halaman</p>
              )}
              {hasil.hal.slice(0, 5).map((it) => (
                <Row key={it.to} it={it} />
              ))}
              {hasil.bk.length > 0 && (
                <p className="px-4 pt-3 pb-1 !text-[9px] lbl">Buku & bab</p>
              )}
              {hasil.bk.slice(0, 9).map((it) => (
                <Row key={it.to + it.label} it={it} />
              ))}
            </>
          )}
        </div>

        {/* FOOTER HINT */}
        <div className="flex items-center gap-4 px-5 py-2.5 border-line border-t text-[10px] text-ink2">
          <span className="inline-flex items-center gap-1">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> navigasi
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="kbd">↵</span> buka
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="kbd">esc</span> tutup
          </span>
          <span className="flex-1" />
          <span className="font-display font-semibold">
            Sela<span className="text-accent">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
