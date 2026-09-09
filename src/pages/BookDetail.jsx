import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import Cover from "../components/Cover";
import { G2M2, MODE, ACC } from "../data/books";
import NotFound from "./NotFound";
import { fmtMin, fmtDate } from "../lib/utils";

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

function Avatar({ r }) {
  const init = (r.admin ? "T" : r.nama[0]).toUpperCase();
  return (
    <span className="relative shrink-0">
      <span
        className={`w-9 h-9 rounded-full grid place-items-center text-xs font-display font-bold ${r.admin ? "bg-accent text-white" : "bg-ink text-paper"}`}>
        {init}
      </span>
      {r.admin && (
        <span
          className="-top-1 -right-1 absolute place-items-center grid bg-ink border-2 border-paper rounded-full text-paper"
          style={{ width: 18, height: 18 }}
          title="Tim Sela">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
          </svg>
        </span>
      )}
    </span>
  );
}

function Identitas({ r }) {
  return r.admin ? (
    <span className="inline-flex items-center gap-1 font-semibold text-[13px] text-accent">
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
  const c = ACC[book.genre] || ACC.Umum;
  const m = MODE[G2M2[book.genre] || "imersi"];
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
      {/* HERO band berwarna genre */}
      <div
        className="relative -mx-5 sm:mx-0 rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${c}, #1A1815)` }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative p-7 md:p-9">
          <Link
            to="/jelajah"
            className="text-[11px] text-white/60 hover:text-white uppercase tracking-[0.25em]">
            ← Jelajah
          </Link>
          <div className="flex sm:flex-row flex-col items-start gap-6 mt-4">
            <Cover
              book={book}
              big
              className="shadow-2xl ring-1 ring-white/10 w-36 aspect-[3/4] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-white text-2xl md:text-4xl leading-tight">
                {book.judul}
              </h1>
              <p className="mt-2 text-white/70 text-sm">
                {book.penulis} · {book.genre} · ~{fmtMin(book.durasi)} baca
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                <span className="inline-flex items-center gap-1.5 text-white/70">
                  <svg
                    width="14"
                    height="14"
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
                    <Bintang isi={Math.round(rata)} ukuran={13} />
                    <b className="text-white">{rata}</b>
                    <span className="text-white/60">
                      ({ulasan.length} ulasan)
                    </span>
                  </span>
                )}
                <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/80 uppercase tracking-wider">
                  {m.n}
                </span>
              </div>
              <p className="mt-4 max-w-xl text-white/80 text-sm leading-relaxed">
                {book.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AKSI */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={() => nav(`/baca/${book.slug}`)} className="btn btn-p">
          {p ? `Lanjut bab ${(p.chap ?? 0) + 1} →` : "Baca sekarang — gratis"}
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
        <div className="mt-6">
          <div className="flex justify-between mb-1 text-[11px] text-ink2">
            <span>Progres kamu</span>
            <span>{Math.round(p.pct)}%</span>
          </div>
          <div className="bg-line rounded h-2 overflow-hidden">
            <div
              className="bg-accent h-full transition-all"
              style={{ width: `${p.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* MODE INFO */}
      <div className="flex items-center gap-3 mt-6 p-4 text-sm card">
        <span className="text-lg">📖</span>
        <div>
          <b>{m.n}</b> <span className="text-ink2">— {m.d}</span>
        </div>
      </div>

      {/* DAFTAR ISI */}
      <section className="mt-10">
        <p className="mb-3 lbl">Daftar isi</p>
        <div className="divide-y divide-line overflow-hidden card">
          {book.bab.map((ch, i) => {
            const prev =
              ch.isi
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
                    {ch.judul}
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

      {/* RATING & ULASAN */}
      <section className="mt-12 pb-10">
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
                <Avatar r={r} />
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
