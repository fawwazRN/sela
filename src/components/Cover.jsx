import { ACC } from "../data/books";

export default function Cover({ book, className = "", big = false }) {
  const c = ACC[book.genre] || ACC.Umum;
  return (
    <div
      className={`relative overflow-hidden rounded-xl shrink-0 ${className}`}
      style={{
        background: `linear-gradient(160deg, ${c}, ${c}cc 55%, #1A1815)`,
      }}>
      <div className="top-0 bottom-0 left-0 absolute bg-black/25 w-1.5" />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <span className="lbl" style={{ color: "#ffffff88" }}>
          {book.genre}
        </span>
        <span
          className={`font-display font-semibold text-white leading-tight ${big ? "text-3xl" : "text-lg"}`}
          style={{ textShadow: "0 1px 8px rgba(0,0,0,.35)" }}>
          {book.judul}
        </span>
      </div>
    </div>
  );
}
