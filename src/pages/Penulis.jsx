import { useParams, Link } from "react-router";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";
import NotFound from "./NotFound";

export default function Penulis() {
  const { nama } = useParams();
  const { books, views, priorSlugs } = useApp();
  const dnama = decodeURIComponent(nama || "");

  const karya = books
    .filter((b) => b.penulis === dnama)
    .sort((a, b) => (views[b.slug] || 0) - (views[a.slug] || 0));

  if (!karya.length) return <NotFound />;

  const totalPembaca = karya.reduce((a, b) => a + (views[b.slug] || 0), 0);
  const totalBab = karya.reduce((a, b) => a + b.bab.length, 0);
  const plus = karya.some((b) => priorSlugs.includes(b.slug));
  const genreKhas = [...new Set(karya.map((b) => b.genre))].slice(0, 3);

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-4xl fadein">
      {/* PROFIL */}
      <div className="flex items-center gap-5">
        <span className="place-items-center grid bg-ink rounded-full w-16 h-16 font-display font-bold text-paper text-2xl shrink-0">
          {dnama[0].toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display font-bold text-2xl md:text-3xl">
              {dnama}
            </h1>
            {plus && (
              <span className="bg-[#F6D860]/20 px-2 py-0.5 rounded-full font-semibold text-[#8a6d1d] text-[10px] uppercase tracking-wider">
                Penulis Sela Plus
              </span>
            )}
          </div>
          <p className="mt-1 text-ink2 text-sm">
            {karya.length} buku · {totalBab} bab · {totalPembaca} pembaca
            terkumpul
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {genreKhas.map((g) => (
              <span key={g} className="!cursor-default chip">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-line mt-8 h-px" />

      {/* KARYA */}
      <p className="mt-6 mb-4 lbl">Karya ({karya.length})</p>
      <div className="gap-4 grid grid-cols-2 md:grid-cols-3 pb-6">
        {karya.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>

      <p className="mt-6 text-ink2 text-sm text-center">
        Penulis di Sela{" "}
        <Link
          to="/premium"
          className="text-accent underline underline-offset-4">
          Sela Plus
        </Link>{" "}
        mendapat halaman seperti ini, analitik pembaca, dan prioritas katalog.
      </p>
    </div>
  );
}
