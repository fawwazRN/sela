import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtMin, fmtDate } from "../lib/utils";
import { ACC } from "../data/books";

function drawCard(book, minutes, date) {
  const W = 900,
    H = 500,
    padX = 60;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const x = cv.getContext("2d");

  /* latar + pita genre */
  x.fillStyle = "#F7F3EA";
  x.fillRect(0, 0, W, H);
  x.fillStyle = ACC[book.genre] || ACC.Umum;
  x.fillRect(0, 0, 14, H);

  /* kop */
  x.fillStyle = "#6E675B";
  x.font = "600 17px Literata, Georgia";
  x.fillText("SELA · KARTU BACAAN", padX, 70);

  /* footer (posisi tetap): garis + info */
  x.strokeStyle = "#E4DCCB";
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(padX, H - 130);
  x.lineTo(W - padX, H - 130);
  x.stroke();
  x.fillStyle = "#1A1815";
  x.font = "600 24px Literata, Georgia";
  x.fillText(`${fmtMin(Math.max(minutes, book.durasi))} dibaca`, padX, H - 88);
  x.fillStyle = "#6E675B";
  x.font = "400 19px Literata, Georgia";
  x.fillText(`Selesai ${date} · ${book.penulis} · ${book.genre}`, padX, H - 52);

  /* judul: shrink otomatis sampai muat di zona antara kop dan footer */
  const maxW = W - padX * 2;
  const zoneH = H - 130 - 130 - 44; // sisakan 44px utk baris penulis
  const wrap = (f) => {
    x.font = f;
    const out = [];
    let line = "";
    book.judul.split(" ").forEach((w) => {
      const t = line ? line + " " + w : w;
      if (x.measureText(t).width > maxW && line) {
        out.push(line);
        line = w;
      } else line = t;
    });
    if (line) out.push(line);
    return out;
  };

  let size = 48,
    lines = wrap(`700 ${size}px Fraunces, Georgia`);
  for (; size >= 24; size -= 4) {
    lines = wrap(`700 ${size}px Fraunces, Georgia`);
    if (lines.length * size * 1.2 <= zoneH) break;
  }
  /* di ukuran terkecil pun melebihi → potong dengan … */
  let lh = size * 1.2;
  while (lines.length * lh > zoneH && lines.length > 1) {
    lines.pop();
    lines[lines.length - 1] += " …";
  }

  /* gambar judul */
  x.fillStyle = "#1A1815";
  x.font = `700 ${size}px Fraunces, Georgia`;
  lines.forEach((l, i) => x.fillText(l, padX, 130 + size + i * lh));

  /* penulis & genre, tepat di bawah judul */
  x.fillStyle = "#6E675B";
  x.font = "400 20px Literata, Georgia";
  x.fillText(
    `${book.penulis} · ${book.genre}`,
    padX,
    130 + size + lines.length * lh + 8,
  );

  return cv.toDataURL("image/png");
}

export default function Stats() {
  const { readlog, finished, books } = useApp();
  const total = Object.values(readlog).reduce((a, b) => a + b, 0);
  const has = (d) => (readlog[d.toISOString().slice(0, 10)] || 0) > 0;
  let streak = 0;
  const d = new Date();
  if (!has(d)) d.setDate(d.getDate() - 1);
  while (has(d)) {
    streak++;
    d.setDate(d.getDate() - 1);
  }

  const cells = [];
  for (let i = 83; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const key = dt.toISOString().slice(0, 10);
    cells.push({ key, m: readlog[key] || 0 });
  }
  const lvl = (m) =>
    m === 0 ? 0 : m < 600 ? 1 : m < 1800 ? 2 : m < 3600 ? 3 : 4;

  const doneBooks = Object.keys(finished)
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);
  const [preview, setPreview] = useState(null);
  const makeCard = (b) => {
    const url = drawCard(b, 0, finished[b.id]);
    setPreview(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kartu-${b.slug}.png`;
    a.click();
  };

  return (
    <div className="mx-auto px-5 pt-12 max-w-3xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Statistik baca
      </h1>
      <div className="gap-4 grid grid-cols-3 mt-6">
        {[
          ["Total waktu", fmtMin(total / 60)],
          ["Hari beruntun", streak + " hari"],
          ["Buku selesai", doneBooks.length + " buku"],
        ].map(([t, v]) => (
          <div key={t} className="p-4 text-center card">
            <p className="font-display font-bold text-2xl">{v}</p>
            <p className="mt-1 text-[11px] text-ink2">{t}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 mb-3 lbl">84 hari terakhir</p>
      <div className="p-4 card">
        <div className="gap-1 grid grid-cols-7 w-fit">
          {cells.map((c) => (
            <div
              key={c.key}
              title={`${c.key}: ${Math.round(c.m / 60)} mnt`}
              className="rounded-sm w-3.5 h-3.5"
              style={{
                background: `color-mix(in srgb, var(--c-accent) ${lvl(c.m) * 22}%, var(--c-line))`,
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-10 mb-3 lbl">Kartu bacaan</p>
      <div className="space-y-3 pb-10">
        {doneBooks.map((b) => (
          <div key={b.id} className="flex items-center gap-4 p-4 card">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{b.judul}</p>
              <p className="text-ink2 text-xs">
                Selesai {fmtDate(finished[b.id])}
              </p>
            </div>
            <button
              onClick={() => makeCard(b)}
              className="!px-4 !py-1.5 text-xs btn btn-o shrink-0">
              ⬇ Unduh kartu
            </button>
          </div>
        ))}
        {doneBooks.length === 0 && (
          <p className="py-12 text-ink2 text-center">
            Belum ada buku yang ditandai selesai. Selesaikan bab terakhir di{" "}
            <Link className="underline" to="/jelajah">
              salah satu buku
            </Link>
            .
          </p>
        )}
      </div>
      {preview && (
        <img
          src={preview}
          alt="Kartu bacaan"
          className="mb-10 border border-line rounded-xl"
        />
      )}
    </div>
  );
}
