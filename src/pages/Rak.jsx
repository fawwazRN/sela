import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import Cover from "../components/Cover";
import { fmtDate, fmtMin } from "../lib/utils";
import { ACC } from "../data/books";

function RingMini({ pct, size = 34 }) {
  const r = (size - 5) / 2,
    c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      className="-top-1.5 -right-1.5 z-10 absolute">
      <circle cx={size / 2} cy={size / 2} r={r} fill="var(--c-paper)" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-line)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--c-accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontWeight="700"
        fill="var(--c-ink)">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function Rak() {
  const { books, progress, shelf, moveTo, finished, bookTime } = useApp();
  const [tab, setTab] = useState("baca");
  const entries = Object.entries(progress).sort(
    (a, b) => (b[1].at || 0) - (a[1].at || 0),
  );
  const last = entries.length
    ? books.find((b) => b.id === entries[0][0])
    : null;
  const arr = shelf[tab]
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);

  const totalMnt = Object.values(bookTime).reduce((a, b) => a + b, 0) / 60;

  return (
    <div className="mx-auto px-5 pt-12 max-w-5xl fadein">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl">
            Rak saya
          </h1>
          <p className="mt-1 text-ink2 text-sm">
            {shelf.baca.length} sedang dibaca · {shelf.selesai.length} selesai ·{" "}
            {fmtMin(totalMnt)} total
          </p>
        </div>
        <Link to="/jelajah" className="text-xs btn btn-o">
          + Tambah buku
        </Link>
      </div>

      {/* LANJUTKAN */}
      {last && (
        <Link
          to={`/baca/${last.slug}`}
          className="flex items-center gap-4 mt-6 p-4 hover:border-ink transition-colors card">
          <Cover book={last} className="w-12 aspect-[3/4]" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              Lanjutkan: {last.judul}
            </p>
            <p className="text-ink2 text-xs">
              Bab {(progress[last.id].chap ?? 0) + 1} · {progress[last.id].pct}%
            </p>
            <div className="bg-line mt-2 rounded max-w-[200px] h-1 overflow-hidden">
              <div
                className="bg-accent h-full"
                style={{ width: `${progress[last.id].pct}%` }}
              />
            </div>
          </div>
          <span className="!px-4 !py-1.5 text-xs btn btn-p shrink-0">
            Lanjut →
          </span>
        </Link>
      )}

      {/* TAB */}
      <div className="flex flex-wrap gap-2 mt-8">
        {[
          ["baca", `Sedang dibaca (${shelf.baca.length})`],
          ["selesai", `Selesai (${shelf.selesai.length})`],
          ["simpan", `Disimpan (${shelf.simpan.length})`],
        ].map(([id, n]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`chip ${tab === id ? "chip-on" : ""}`}>
            {n}
          </button>
        ))}
      </div>

      {/* RAK BUKU — dengan garis rak */}
      <div className="mt-6 pb-6">
        <div className="gap-x-4 gap-y-0 grid grid-cols-2 md:grid-cols-4">
          {arr.map((b) => {
            const p = progress[b.id];
            const c = ACC[b.genre] || ACC.Umum;
            return (
              <div key={b.id} className="group relative pb-5">
                <Link
                  to={`/buku/${b.slug}`}
                  className="block relative p-3 hover:border-ink transition-colors card">
                  <div className="relative">
                    <Cover book={b} className="w-full aspect-[3/4]" />
                    {/* cincin progres untuk yang sedang dibaca */}
                    {tab === "baca" && p && <RingMini pct={p.pct} />}
                    {/* centang untuk selesai */}
                    {tab === "selesai" && (
                      <span className="-top-1.5 -right-1.5 z-10 absolute place-items-center grid bg-green-600 border-2 border-paper rounded-full w-6 h-6 text-white">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-display font-semibold text-sm truncate leading-snug">
                    {b.judul}
                  </p>
                  <p className="text-[11px]" style={{ color: c }}>
                    {tab === "selesai" && finished[b.id]
                      ? "Selesai " + fmtDate(finished[b.id])
                      : tab === "baca" && p
                        ? `Bab ${(p.chap ?? 0) + 1}`
                        : b.genre}
                  </p>
                </Link>
                {tab !== "simpan" && (
                  <button
                    onClick={() => moveTo(b.id, "simpan")}
                    title="Simpan ke rak Disimpan"
                    className="top-1 right-1 absolute bg-paper opacity-0 group-hover:opacity-100 px-2 py-0.5 border border-line rounded-full text-[11px] transition-opacity">
                    ☆
                  </button>
                )}
              </div>
            );
          })}
          {arr.length === 0 && (
            <p className="col-span-full py-14 text-ink2 text-center card">
              Rak ini masih kosong.{" "}
              <Link className="text-accent underline" to="/jelajah">
                Cari buku →
              </Link>
            </p>
          )}
        </div>
        {/* garis rak kayu */}
        {arr.length > 0 && (
          <div
            className="mx-1 rounded-b h-2"
            style={{ background: "linear-gradient(#C9A876, #A8865A)" }}
          />
        )}
      </div>
    </div>
  );
}
