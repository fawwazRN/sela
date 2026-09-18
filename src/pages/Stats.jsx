import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtMin, fmtDate } from "../lib/utils";
import { today } from "../lib/storage";
import { ACC } from "../data/books";

/* ---------- util gambar ---------- */
function rr(x, px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}
function tracked(x, text, cx, y, tracking, font, color) {
  x.font = font;
  x.fillStyle = color;
  x.textAlign = "left";
  let w = 0;
  for (const ch of text) w += x.measureText(ch).width + tracking;
  w -= tracking;
  let sx = cx - w / 2;
  for (const ch of text) {
    x.fillText(ch, sx, y);
    sx += x.measureText(ch).width + tracking;
  }
}
function wrapCenter(x, text, font, maxW) {
  x.font = font;
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (x.measureText(t).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------- kartu sertifikat ---------- */
function drawCard(book, minutes, dateStr, userName) {
  const W = 1200,
    H = 630,
    R = 30,
    px = 84;
  const INK = "#1A1815",
    INK2 = "#6E675B",
    LINE = "#D8CFBB",
    PAPER = "#F7F3EA";
  const GENRE = ACC[book.genre] || ACC.Umum;

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const x = cv.getContext("2d");
  const cx = W / 2;

  rr(x, 0, 0, W, H, R);
  x.clip();
  x.fillStyle = PAPER;
  x.fillRect(0, 0, W, H);
  const vg = x.createRadialGradient(cx, H / 2, 220, cx, H / 2, 760);
  vg.addColorStop(0, "rgba(26,24,21,0)");
  vg.addColorStop(1, "rgba(26,24,21,0.06)");
  x.fillStyle = vg;
  x.fillRect(0, 0, W, H);

  x.strokeStyle = "rgba(26,24,21,0.85)";
  x.lineWidth = 2;
  rr(x, 32, 32, W - 64, H - 64, 20);
  x.stroke();
  x.strokeStyle = LINE;
  x.lineWidth = 1;
  rr(x, 42, 42, W - 84, H - 84, 14);
  x.stroke();

  tracked(x, "SELA", cx, 96, 10, "700 20px Fraunces, Georgia", INK);
  tracked(
    x,
    book.genre.toUpperCase(),
    cx,
    128,
    6,
    "600 15px Literata, Georgia",
    GENRE,
  );

  const zoneTop = 190,
    zoneBottom = H - 132;
  const maxW = W - px * 2;
  let size = 54,
    lines,
    lh;
  for (; size >= 24; size -= 3) {
    lh = size * 1.16;
    lines = wrapCenter(x, book.judul, `700 ${size}px Fraunces, Georgia`, maxW);
    if (lines.length > 3) {
      lines = lines.slice(0, 3);
      lines[2] += " …";
    }
    if (lines.length * lh + 194 <= zoneBottom - zoneTop) break;
  }
  let y = zoneTop + size;
  x.font = `700 ${size}px Fraunces, Georgia`;
  x.fillStyle = INK;
  x.textAlign = "center";
  lines.forEach((l) => {
    x.fillText(l, cx, y);
    y += lh;
  });

  y += 46;
  x.font = "400 21px Literata, Georgia";
  x.fillStyle = INK2;
  let penulis = `${book.penulis}`;
  while (x.measureText(penulis).width > maxW && penulis.length > 4)
    penulis = penulis.slice(0, -2);
  if (penulis !== book.penulis) penulis += "…";
  x.fillText(penulis, cx, y);

  y += 52;
  x.strokeStyle = "#C9BEA6";
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(cx - 150, y);
  x.lineTo(cx - 20, y);
  x.stroke();
  x.beginPath();
  x.moveTo(cx + 20, y);
  x.lineTo(cx + 150, y);
  x.stroke();
  x.save();
  x.translate(cx, y);
  x.rotate(Math.PI / 4);
  x.fillStyle = GENRE;
  x.fillRect(-5, -5, 10, 10);
  x.restore();

  y += 66;
  const teksWaktu =
    minutes != null && minutes > 0
      ? `${fmtMin(minutes)} dibaca`
      : `≈ ${fmtMin(book.durasi)} · durasi buku`;
  x.font = "700 30px Literata, Georgia";
  x.fillStyle = INK;
  x.fillText(teksWaktu, cx, y);

  y += 40;
  x.font = "400 18px Literata, Georgia";
  x.fillStyle = INK2;
  x.fillText(`Selesai ${dateStr}`, cx, y);

  const fy = H - 96;
  x.strokeStyle = LINE;
  x.lineWidth = 1;
  x.beginPath();
  x.moveTo(px, fy);
  x.lineTo(W - px, fy);
  x.stroke();

  const nama = userName
    ? `Dibaca oleh ${userName}`
    : "Dibaca oleh pembaca anonim";
  x.font = "italic 600 25px Literata, Georgia";
  x.fillStyle = GENRE;
  const nw = x.measureText(nama).width;
  x.textAlign = "center";
  x.fillText(nama, cx, fy + 44);
  x.save();
  x.fillStyle = GENRE;
  [
    [cx - nw / 2 - 26, fy + 37],
    [cx + nw / 2 + 26, fy + 37],
  ].forEach(([dx, dy]) => {
    x.save();
    x.translate(dx, dy);
    x.rotate(Math.PI / 4);
    x.fillRect(-3.5, -3.5, 7, 7);
    x.restore();
  });
  x.restore();

  return cv.toDataURL("image/png");
}

/* ---------- ring target harian ---------- */
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
        strokeWidth="8"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-accent)"
        strokeWidth="8"
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
        fontSize={size / 4.4}
        fontWeight="700"
        fill="var(--c-ink)"
        fontFamily="Fraunces, Georgia, serif">
        {Math.round(p * 100)}%
      </text>
    </svg>
  );
}

