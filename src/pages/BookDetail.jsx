import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import Cover from "../components/Cover";
import { G2M, MODE } from "../data/books";
import NotFound from "./NotFound";
import { fmtMin, fmtDate } from "../lib/utils";

/* ikon bintang SVG — tanpa emoji */
function Bintang({ isi = 0, ukuran = 16, interaktif, onSet, onHover }) {
  const p =
    "M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z";
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={ukuran}
          height={ukuran}
          viewBox="0 0 24 24"
          onClick={interaktif ? () => onSet(i) : undefined}
          onMouseEnter={interaktif ? () => onHover(i) : undefined}
          className={
            interaktif
              ? "cursor-pointer transition-transform hover:scale-110"
              : ""
          }>
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

/* identitas penulis ulasan: admin = "Tim Sela" berbintang, lainnya = nama sendiri */
function Identitas({ r }) {
  return r.admin ? (
    <span className="inline-flex items-center gap-1 font-semibold text-[13px] text-accent">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
      </svg>
      Tim Sela
    </span>
  ) : (
    <span className="font-medium text-[13px]">{r.nama}</span>
  );
}

export default function BookDetail() {
  const { slug } = useParams();
  const {
    getBook,
    progress,
    shelf,
    toggleShelf,
    isAdmin,
    removeBook,
    user,
    views,
    bumpView,
    fetchReviews,
    submitReview,
    deleteReview,
  } = useApp();
  const book = getBook(slug);
  const nav = useNavigate();

  const [ulasan, setUlasan] = useState(null);
  const [bintang, setBintang] = useState(0);
  const [hover, setHover] = useState(0);
  const [teks, setTeks] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (book) bumpView(book.slug);
  }, [book?.slug]);
  useEffect(() => {
    if (book) fetchReviews(book.slug).then(setUlasan);
  }, [book?.slug]);

  const rata = useMemo(() => {
    if (!ulasan?.length) return null;
    return (ulasan.reduce((a, r) => a + r.bintang, 0) / ulasan.length).toFixed(
      1,
    );
  }, [ulasan]);

  if (!book) return <NotFound />;
  const p = progress[book.id];
  const m = MODE[G2M[book.genre] || "imersi"];
  const saved = shelf.simpan.includes(book.id);
  const bolehHapus = isAdmin || (user && book.owner === user.email);
  const hits = views[book.slug] || 0;
  const fmtHits =
    hits >= 1000 ? (hits / 1000).toFixed(1).replace(".0", "") + " rb" : hits;

  const kirim = async () => {
    setMsg("");
    if (!bintang) {
      setMsg("Pilih bintang dulu.");
      return;
    }
    try {
      await submitReview(book.slug, bintang, teks);
      setUlasan(await fetchReviews(book.slug));
      setBintang(0);
      setTeks("");
      setMsg("✓ Terima kasih atas ulasannya!");
    } catch (e) {
      setMsg(e.message);
    }
    setTimeout(() => setMsg(""), 3000);
  };

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
          </p>

          {/* meta: views + rating rata-rata */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-ink2">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {fmtHits} pembaca
            </span>
            {rata && (
              <span className="inline-flex items-center gap-1.5">
                <Bintang isi={Math.round(rata)} ukuran={14} />
                <b>{rata}</b>
                <span className="text-ink2">({ulasan.length} ulasan)</span>
              </span>
            )}
          </div>

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
                  if (confirm(`Hapus "${book.judul}"?`)) {
                    removeBook(book.slug);
                    nav("/jelajah");
                  }
                }}
                className="!border-accent/40 !text-accent btn btn-o">
                Hapus buku
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

      {/* ===== DAFTAR ISI ===== */}
      <section className="mt-12">
        <p className="mb-3 lbl">Daftar isi</p>
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

      {/* ===== RATING & ULASAN ===== */}
      <section className="mt-12">
        <p className="mb-3 lbl">Rating & ulasan</p>

        <div className="p-5 card">
          {user ? (
            <>
              <p className="font-display font-semibold">
                Bagaimana buku ini menurutmu?
              </p>
              <div className="mt-2" onMouseLeave={() => setHover(0)}>
                <Bintang
                  isi={hover || bintang}
                  ukuran={28}
                  interaktif
                  onSet={setBintang}
                  onHover={setHover}
                />
              </div>
              <textarea
                value={teks}
                onChange={(e) => setTeks(e.target.value)}
                placeholder="Tulis ulasan singkat (opsional)…"
                className="mt-3 min-h-20 resize-none inp"
              />
              <div className="flex items-center gap-3 mt-3">
                <button onClick={kirim} className="text-xs btn btn-p">
                  Kirim ulasan
                </button>
                {msg && <span className="text-ink2 text-xs">{msg}</span>}
              </div>
            </>
          ) : (
            <p className="text-ink2 text-sm">
              <Link
                to="/masuk"
                className="text-accent underline underline-offset-4">
                Masuk
              </Link>{" "}
              untuk memberi rating & ulasan.
            </p>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {(ulasan || []).map((r) => (
            <div key={r.id} className="p-4 card">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full grid place-items-center text-xs font-display font-bold shrink-0 ${r.admin ? "bg-accent text-white" : "bg-ink text-paper"}`}>
                  {(r.admin ? "T" : r.nama[0]).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <Identitas r={r} />
                  <div className="flex items-center gap-2">
                    <Bintang isi={r.bintang} ukuran={12} />
                    <span className="text-[11px] text-ink2">
                      {fmtDate(r.created_at)}
                    </span>
                  </div>
                </div>
                {user && (isAdmin || r.email === user.email) && (
                  <button
                    onClick={() => {
                      if (confirm("Hapus ulasan ini?"))
                        deleteReview(r.id).then(() =>
                          fetchReviews(book.slug).then(setUlasan),
                        );
                    }}
                    className="text-accent text-xs hover:underline shrink-0">
                    hapus
                  </button>
                )}
              </div>
              {r.teks && (
                <p className="mt-2.5 text-[15px] leading-relaxed">{r.teks}</p>
              )}
            </div>
          ))}
          {ulasan && ulasan.length === 0 && (
            <p className="py-8 text-ink2 text-sm text-center">
              Belum ada ulasan. Jadilah yang pertama.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
