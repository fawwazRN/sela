import { Link } from "react-router";
import Cover from "./Cover";
import { G2M, MODE } from "../data/books";
import { useApp } from "../context/AppContext";

export default function BookCard({ book }) {
  const { progress } = useApp();
  const p = progress[book.id];
  return (
    <Link
      to={`/buku/${book.slug}`}
      className="group p-3 hover:border-ink transition-colors card fadein">
      <Cover book={book} className="w-full aspect-[3/4]" />
      <div className="pt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold decoration-line group-hover:underline underline-offset-4 leading-snug">
            {book.judul}
          </h3>
          {book.custom && (
            <span className="bg-accent/15 px-1.5 py-0.5 rounded text-[10px] text-accent uppercase tracking-wider shrink-0">
              {book.custom}
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
              {Math.round(p.pct)}% dibaca
            </p>
          </div>
        ) : (
          <p className="mt-2 text-[11px] text-ink2">
            {MODE[G2M[book.genre] || "imersi"].n} · ~{book.durasi} mnt
          </p>
        )}
      </div>
    </Link>
  );
}