export default function Stats() {
  const {
    readlog,
    hourlog,
    finished,
    books,
    bookTime,
    user,
    goal,
    subs,
    isAdmin,
  } = useApp();

  /* ===== angka aman ===== */
  const targetAman = Number(goal) > 0 ? Number(goal) : 20;
  const mntHariIni = Math.round((readlog[today()] || 0) / 60);
  const pTarget = Math.min(1, mntHariIni / targetAman);
  const tercapai = mntHariIni >= targetAman;

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
    const menitAsli = bookTime[b.id] ? Math.round(bookTime[b.id] / 60) : null;
    const url = drawCard(b, menitAsli, fmtDate(finished[b.id]), user?.name);
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

      {/* ===== TARGET HARIAN ===== */}
      <div className="flex items-center gap-5 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-6 p-5 border border-line rounded-2xl">
        <Ring p={pTarget} />
        <div className="min-w-0">
          <p className="font-display font-semibold text-lg">
            {tercapai ? "Target harian tercapai" : "Target hari ini"}
          </p>
          <p className="mt-0.5 text-ink2 text-sm">
            {mntHariIni} dari {targetAman} menit membaca
            {tercapai
              ? " — konsisten itu kuncinya."
              : ` · sisa ${targetAman - mntHariIni} menit lagi.`}
          </p>
          <p className="mt-1 text-ink2 text-xs">
            Atur target di{" "}
            <Link
              to="/saya/pengaturan"
              className="text-accent underline underline-offset-4">
              Pengaturan
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="gap-4 grid grid-cols-3 mt-4">
        {[
          ["Total waktu", fmtMin(total / 60)],
          ["Hari beruntun", streak + " hari"],
          ["Buku selesai", doneBooks.length + " buku"],
        ].map(([t, v]) => (
          <div
            key={t}
            className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl text-center">
            <p className="font-display font-bold text-2xl">{v}</p>
            <p className="mt-1 text-[11px] text-ink2">{t}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 mb-3 lbl">84 hari terakhir</p>
      <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
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

      {/* ===== STATISTIK LANJUTAN (Sela Pro) ===== */}
      {(!!subs?.pro || isAdmin) && (
        <>
          <p className="mt-10 mb-3 lbl">
            Statistik lanjutan
            <span className="bg-[#F6D860]/20 ml-2 px-1.5 py-0.5 rounded text-[#8a6d1d] text-[9px] uppercase align-middle tracking-wider">
              Pro
            </span>
          </p>
          <div className="space-y-6 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-5 border border-line rounded-2xl">
            {/* rata-rata 4 minggu */}
            {(() => {
              let mnt4 = 0;
              for (let i = 0; i < 28; i++) {
                const dt = new Date();
                dt.setDate(dt.getDate() - i);
                mnt4 += (readlog[dt.toISOString().slice(0, 10)] || 0) / 60;
              }
              return (
                <div>
                  <p className="font-display font-semibold text-sm">
                    Rata-rata 4 minggu terakhir
                  </p>
                  <p className="text-ink2 text-sm">
                    <b className="text-ink text-lg">
                      {fmtMin(Math.round(mnt4 / 4))}
                    </b>{" "}
                    per minggu ({Math.round(mnt4 / 28)} mnt/hari)
                  </p>
                </div>
              );
            })()}

            {/* jam favorit */}
            <div>
              <p className="font-display font-semibold text-sm">
                Jam favorit membaca
              </p>
              <div className="flex items-end gap-[3px] mt-2 h-16">
                {Array.from({ length: 24 }, (_, h) => {
                  const v = Math.max(...Object.values(hourlog || {}), 1);
                  const n = hourlog?.[h] || 0;
                  return (
                    <div
                      key={h}
                      title={`${h}:00 — ${Math.round(n / 60)} mnt`}
                      className="flex-1 rounded-t"
                      style={{
                        height: `${Math.max(4, (n / v) * 100)}%`,
                        background:
                          n > 0
                            ? "var(--c-accent,#B3402A)"
                            : "var(--c-line,#e5decd)",
                        opacity: n > 0 ? 0.45 + 0.55 * (n / v) : 1,
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-ink2">
                <span>0</span>
                <span>6</span>
                <span>12</span>
                <span>18</span>
                <span>23</span>
              </div>
              {(() => {
                const entri = Object.entries(hourlog || {});
                if (!entri.length) return null;
                const [hTerbaik] = entri.sort((a, b) => b[1] - a[1])[0];
                return (
                  <p className="mt-1 text-ink2 text-xs">
                    Paling produktif jam{" "}
                    <b className="text-ink">
                      {String(hTerbaik).padStart(2, "0")}:00
                    </b>
                  </p>
                );
              })()}
            </div>

            {/* genre terbanyak */}
            <div>
              <p className="font-display font-semibold text-sm">
                Genre yang paling kamu baca
              </p>
              {(() => {
                const perGenre = {};
                Object.entries(bookTime || {}).forEach(([bid, det]) => {
                  const b = books.find((x) => x.id === bid);
                  if (b)
                    perGenre[b.genre] = (perGenre[b.genre] || 0) + det / 60;
                });
                const rows = Object.entries(perGenre).sort(
                  (a, b) => b[1] - a[1],
                );
                const max = Math.max(...rows.map((r) => r[1]), 1);
                if (!rows.length)
                  return (
                    <p className="mt-1 text-ink2 text-xs">
                      Belum ada data waktu baca per buku.
                    </p>
                  );
                return (
                  <div className="space-y-1.5 mt-2">
                    {rows.map(([g, mnt]) => (
                      <div key={g} className="flex items-center gap-2">
                        <span className="w-20 text-[11px] text-ink2 truncate shrink-0">
                          {g}
                        </span>
                        <div className="flex-1 bg-line rounded h-2 overflow-hidden">
                          <div
                            className="bg-accent h-full"
                            style={{ width: `${(mnt / max) * 100}%` }}
                          />
                        </div>
                        <span className="w-16 tabular-nums text-[10px] text-ink2 text-right shrink-0">
                          {fmtMin(Math.round(mnt))}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}

      <p className="mt-10 mb-3 lbl">Kartu bacaan</p>
      <div className="space-y-3 pb-10">
        {doneBooks.map((b) => {
          const m = bookTime[b.id] ? Math.round(bookTime[b.id] / 60) : null;
          return (
            <div
              key={b.id}
              className="flex items-center gap-4 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.judul}</p>
                <p className="text-ink2 text-xs">
                  Selesai {fmtDate(finished[b.id])}
                  {m != null ? ` · ${fmtMin(m)} dibaca` : ""}
                </p>
              </div>
              <button
                onClick={() => makeCard(b)}
                className="!px-4 !py-1.5 text-xs btn btn-o shrink-0">
                Unduh kartu
              </button>
            </div>
          );
        })}
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
          className="shadow-xl mx-auto mb-10 border border-line rounded-2xl max-w-full"
        />
      )}
    </div>
  );
}
