import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";

const GENRES = [
  "Semua",
  "Pelajaran",
  "Fiksi",
  "Sejarah",
  "Puisi",
  "Anak",
  "Umum",
];

export default function Jelajah() {
  const { books } = useApp();
  const [sp, setSp] = useSearchParams();
  const genre = sp.get("genre") || "Semua";
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      books.filter(
        (b) =>
          (genre === "Semua" || b.genre === genre) &&
          (!q || (b.judul + b.penulis).toLowerCase().includes(q.toLowerCase())),
      ),
    [books, genre, q],
  );

  return (
    <div className="mx-auto px-5 pt-12 max-w-6xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">Jelajah</h1>
      <p className="mt-2 text-ink2">
        {list.length} buku · semuanya bisa dibaca sekarang.
      </p>
      <div className="flex flex-wrap items-center gap-2 mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari judul / penulis…"
          className="!w-56 inp"
        />
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSp(g === "Semua" ? {} : { genre: g })}
            className={`chip ${genre === g ? "chip-on" : ""}`}>
            {g}
          </button>
        ))}
      </div>
      <div className="gap-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 pb-4">
        {list.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
        {list.length === 0 && (
          <p className="col-span-full py-16 text-ink2 text-center">
            Tidak ada buku pada filter ini.
          </p>
        )}
      </div>
    </div>
  );
}
