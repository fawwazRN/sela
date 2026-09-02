import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import Cover from "../components/Cover";
import { fmtDate } from "../lib/utils";

export default function Rak() {
  const { books, progress, shelf, moveTo, finished } = useApp();
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

  return (
    <div className="mx-auto px-5 pt-12 max-w-5xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">Rak saya</h1>
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
          </div>
          <span className="!px-4 !py-1.5 text-xs btn btn-p shrink-0">
            Lanjut →
          </span>
        </Link>
      )}
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
      <div className="gap-4 grid grid-cols-2 md:grid-cols-4 mt-6 pb-6">
        {arr.map((b) => (
          <div key={b.id} className="group relative">
            <Link
              to={`/buku/${b.slug}`}
              className="block p-3 hover:border-ink transition-colors card">
              <Cover book={b} className="w-full aspect-[3/4]" />
              <p className="mt-2 font-display font-semibold text-sm leading-snug">
                {b.judul}
              </p>
              <p className="text-[11px] text-ink2">
                {tab === "selesai" && finished[b.id]
                  ? "Selesai " + fmtDate(finished[b.id])
                  : b.genre}
              </p>
            </Link>
            <button
              onClick={() => moveTo(b.id, "baca")}
              title="Kembalikan ke sedang dibaca"
              className="top-5 right-5 absolute bg-paper opacity-0 group-hover:opacity-100 px-2 py-0.5 border border-line rounded-full text-[11px] transition-opacity">
              ↺
            </button>
          </div>
        ))}
        {arr.length === 0 && (
          <p className="col-span-full py-14 text-ink2 text-center">
            Rak ini masih kosong.{" "}
            <Link className="underline" to="/jelajah">
              Cari buku →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
