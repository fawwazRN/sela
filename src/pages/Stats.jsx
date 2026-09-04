import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtMin, fmtDate } from "../lib/utils";
import { ACC } from "../data/books";

function drawCard(book, minutes, date, userName) {
  const W = 900, H = 500, padX = 60;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");

  /* latar + pita genre */
  x.fillStyle = "#F7F3EA"; x.fillRect(0, 0, W, H);
  x.fillStyle = ACC[book.genre] || ACC.Umum; x.fillRect(0, 0, 14, H);

  /* kop */
  x.fillStyle = "#6E675B";
  x.font = "600 17px Literata, Georgia";
  x.fillText("SELA · KARTU BACAAN", padX, 70);

  /* footer garis + info */
  x.strokeStyle = "#E4DCCB"; x.lineWidth = 1;
  x.beginPath(); x.moveTo(padX, H - 130); x.lineTo(W - padX, H - 130); x.stroke();

  const teksWaktu = (minutes != null && minutes > 0)
    ? `${fmtMin(minutes)} dibaca`
    : `≈ ${fmtMin(book.durasi)} · durasi buku`;
  x.fillStyle = "#1A1815";
  x.font = "600 24px Literata, Georgia";
  x.fillText(teksWaktu, padX, H - 88);

  /* nama pembaca — penghargaan personal */
  x.fillStyle = "#B3402A";
  x.font = "italic 600 21px Literata, Georgia";
  const nama = userName ? `Dibaca oleh ${userName}` : "Dibaca oleh pembaca anonim";
  x.fillText(nama, padX, H - 52);

  /* tanggal selesai di kanan bawah */
  x.fillStyle = "#6E675B";
  x.font = "400 18px Literata, Georgia";
  const tgl = `Selesai ${date}`;
  x.fillText(tgl, W - padX - x.measureText(tgl).width, H - 52);

  /* judul: shrink otomatis */
  const maxW = W - padX * 2;
  const zoneH = (H - 130) - 130 - 44;
  const wrap = (f) => {
    x.font = f;
    const out = []; let line = "";
    book.judul.split(" ").forEach((w) => {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > maxW && line) { out.push(line); line = w; }
      else line = t;
    });
    if (line) out.push(line);
    return out;
  };
  let size = 48, lines = wrap(`700 ${size}px Fraunces, Georgia`);
  for (; size >= 24; size -= 4) {
    lines = wrap(`700 ${size}px Fraunces, Georgia`);
    if (lines.length * size * 1.2 <= zoneH) break;
  }
  const lh = size * 1.2;
  while (lines.length * lh > zoneH && lines.length > 1) {
    lines.pop();
    lines[lines.length - 1] += " …";
  }
  x.fillStyle = "#1A1815";
  x.font = `700 ${size}px Fraunces, Georgia`;
  lines.forEach((l, i) => x.fillText(l, padX, 130 + size + i * lh));

  /* penulis & genre di bawah judul */
  x.fillStyle = "#6E675B";
  x.font = "400 20px Literata, Georgia";
  x.fillText(`${book.penulis} · ${book.genre}`, padX, 130 + size + lines.length * lh + 8);

  return cv.toDataURL("image/png");
}

export default function Stats() {
  const { readlog, finished, books, bookTime, user } = useApp();
  const total = Object.values(readlog).reduce((a, b) => a + b, 0);
  const has = (d) => (readlog[d.toISOString().slice(0, 10)] || 0) > 0;
  let streak = 0; const d = new Date();
  if (!has(d)) d.setDate(d.getDate() - 1);
  while (has(d)) { streak++; d.setDate(d.getDate() - 1); }

  const cells = [];
  for (let i = 83; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    cells.push({ key, m: readlog[key] || 0 });
  }
  const lvl = (m) => (m === 0 ? 0 : m < 600 ? 1 : m < 1800 ? 2 : m < 3600 ? 3 : 4);

  const doneBooks = Object.keys(finished).map((id) => books.find((b) => b.id === id)).filter(Boolean);
  const [preview, setPreview] = useState(null);
  const makeCard = (b) => {
    const menitAsli = bookTime[b.id] ? Math.round(bookTime[b.id] / 60) : null;
    const url = drawCard(b, menitAsli, fmtDate(finished[b.id]), user?.name);
    setPreview(url);
    const a = document.createElement("a");
    a.href = url; a.download = `kartu-${b.slug}.png`; a.click();
  };

  return (
    <div className="max-w-3xl mx-auto px-5 pt-12 fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">Statistik baca</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[["Total waktu", fmtMin(total / 60)], ["Hari beruntun", streak + " hari"], ["Buku selesai", doneBooks.length + " buku"]].map(([t, v]) => (
          <div key={t} className="card p-4 text-center">
            <p className="font-display font-bold text-2xl">{v}</p>
            <p className="text-[11px] text-ink2 mt-1">{t}</p>
          </div>
        ))}
      </div>

      <p className="lbl mt-10 mb-3">84 hari terakhir</p>
      <div className="card p-4">
        <div className="grid grid-cols-7 gap-1 w-fit">
          {cells.map((c) => (
            <div key={c.key} title={`${c.key}: ${Math.round(c.m / 60)} mnt`}
              className="w-3.5 h-3.5 rounded-sm"
              style={{ background: `color-mix(in srgb, var(--c-accent) ${lvl(c.m) * 22}%, var(--c-line))` }} />
          ))}
        </div>
      </div>

      <p className="lbl mt-10 mb-3">Kartu bacaan</p>
      <div className="space-y-3 pb-10">
        {doneBooks.map((b) => {
          const m = bookTime[b.id] ? Math.round(bookTime[b.id] / 60) : null;
          return (
            <div key={b.id} className="card p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.judul}</p>
                <p className="text-xs text-ink2">
                  Selesai {fmtDate(finished[b.id])}
                  {m != null ? ` · ${fmtMin(m)} dibaca` : ""}
                </p>
              </div>
              <button onClick={() => makeCard(b)} className="btn btn-o !py-1.5 !px-4 text-xs shrink-0">
                ⬇ Unduh kartu
              </button>
            </div>
          );
        })}
        {doneBooks.length === 0 && (
          <p className="text-ink2 py-12 text-center">
            Belum ada buku yang ditandai selesai. Selesaikan bab terakhir di <Link className="underline" to="/jelajah">salah satu buku</Link>.
          </p>
        )}
      </div>
      {preview && <img src={preview} alt="Kartu bacaan" className="rounded-xl border border-line mb-10" />}
    </div>
  );
}