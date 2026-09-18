import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";
import Cover from "../components/Cover";
import { GENRES_LIST, G2M2, MODE, ACC } from "../data/books";
import { fmtMin } from "../lib/utils";

const URUT = [
  ["populer", "Terpopuler"],
  ["rating", "Rating tertinggi"],
  ["judul", "Judul A–Z"],
  ["baru", "Terbaru ditambah"],
  ["lama", "Durasi terpendek"],
];

function Bars({ isi, ukuran = 12 }) {
  const p =
    "M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={ukuran} height={ukuran} viewBox="0 0 24 24">
          <path
            d={p}
            fill={i <= isi ? "#B3402A" : "none"}
            stroke="#B3402A"
            strokeWidth="1.6"
          />
        </svg>
      ))}
    </span>
  );
}

export default function Jelajah() {
  const { books, views, progress, fetchReviews, priorSlugs } = useApp();
  const [sp, setSp] = useSearchParams();
  const genre = sp.get("genre") || "Semua";
  const mode = sp.get("mode") || "Semua";
  const urut = sp.get("urut") || "populer";
  const tampil = sp.get("tampil") || "grid";
  const [q, setQ] = useState("");
  const [ratings, setRatings] = useState({});

  useMemo(() => {
    Promise.all(
      books.map(async (b) => {
        const rs = await fetchReviews(b.slug);
        if (rs.length)
          return [b.slug, rs.reduce((a, r) => a + r.bintang, 0) / rs.length];
        return null;
      }),
    ).then((arr) => {
      const m = {};
      arr.filter(Boolean).forEach(([s, v]) => (m[s] = v));
      setRatings(m);
    });
  }, [books.length]);

  const setParam = (k, v, def) => {
    const next = new URLSearchParams(sp);
    if (!v || v === def) next.delete(k);
    else next.set(k, v);
    setSp(next);
  };
  const hapusFilter = (k) => setParam(k, null, null);

  const list = useMemo(() => {
    let out = books.filter(
      (b) =>
        (genre === "Semua" || b.genre === genre) &&
        (mode === "Semua" || (G2M2[b.genre] || "imersi") === mode) &&
        (!q || (b.judul + b.penulis).toLowerCase().includes(q.toLowerCase())),
    );
    /* prioritas: buku milik penulis Plus aktif melompat ke atas */
    const skor = (b) =>
      (priorSlugs.includes(b.slug) ? 1e9 : 0) + (views[b.slug] || 0);
    if (urut === "populer") out = [...out].sort((a, b) => skor(b) - skor(a));
    if (urut === "rating")
      out = [...out].sort(
        (a, b) => (ratings[b.slug] || 0) - (ratings[a.slug] || 0),
      );
    if (urut === "judul")
      out = [...out].sort((a, b) => a.judul.localeCompare(b.judul));
    if (urut === "lama") out = [...out].sort((a, b) => a.durasi - b.durasi);
    return out;
  }, [books, genre, mode, urut, q, views, ratings, priorSlugs]);

  const filterAktif = [
    genre !== "Semua" && { k: "genre", label: genre },
    mode !== "Semua" && { k: "mode", label: MODE[mode]?.n || mode },
    urut !== "populer" && {
      k: "urut",
      label: URUT.find((u) => u[0] === urut)?.[1],
    },
  ].filter(Boolean);

  const hitungGenre = (g) =>
    g === "Semua" ? books.length : books.filter((b) => b.genre === g).length;
  const totalViews = books.reduce((a, b) => a + (views[b.slug] || 0), 0);

  const fmtViews = (n) =>
    n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + " rb" : n;

  return (
    <div className="mx-auto px-5 pt-12 max-w-6xl fadein">
      {/* ===== HERO ===== */}
      <div
        className="relative mb-8 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #B3402A 0%, #5B4B8A 55%, #1A1815 100%)",
        }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #F7F3EA 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="hidden top-1/2 right-6 absolute lg:flex gap-3 opacity-25 -translate-y-1/2 pointer-events-none">
          {[
            ["K", "#F6D860"],
            ["M", "#9AD1D4"],
            ["S", "#F4A9A0"],
          ].map(([h, c], i) => (
            <div
              key={i}
              className="place-items-center grid shadow-2xl rounded-md w-16 h-24 font-display font-bold text-ink text-xl"
              style={{ background: c, transform: `rotate(${(i - 1) * 8}deg)` }}>
              {h}
            </div>
          ))}
        </div>
        <div className="relative p-8 md:p-10">
          <p className="text-[11px] text-white/60 uppercase tracking-[0.3em]">
            Katalog Sela
          </p>
          <h1 className="mt-2 font-display font-bold text-white text-3xl md:text-5xl">
            Jelajah
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-white/70 text-sm">
            <span>
              <b className="text-white">{books.length}</b> buku
            </span>
            <span>
              <b className="text-white">{fmtViews(totalViews)}</b> total
              pembacaan
            </span>
            <span>
              <b className="text-white">{Object.keys(ratings).length}</b> buku
              dinilai pembaca
            </span>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul atau penulis…"
            className="bg-white/95 mt-5 px-4 py-3 rounded-xl outline-none w-full max-w-md text-gray-900 placeholder:text-gray-700/70 text-sm"
          />
        </div>
      </div>

      {/* ===== FILTER BAR (sticky) ===== */}
      <div className="top-14 z-20 sticky flex flex-wrap items-center gap-2 bg-paper/95 shadow-md backdrop-blur-md p-3 border border-line rounded-xl">
        <select
          value={urut}
          onChange={(e) => setParam("urut", e.target.value, "populer")}
          className="!py-1.5 !w-auto text-xs inp">
          {URUT.map(([v, n]) => (
            <option key={v} value={v}>
              {n}
            </option>
          ))}
        </select>
        <div className="bg-line w-px h-5" />
        <select
          value={mode}
          onChange={(e) => setParam("mode", e.target.value, "Semua")}
          className="!py-1.5 !w-auto text-xs inp">
          <option value="Semua">Semua mode</option>
          {["fokus", "imersi", "linimasa", "lambat", "ceria"].map((m) => (
            <option key={m} value={m}>
              {MODE[m].n}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <div className="flex border border-line rounded-lg overflow-hidden text-xs">
          {[
            ["grid", "Grid"],
            ["list", "Daftar"],
          ].map(([v, n]) => (
            <button
              key={v}
              onClick={() => setParam("tampil", v, "grid")}
              className={`px-3 py-1.5 ${tampil === v ? "bg-ink text-paper" : "text-ink2 hover:text-ink"}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* chip genre */}
      <div className="flex flex-wrap gap-2 mt-3">
        {["Semua", ...GENRES_LIST].map((g, i) => (
          <button
            key={g}
            onClick={() => setParam("genre", g, "Semua")}
            className={`chip !px-3 !py-1.5 ${genre === g ? "chip-on" : ""}`}>
            {g}
            {i > 0 && <span className="opacity-50 ml-1">{hitungGenre(g)}</span>}
          </button>
        ))}
      </div>

      {/* filter aktif */}
      {filterAktif.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-ink2">Filter aktif:</span>
          {filterAktif.map((f) => (
            <button
              key={f.k}
              onClick={() => hapusFilter(f.k)}
              className="!py-1 chip chip-on">
              {f.label} ✕
            </button>
          ))}
          <button
            onClick={() => setSp({})}
            className="text-ink2 hover:text-accent underline underline-offset-4">
            reset semua
          </button>
        </div>
      )}

      {/* ===== HASIL ===== */}
      {tampil === "grid" ? (
        <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 pb-6">
          {list.map((b) => {
            const r = ratings[b.slug];
            return (
              <div key={b.id} className="relative">
                <BookCard book={b} />
                {r && (
                  <span className="inline-flex top-4 right-4 absolute items-center gap-1 bg-paper/90 px-2 py-0.5 border border-line rounded-full font-semibold text-[10px]">
                    <Bars isi={Math.round(r)} ukuran={9} /> {r.toFixed(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 mt-6 pb-6">
          {list.map((b) => {
            const r = ratings[b.slug];
            const p = progress[b.id];
            const c = ACC[b.genre] || ACC.Umum;
            return (
              <Link
                key={b.id}
                to={`/buku/${b.slug}`}
                className="relative flex items-center gap-4 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-3 border border-line hover:border-ink rounded-2xl overflow-hidden transition-colors">
                <span
                  className="top-0 bottom-0 left-0 absolute w-1"
                  style={{ background: c }}
                />
                <Cover book={b} className="w-12 aspect-[3/4]" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold truncate">
                    {b.judul}
                    {b.eksklusif && (
                      <span className="bg-[#F6D860]/20 ml-2 px-1.5 py-0.5 rounded text-[#8a6d1d] text-[9px] uppercase tracking-wider">
                        Eksklusif
                      </span>
                    )}
                  </p>
                  <p className="text-ink2 text-xs">
                    {b.penulis} · {b.genre}
                  </p>
                  <p className="mt-1 text-[11px] text-ink2 line-clamp-1">
                    {b.desc}
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 text-[11px] text-ink2 shrink-0">
                  <span>{fmtMin(b.durasi)}</span>
                  {r && (
                    <span className="inline-flex items-center gap-1">
                      <Bars isi={Math.round(r)} ukuran={10} /> {r.toFixed(1)}
                    </span>
                  )}
                  <span>{views[b.slug] || 0} pembaca</span>
                  {p && (
                    <span className="text-accent">
                      {Math.round(p.pct)}% dibaca
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {list.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-display text-xl">Tidak ada buku yang cocok.</p>
          <p className="mt-2 text-ink2 text-sm">
            Coba longgarkan filtermu, atau{" "}
            <button
              onClick={() => setSp({})}
              className="text-accent underline underline-offset-4">
              reset semua
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}
