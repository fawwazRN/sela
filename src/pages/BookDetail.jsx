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
    subs,
    warnaGenre,
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
  const c = warnaGenre(book.genre);
  const m = MODE[G2M2[book.genre] || "imersi"];
  const saved = shelf.simpan.includes(book.id);
  const bolehHapus = isAdmin || (user && book.owner === user.email);
  const bolehEdit =
    isAdmin || (user && book.owner === user.email) || !!subs?.plus;
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

  /* ===== unduh buku ke PDF bergaya (Sela Pro + izin penulis)
     Cara pakai: di dialog cetak, ganti Destination → "Save as PDF" ===== */
  const unduhPdf = () => {
    if (!book?.bab?.length) {
      alert("Buku ini belum punya bab untuk diunduh.");
      return;
    }

    const esc = (s) =>
      (s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const inline = (s) =>
      esc(s)
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\{([^}]+)\}/g, "$1");

    const blokKeHtml = (bl) => {
      if (!bl) return "";
      if (bl.t === "p") return `<p>${inline(bl.v)}</p>`;
      if (bl.t === "h")
        return (bl.lvl || 2) >= 3
          ? `<h3>${inline(bl.v)}</h3>`
          : `<h2>${inline(bl.v)}</h2>`;
      if (bl.t === "ul" && Array.isArray(bl.v))
        return `<ul>${bl.v.map((li) => `<li>${inline(li)}</li>`).join("")}</ul>`;
      if (bl.t === "pre") return `<pre><code>${esc(bl.v)}</code></pre>`;
      if (bl.t === "verse" && Array.isArray(bl.v))
        return `<div class="verse">${bl.v
          .map((l) => `<span>${inline(l)}</span>`)
          .join("")}</div>`;
      if (bl.t === "quote")
        return `<blockquote>${(Array.isArray(bl.v) ? bl.v : [])
          .map((q) =>
            typeof q === "string"
              ? `<p>${inline(q)}</p>`
              : `<p>${inline(q.text || "")}</p>`,
          )
          .join("")}</blockquote>`;
      if (bl.t === "table" && Array.isArray(bl.v) && bl.v.length)
        return `<table><thead><tr>${bl.v[0]
          .map((h) => `<th>${inline(h)}</th>`)
          .join("")}</tr></thead><tbody>${bl.v
          .slice(1)
          .map(
            (row) =>
              `<tr>${(row || [])
                .map((cl) => `<td>${inline(cl)}</td>`)
                .join("")}</tr>`,
          )
          .join("")}</tbody></table>`;
      return ""; /* diagram, tl, dll: dilewati */
    };

    const babHtml = book.bab
      .map((ch, i) => {
        const isi = (ch.isi || []).map(blokKeHtml).join("\n");
        return `<section class="bab">
  <p class="bab-no">Bab ${i + 1}</p>
  <h1>${esc(ch.judul)}</h1>
  ${isi || "<p><i>(Bab ini belum memiliki isi.)</i></p>"}
  ${ch.ringkasan ? `<div class="ringkasan"><b>Ringkasan bab</b><p>${esc(ch.ringkasan)}</p></div>` : ""}
</section>`;
      })
      .join("\n");

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(book.judul)}</title>
<style>
  @page { margin: 2cm; }
  body{font-family:Georgia,serif;color:#1A1815;max-width:640px;margin:48px auto;line-height:1.85;font-size:16px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .cover{text-align:center;padding:64px 0 40px;border-bottom:2px solid #1A1815;margin-bottom:40px;}
  .cover h1{font-size:34px;margin:8px 0;}
  .cover .penulis{letter-spacing:.3em;text-transform:uppercase;font-size:12px;color:#8a8578;}
  .bab{page-break-before:always;padding-top:24px;}
  .bab-no{letter-spacing:.35em;text-transform:uppercase;font-size:11px;color:#8a8578;margin:0;}
  h1{font-size:28px;line-height:1.25;margin:6px 0 26px;}
  h2{font-size:20px;margin:30px 0 10px;border-bottom:1px solid #e5decd;padding-bottom:6px;}
  h3{font-size:17px;margin:22px 0 8px;}
  p{margin:10px 0;}
  blockquote{border-left:3px solid #B3402A;margin:16px 0;padding:4px 0 4px 16px;font-style:italic;color:#4a463d;}
  pre{background:#F5F1E6;padding:14px;border-radius:10px;overflow-x:auto;font-size:13px;}
  code{font-family:Menlo,monospace;font-size:.9em;background:#F5F1E6;padding:1px 5px;border-radius:4px;}
  table{border-collapse:collapse;width:100%;margin:14px 0;font-size:14px;}
  th,td{border:1px solid #e5decd;padding:7px 10px;text-align:left;}
  th{background:#F5F1E6;}
  .verse{text-align:center;font-style:italic;margin:20px 0;}
  .verse span{display:block;}
  .ringkasan{margin-top:28px;background:#F5F1E6;border-radius:12px;padding:14px 18px;font-size:14px;}
  .ringkasan b{display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a8578;margin-bottom:6px;}
  .footer{margin-top:56px;padding-top:14px;border-top:1px solid #e5decd;text-align:center;font-size:12px;color:#8a8578;}
</style></head><body>
<div class="cover">
  <p class="penulis">${esc(book.genre)} · Sela</p>
  <h1>${esc(book.judul)}</h1>
  <p class="penulis">oleh ${esc(book.penulis)}</p>
</div>
 ${babHtml}
<p class="footer">Diunduh dari Sela — Sela Pro · Dukung penulis dengan ulasan</p>
<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},400);});</script>
</body></html>`;

    /* Blob URL: andal — konten terlihat di tab sebelum dialog cetak */
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      alert("Popup diblokir — izinkan popup untuk menyimpan PDF.");
      URL.revokeObjectURL(url);
      return;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
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
                <Link
                  to={`/penulis/${encodeURIComponent(book.penulis)}`}
                  className="text-white hover:underline underline-offset-4">
                  {book.penulis}
                </Link>{" "}
                · {book.genre} · ~{fmtMin(book.durasi)} baca
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
                {book.eksklusif && (
                  <span className="bg-[#F6D860]/20 px-2 py-1 rounded text-[#F6D860] text-[10px] uppercase tracking-wider">
                    Eksklusif
                  </span>
                )}
                {book.allowDownload && (
                  <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white/80 uppercase tracking-wider">
                    Bisa diunduh (Pro)
                  </span>
                )}
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
        {(() => {
          const pro = !!subs?.pro || isAdmin;
          const bolehUnduh =
            pro &&
            (!!book.allowDownload || isAdmin || book.owner === user?.email);
          if (!bolehUnduh) return null;
          const alasan = !book.allowDownload
            ? "Buku milikmu sendiri — unduhan tak terbatas"
            : "Sela Pro · penulis mengizinkan unduhan";
          return (
            <button onClick={unduhPdf} className="btn btn-o" title={alasan}>
              Unduh PDF
            </button>
          );
        })()}
        {bolehEdit && (
          <button
            onClick={() => nav("/studio")}
            className="!border-accent/40 !text-accent btn btn-o">
            Edit di Studio
          </button>
        )}
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
      <div className="flex items-center gap-3 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-6 p-4 border border-line rounded-2xl text-sm">
        <span className="text-lg">📖</span>
        <div>
          <b>{m.n}</b> <span className="text-ink2">— {m.d}</span>
        </div>
      </div>

      {/* DAFTAR ISI */}
      <section className="mt-10">
        <p className="mb-3 lbl">Daftar isi</p>
        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] border border-line rounded-2xl divide-y divide-line overflow-hidden">
          {book.bab.map((ch, i) => {
            const prev =
              ch.isi
                ?.find((b) => b.t === "p")
                ?.v?.replace(/\{|\}|<[^>]+>/g, "") || "";
            const terkunciBab =
              book.eksklusif &&
              !(isAdmin || !!subs?.plus || !!subs?.pro) &&
              i > 0;
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
                    {terkunciBab && (
                      <span className="ml-2 text-[#8a6d1d] text-[10px]">
                        🔒 Plus/Pro
                      </span>
                    )}
                  </span>
                  <span className="block opacity-0 group-hover:opacity-100 mt-0.5 text-ink2 text-sm transition-opacity">
                    {terkunciBab
                      ? "Terbuka untuk pemegang Sela Plus / Pro"
                      : prev.slice(0, 130)}
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

        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-5 border border-line rounded-2xl">
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
            <div
              key={r.id}
              className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
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
