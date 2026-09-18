import { Link } from "react-router";
import Cover from "./Cover";
import { G2M2, MODE, ACC } from "../data/books";
import { useApp } from "../context/AppContext";

export default function BookCard({ book }) {
  const { progress, views } = useApp();
  const p = progress[book.id];
  const hits = views[book.slug] || 0;
  const fmtHits =
    hits >= 1000 ? (hits / 1000).toFixed(1).replace(".0", "") + " rb" : hits;
  const c = ACC[book.genre] || ACC.Umum;

  return (
    <Link
      to={`/buku/${book.slug}`}
      className="group relative bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.14)] p-3 transition-all hover:-translate-y-1 duration-300 fadein">
      {/* pita warna genre tipis di atas sampul */}
      <div className="relative">
        <span
          className="-top-1 right-3 left-3 z-10 absolute opacity-0 group-hover:opacity-100 rounded-full h-1 transition-opacity"
          style={{ background: c }}
        />
        <Cover book={book} className="w-full aspect-[3/4]" />
      </div>

      <div className="pt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold leading-snug">
            {book.judul}
          </h3>
          {book.custom && (
            <span className="bg-accent/15 px-1.5 py-0.5 rounded text-[10px] text-accent uppercase tracking-wider shrink-0">
              {book.custom}
            </span>
          )}
          {book.eksklusif && (
            <span className="bg-[#F6D860]/20 px-1.5 py-0.5 rounded text-[#8a6d1d] text-[9px] uppercase tracking-wider shrink-0">
              Eksklusif
            </span>
          )}
        </div>
        <p className="mt-0.5 text-ink2 text-xs">
          {book.penulis} · {book.genre}
        </p>

        {p ? (
          <div className="mt-2">
            <div className="bg-line rounded h-1 overflow-hidden">
              <div
                className="bg-accent h-full"
                style={{ width: `${p.pct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-ink2">
              {Math.round(p.pct)}% dibaca · {fmtHits} pembaca
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-ink2">
            {MODE[G2M2[book.genre] || "imersi"].n} · {fmtHits} pembaca
          </p>
        )}
      </div>
    </Link>
  );
}
