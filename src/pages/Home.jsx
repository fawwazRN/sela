import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";
import Cover from "../components/Cover";
import { KURASI } from "../data/books";

export default function Home() {
  const { books, progress } = useApp();
  const entries = Object.entries(progress).sort(
    (a, b) => (b[1].at || 0) - (a[1].at || 0),
  );
  const last = entries.length
    ? books.find((b) => b.id === entries[0][0])
    : null;
  const featured = books.filter((b) => !b.custom).slice(0, 3);
  const baru = books.filter((b) => b.custom).slice(0, 4);

  return (
    <div className="mx-auto px-5 max-w-6xl">
      {last ? (
        <section className="pt-14 pb-2 fadein">
          <p className="mb-4 lbl">Lanjutkan membaca</p>
          <Link
            to={`/baca/${last.slug}`}
            className="flex items-center gap-5 p-5 hover:border-ink transition-colors card">
            <Cover book={last} className="w-16 aspect-[3/4]" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-lg truncate">
                {last.judul}
              </p>
              <p className="text-ink2 text-sm">
                Bab {(progress[last.id].chap ?? 0) + 1} ·{" "}
                {Math.round(progress[last.id].pct)}% selesai
              </p>
              <div className="bg-line mt-3 rounded max-w-xs h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-full"
                  style={{ width: `${progress[last.id].pct}%` }}
                />
              </div>
            </div>
            <span className="hidden sm:inline-flex btn btn-p">Lanjut →</span>
          </Link>
        </section>
      ) : (
        <section className="pt-20 pb-4 text-center fadein">
          <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Mulai baca.
            <br />
            <span className="text-accent">Tanpa daftar.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-ink2">
            Buku pelajaran yang bisa dikuisi, novel yang tak terganggu, puisi
            yang tidak diburu-buru. Semua gratis.
          </p>
          <div className="flex justify-center gap-3 mt-7">
            <Link to="/jelajah" className="btn btn-p">
              Jelajahi buku
            </Link>
            <Link to="/impor" className="btn btn-o">
              Impor EPUB/TXT
            </Link>
          </div>
        </section>
      )}

      <section className="pt-12">
        <div className="flex justify-between items-center mb-4">
          <p className="lbl">Buku unggulan</p>
          <Link to="/jelajah" className="text-ink2 hover:text-ink text-sm">
            Lihat semua →
          </Link>
        </div>
        <div className="gap-4 grid grid-cols-2 md:grid-cols-3">
          {featured.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      </section>

      {baru.length > 0 && (
        <section className="pt-12">
          <p className="mb-4 lbl">Baru ditambahkan — bukamu sendiri</p>
          <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
            {baru.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      <section className="pt-14">
        <p className="mb-4 lbl">Rak kurasi</p>
        <div className="gap-4 grid md:grid-cols-3">
          {KURASI.map((k) => (
            <Link
              key={k.slug}
              to={`/kurasi/${k.slug}`}
              className="p-5 hover:border-ink transition-colors card">
              <p className="font-display font-semibold text-lg">{k.judul}</p>
              <p className="mt-1 text-ink2 text-sm">{k.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="pt-16 pb-4">
        <p className="mb-4 lbl">Kenapa Sela</p>
        <div className="gap-4 grid md:grid-cols-3">
          {[
            [
              "Baca dulu, daftar nanti",
              "Semua buku bisa dibaca tanpa akun. Progres tersimpan di perangkatmu.",
            ],
            [
              "Setiap genre, tampil pas",
              "Pelajaran dapat kuis & diagram. Novel dapat mode imersi. Puisi dibaca pelan.",
            ],
            [
              "Tenang, tanpa gangguan",
              "Tanpa musik, tanpa iklan, tanpa notifikasi. Antarmuka menghilang saat kamu membaca.",
            ],
          ].map(([t, d]) => (
            <div key={t} className="p-5 card">
              <p className="font-display font-semibold">{t}</p>
              <p className="mt-1.5 text-ink2 text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
