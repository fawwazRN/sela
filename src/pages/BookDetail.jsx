import { useParams, Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import Cover from "../components/Cover";
import { G2M, MODE } from "../data/books";
import NotFound from "./NotFound";
import { fmtMin } from "../lib/utils";

export default function BookDetail() {
  const { slug } = useParams();
  const { getBook, progress, shelf, toggleShelf, isAdmin, removeBook, user } =
    useApp();
  const book = getBook(slug);
  const nav = useNavigate();
  if (!book) return <NotFound />;
  const p = progress[book.id];
  const m = MODE[G2M[book.genre] || "imersi"];
  const saved = shelf.simpan.includes(book.id);
  const bolehHapus = isAdmin || (user && book.owner === user.email);

  return (
    <div className="mx-auto px-5 pt-10 max-w-4xl fadein">
      <Link to="/jelajah" className="text-ink2 hover:text-ink text-sm">
        ← Jelajah
      </Link>
      <div className="flex sm:flex-row flex-col gap-8 mt-6">
        <Cover book={book} big className="w-44 aspect-[3/4]" />
        <div className="flex-1">
          <h1 className="font-display font-bold text-3xl md:text-4xl leading-tight">
            {book.judul}
          </h1>
          <p className="mt-2 text-ink2">
            {book.penulis} · {book.genre} · ~{fmtMin(book.durasi)} baca
            {book.custom && (
              <span className="bg-accent/15 ml-2 px-1.5 py-0.5 rounded text-[10px] text-accent uppercase align-middle tracking-wider">
                {book.custom}
              </span>
            )}
          </p>
          <p className="mt-4 leading-relaxed">{book.desc}</p>
          <span className="mt-4 !cursor-default chip">{m.n}</span>
          <p className="mt-1.5 text-ink2 text-sm">{m.d}</p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => nav(`/baca/${book.slug}`)}
              className="btn btn-p">
              {p
                ? `Lanjut bab ${(p.chap ?? 0) + 1} →`
                : "Baca sekarang — gratis"}
            </button>
            <button onClick={() => toggleShelf(book.id)} className="btn btn-o">
              {saved ? "★ Tersimpan" : "☆ Simpan"}
            </button>
            {bolehHapus && (
              <button
                onClick={() => {
                  if (confirm(`Hapus "${book.judul}" dari katalog?`)) {
                    removeBook(book.slug);
                    nav("/jelajah");
                  }
                }}
                className="!border-accent/40 !text-accent btn btn-o">
                🗑 Hapus buku
              </button>
            )}
          </div>

          {p && (
            <div className="bg-line mt-6 rounded max-w-sm h-1.5 overflow-hidden">
              <div
                className="bg-accent h-full"
                style={{ width: `${p.pct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <section className="mt-12">
        <p className="mb-3 lbl">Daftar isi — arahkan ke bab untuk pratinjau</p>
        <div className="divide-y divide-line overflow-hidden card">
          {book.bab.map((c, i) => {
            const prev =
              c.isi
                ?.find((b) => b.t === "p")
                ?.v?.replace(/\{|\}|<[^>]+>/g, "") || "";
            return (
              <Link
                key={i}
                to={`/baca/${book.slug}?bab=${i}`}
                className="group flex items-baseline gap-4 hover:bg-line/30 px-5 py-4 transition-colors">
                <span className="w-8 text-ink2 text-xs shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium group-hover:underline underline-offset-4">
                    {c.judul}
                  </span>
                  <span className="block opacity-0 group-hover:opacity-100 mt-0.5 text-ink2 text-sm transition-opacity">
                    {prev.slice(0, 130)}
                    {prev.length > 130 ? "…" : ""}
                  </span>
                </span>
                {p?.chap === i && (
                  <span className="ml-auto text-[11px] text-accent shrink-0">
                    terakhir dibaca
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
