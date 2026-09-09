import { useMemo } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";
import Cover from "../components/Cover";
import { KURASI, G2M, MODE, ACC } from "../data/books";
import { today } from "../lib/storage";
import { fmtMin, fmtDate } from "../lib/utils";

function MiniBintang({ isi, ukuran = 12 }) {
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

function Ring({ p, size = 84 }) {
  const r = (size - 10) / 2,
    c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-line)"
        strokeWidth="7"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={`${p * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray .6s" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size / 4.6}
        fontWeight="700"
        fill="var(--c-ink)"
        fontFamily="Fraunces, Georgia, serif">
        {Math.round(p * 100)}%
      </text>
    </svg>
  );
}

export default function Home() {
  const {
    books,
    progress,
    shelf,
    finished,
    readlog,
    bookTime,
    goal,
    views,
    glos,
    user,
  } = useApp();

  /* ===== jaring aman angka ===== */
  const targetAman = Number(goal) > 0 ? Number(goal) : 20;
  const mntHariIni = Math.round((readlog[today()] || 0) / 60);
  const pTarget = Number.isFinite(mntHariIni / targetAman)
    ? Math.min(1, mntHariIni / targetAman)
    : 0;

  /* ---- lanjutkan membaca ---- */
  const entries = Object.entries(progress).sort(
    (a, b) => (b[1].at || 0) - (a[1].at || 0),
  );
  const last = entries.length
    ? books.find((b) => b.id === entries[0][0])
    : null;
  const lastP = last ? progress[last.id] : null;
  const mntLagi =
    last && last.durasi
      ? Math.max(1, Math.round((last.durasi * (100 - (lastP?.pct ?? 0))) / 100))
      : 0;

  /* ---- statistik ---- */
  const totalMnt = Object.values(readlog).reduce((a, b) => a + b, 0) / 60;
  const streak = (() => {
    let s = 0;
    const d = new Date();
    const has = (dt) => (readlog[dt.toISOString().slice(0, 10)] || 0) > 0;
    if (!has(d)) d.setDate(d.getDate() - 1);
    while (has(d)) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  })();
  const jmlSelesai = Object.keys(finished).length;

  const trending = useMemo(
    () =>
      [...books]
        .sort((a, b) => (views[b.slug] || 0) - (views[a.slug] || 0))
        .slice(0, 4),
    [books, views],
  );

  const featured = books.filter((b) => !b.custom).slice(0, 3);
  const baru = books.filter((b) => b.custom).slice(0, 4);
  const glosTerbaru = Object.entries(glos).slice(-4).reverse();
  const rakSimpan = shelf.simpan
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean)
    .slice(0, 4);
  const selesaiBaru = Object.entries(finished)
    .sort((a, b) => (b[1] > a[1] ? 1 : -1))
    .slice(0, 3)
    .map(([id]) => books.find((b) => b.id === id))
    .filter(Boolean);

  const fmtViews = (n) =>
    n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + " rb" : n;

  return (
    <div className="mx-auto px-5 max-w-6xl">
      {/* ===== LANJUTKAN / HERO ===== */}
      {last && lastP ? (
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
                Bab {(lastP.chap ?? 0) + 1} dari {last.bab.length} ·{" "}
                {Math.round(lastP.pct)}% selesai
                {mntLagi > 0 && ` · ±${fmtMin(mntLagi)} lagi`}
              </p>
              <div className="bg-line mt-3 rounded max-w-xs h-1.5 overflow-hidden">
                <div
                  className="bg-accent h-full"
                  style={{ width: `${lastP.pct}%` }}
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
            <Link to="/catatan" className="btn btn-o">
              Buka Catatan
            </Link>
          </div>
        </section>
      )}

      {/* ===== PANEL PRIBADI ===== */}
      <section className="gap-4 grid sm:grid-cols-2 pt-8 fadein">
        <div className="flex items-center gap-5 p-5 card">
          <Ring p={pTarget} />
          <div className="min-w-0">
            <p className="font-display font-semibold">Target hari ini</p>
            <p className="mt-0.5 text-ink2 text-sm">
              {mntHariIni} dari {targetAman} menit · streak{" "}
              <b className="text-ink">{streak} hari</b>
            </p>
            <Link
              to="/saya/statistik"
              className="inline-block mt-1 text-accent text-xs underline underline-offset-4">
              Lihat statistik →
            </Link>
          </div>
        </div>
        <div className="gap-2 grid grid-cols-3 p-5 text-center card">
          {[
            ["Total baca", fmtMin(totalMnt)],
            ["Buku selesai", jmlSelesai + ""],
            ["Di rak simpan", shelf.simpan.length + ""],
          ].map(([t, v]) => (
            <div key={t}>
              <p className="font-display font-bold text-2xl">{v}</p>
              <p className="mt-1 text-[11px] text-ink2">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      <section className="pt-12">
        <div className="flex justify-between items-center mb-4">
          <p className="lbl">Sedang ramai dibaca</p>
          <Link to="/jelajah" className="text-ink2 hover:text-ink text-sm">
            Lihat semua →
          </Link>
        </div>
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
          {trending.map((b, i) => (
            <Link
              key={b.id}
              to={`/buku/${b.slug}`}
              className="flex items-center gap-4 p-3 hover:border-ink transition-colors card">
              <span className="w-8 font-display font-bold text-ink2/50 text-2xl text-center shrink-0">
                {i + 1}
              </span>
              <Cover book={b} className="w-11 aspect-[3/4]" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{b.judul}</p>
                <p className="text-[11px] text-ink2">{b.penulis}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] text-ink2">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {fmtViews(views[b.slug] || 0)}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{
                      background: (ACC[b.genre] || ACC.Umum) + "18",
                      color: ACC[b.genre] || ACC.Umum,
                    }}>
                    {MODE[G2M[b.genre] || "imersi"].n}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== UNGGULAN ===== */}
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

      {/* ===== BARU ===== */}
      {baru.length > 0 && (
        <section className="pt-12">
          <p className="mb-4 lbl">Baru ditambahkan</p>
          <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
            {baru.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      {/* ===== SELESAI & SIMPAN ===== */}
      {(selesaiBaru.length > 0 || rakSimpan.length > 0) && (
        <section className="gap-4 grid md:grid-cols-2 pt-12">
          {selesaiBaru.length > 0 && (
            <div className="p-5 card">
              <p className="mb-3 lbl">Baru selesai dibaca</p>
              <div className="space-y-2">
                {selesaiBaru.map((b) => (
                  <div key={b.id} className="flex items-center gap-3">
                    <Cover book={b} className="w-8 aspect-[3/4]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{b.judul}</p>
                      <p className="text-[11px] text-ink2">
                        {finished[b.id] ? fmtDate(finished[b.id]) : ""}
                        {bookTime[b.id]
                          ? ` · ${fmtMin(Math.round(bookTime[b.id] / 60))} dibaca`
                          : ""}
                      </p>
                    </div>
                    <Link
                      to="/saya/statistik"
                      className="text-[11px] text-accent hover:underline shrink-0">
                      kartu →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
          {rakSimpan.length > 0 && (
            <div className="p-5 card">
              <p className="mb-3 lbl">Disimpan untuk nanti</p>
              <div className="flex flex-wrap gap-2">
                {rakSimpan.map((b) => (
                  <Link key={b.id} to={`/buku/${b.slug}`} className="chip">
                    {b.judul}
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-ink2">
                Kelola di{" "}
                <Link
                  to="/saya"
                  className="text-accent underline underline-offset-4">
                  Rak saya
                </Link>
                .
              </p>
            </div>
          )}
        </section>
      )}

      {/* ===== KURASI ===== */}
      <section className="pt-12">
        <p className="mb-4 lbl">Rak kurasi</p>
        <div className="gap-4 grid md:grid-cols-3">
          {KURASI.map((k) => {
            const contoh = k.ids
              .map((id) => books.find((b) => b.id === id))
              .filter(Boolean);
            return (
              <Link
                key={k.slug}
                to={`/kurasi/${k.slug}`}
                className="p-5 hover:border-ink transition-colors card">
                <p className="font-display font-semibold text-lg">{k.judul}</p>
                <p className="mt-1 text-ink2 text-sm">{k.desc}</p>
                <div className="flex -space-x-3 mt-4">
                  {contoh.map((b) => (
                    <Cover
                      key={b.id}
                      book={b}
                      className="ring-2 ring-paper w-9 aspect-[3/4]"
                    />
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ===== GLOSARIUM ===== */}
      <section className="pt-12">
        <div className="flex justify-between items-center mb-4">
          <p className="lbl">Dari glosarium pembaca</p>
          <Link to="/glosarium" className="text-ink2 hover:text-ink text-sm">
            Semua istilah →
          </Link>
        </div>
        <div className="gap-3 grid sm:grid-cols-2">
          {glosTerbaru.map(([k, v]) => (
            <div key={k} className="p-4 card">
              <p className="font-display font-semibold text-sm">{k}</p>
              <p className="mt-0.5 text-[13px] text-ink2">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== KENAPA SELA ===== */}
      <section className="pt-16 pb-4">
        <p className="mb-4 lbl">Kenapa Sela</p>
        <div className="gap-4 grid md:grid-cols-3">
          {[
            [
              "Baca dulu, daftar nanti",
              "Semua buku bisa dibaca tanpa akun. Bab 1 selalu bebas, progres tersimpan di perangkatmu.",
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

      {/* ===== CTA PENULIS ===== */}
      {!user && (
        <section className="pt-14 pb-10">
          <div className="p-8 text-center card">
            <p className="font-display font-bold text-2xl">
              Punya naskah sendiri?
            </p>
            <p className="mx-auto mt-2 max-w-md text-ink2 text-sm">
              Tulis buku interaktif di Studio atau impor Markdown — gratis, dan
              tampil di katalog bersama yang lain.
            </p>
            <div className="flex justify-center gap-3 mt-5">
              <Link to="/tutorial" className="btn btn-p">
                Cara membuat buku
              </Link>
              <Link to="/masuk" className="btn btn-o">
                Masuk
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
