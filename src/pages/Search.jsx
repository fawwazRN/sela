import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useApp } from "../context/AppContext";

const clean = (s) =>
  (typeof s === "string" ? s : "").replace(/\{|\}|<[^>]+>/g, "");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function Search() {
  const { books } = useApp();
  const [sp, setSp] = useSearchParams();
  const q = sp.get("q") || "";
  const [inp, setInp] = useState(q);

  const res = useMemo(() => {
    if (!q.trim()) return [];
    const s = q.toLowerCase();
    const out = [];
    books.forEach((b) =>
      b.bab.forEach((c, ci) => {
        (c.isi || []).forEach((bl) => {
          const txt = clean(bl.v ?? (bl.t === "verse" ? bl.v.join(" ") : ""));
          const i = txt.toLowerCase().indexOf(s);
          if (i >= 0)
            out.push({
              book: b,
              ci,
              judul: c.judul,
              snippet: txt.slice(Math.max(0, i - 60), i + 90),
            });
        });
      }),
    );
    return out.slice(0, 30);
  }, [q, books]);

  return (
    <div className="mx-auto px-5 pt-12 max-w-3xl fadein">
      <h1 className="font-display font-bold text-3xl">Cari di dalam buku</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSp({ q: inp });
        }}
        className="flex gap-2 mt-6">
        <input
          autoFocus
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          placeholder="Ketik potongan kalimat…"
          className="inp"
        />
        <button className="btn btn-p">Cari</button>
      </form>
      {q && (
        <p className="mt-4 text-ink2 text-sm">
          {res.length} hasil untuk “{q}”
        </p>
      )}
      <div className="space-y-3 mt-6 pb-10">
        {res.map((r, i) => {
          const html = r.snippet.replace(
            new RegExp(`(${esc(q)})`, "ig"),
            "<mark>$1</mark>",
          );
          return (
            <Link
              key={i}
              to={`/baca/${r.book.slug}?bab=${r.ci}`}
              className="block p-4 hover:border-ink transition-colors card">
              <p className="text-ink2 text-xs">
                {r.book.judul} · Bab {r.ci + 1} — {r.judul}
              </p>
              <p
                className="mt-1 text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: "…" + html + "…" }}
              />
            </Link>
          );
        })}
        {q && res.length === 0 && (
          <p className="py-12 text-ink2 text-center">
            Tidak ditemukan. Coba kata lain.
          </p>
        )}
      </div>
    </div>
  );
}
