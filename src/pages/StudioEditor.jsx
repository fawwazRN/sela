import { useMemo, useState, useEffect } from "react";
import { Navigate, useParams, Link } from "react-router";
import { useApp, ADMIN_EMAILS, PENERBIT_RESMI } from "../context/AppContext";
import { G2M, MODE, GENRES_LIST } from "../data/books";
import ContentRenderer from "../components/reader/ContentRenderer";
import { mdToBlocks } from "../lib/markdown";
import { uid } from "../lib/storage";

/* Parser Studio:
   # Judul bab | %% ringkasan | @?? kuis | opsi | opsi benar* | opsi
   Sisanya markdown biasa (bold, italic, list, quote, callout, tabel, kode, {Tokoh}) */
function parseMd(md) {
  const bab = [];
  let cur = null;
  let buf = [];
  const flush = () => {
    if (buf.length) {
      if (!cur) {
        cur = { judul: "Pendahuluan", isi: [], ringkasan: null, kuis: null };
        bab.push(cur);
      }
      cur.isi.push(...mdToBlocks(buf.join("\n").trim()));
    }
    buf = [];
  };
  md.split(/\r?\n/).forEach((l) => {
    const t = l.trim();
    if (/^#\s+/.test(t)) {
      flush();
      cur = {
        judul: t.replace(/^#\s+/, "").replace(/\*\*/g, "").replace(/\\/g, ""),
        isi: [],
        ringkasan: null,
        kuis: null,
      };
      bab.push(cur);
    } else if (/^%%\s?/.test(t)) {
      flush();
      if (cur) cur.ringkasan = t.replace(/^%%\s?/, "");
    } else if (/^@\?\?\s?/.test(t)) {
      flush();
      if (cur) {
        const [q, ...opts] = t
          .replace(/^@\?\?\s?/, "")
          .split("|")
          .map((s) => s.trim());
        const o = opts.map((s) =>
          s.replace(/\*$/, "").replace(/\\/g, "").trim(),
        );
        const a = Math.max(
          0,
          opts.findIndex((s) => s.endsWith("*")),
        );
        cur.kuis = { q: q.replace(/\\/g, ""), o, a };
      }
    } else if (t === "") {
      flush();
    } else {
      buf.push(l);
    }
  });
  flush();
  return bab.length
    ? bab
    : [{ judul: "Tanpa Judul", isi: [], ringkasan: null, kuis: null }];
}

export default function StudioEditor() {
  const { id } = useParams();
  const { user, drafts, saveDraft, addCustomBook, isAdmin } = useApp();
  const draft = drafts.find((d) => d.id === id);
  const [pub, setPub] = useState(false);
  const [pane, setPane] = useState("both"); // mobile: both | tulis | lihat
  const [penulis, setPenulis] = useState(() =>
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
      ? PENERBIT_RESMI
      : user?.name || "",
  );
  useEffect(() => {
    setPub(false);
  }, [id]);

  /* hooks SEBELUM early return — wajib */
  const bab = useMemo(
    () => (draft ? parseMd(draft.md) : []),
    [draft?.md, draft?.id],
  );

  if (!user)
    return <Navigate to="/masuk" state={{ from: `/studio/${id}` }} replace />;
  if (!draft)
    return (
      <div className="mx-auto px-5 py-24 max-w-xl text-center">
        <p className="font-display text-2xl">Draft tidak ditemukan.</p>
        <Link to="/studio" className="mt-4 btn btn-o">
          Kembali ke Studio
        </Link>
      </div>
    );

  const mode = G2M[draft.genre] || "imersi";
  const pseudo = { id: "draft", judul: draft.judul, genre: draft.genre, bab };
  const upd = (patch) => saveDraft({ ...draft, ...patch });
  const kata = draft.md.split(/\s+/).filter(Boolean).length;

  const publish = () => {
    const penerbit = isAdmin ? penulis.trim() || PENERBIT_RESMI : user.name;
    addCustomBook({
      id: "stu-" + uid(),
      slug: "studio-" + draft.id,
      judul: draft.judul,
      penulis: penerbit,
      genre: draft.genre,
      durasi: Math.max(5, Math.round(kata / 200)),
      desc: `Ditulis di Studio Sela · ${bab.length} bab.`,
      custom: isAdmin ? PENERBIT_RESMI : "Studio",
      bab: bab.map((c) => ({ ...c, raw: null })),
    });
    setPub(true);
  };

  return (
    <div className="flex flex-col bg-paper h-screen">
      <header className="flex flex-wrap items-center gap-3 bg-card px-4 py-2.5 border-line border-b">
        <Link to="/studio" className="!px-3 !py-1.5 text-xs btn btn-o shrink-0">
          ← Studio
        </Link>
        <input
          value={draft.judul}
          onChange={(e) => upd({ judul: e.target.value })}
          className="!w-52 font-medium inp"
          placeholder="Judul buku"
        />
        {isAdmin && (
          <input
            value={penulis}
            onChange={(e) => setPenulis(e.target.value)}
            className="!w-36 text-xs inp"
            title="Penulis / Penerbit"
          />
        )}
        <select
          value={draft.genre}
          onChange={(e) => upd({ genre: e.target.value })}
          className="!py-2 !w-auto text-xs inp">
          {GENRES_LIST.map((g) => (
            <option key={g} value={g}>
              {g} — {MODE[G2M[g] || "imersi"].n}
            </option>
          ))}
        </select>
        <span className="hidden md:block text-[11px] text-ink2">
          {bab.length} bab · {kata} kata
        </span>
        <div className="flex-1" />
        {pub && (
          <span className="text-green-600 text-xs">
            ✓ Terpublikasi ke Jelajah
          </span>
        )}
        <button
          onClick={publish}
          className="!px-4 !py-1.5 text-xs btn btn-a shrink-0">
          Publish
        </button>
      </header>

      <div className="md:hidden flex border-line border-b text-xs">
        {[
          ["both", "Dua-duanya"],
          ["tulis", "Menulis"],
          ["lihat", "Pratinjau"],
        ].map(([v, n]) => (
          <button
            key={v}
            onClick={() => setPane(v)}
            className={`flex-1 py-2 ${pane === v ? "bg-line/50 font-medium" : "text-ink2"}`}>
            {n}
          </button>
        ))}
      </div>

      <div className="flex-1 grid md:grid-cols-2 min-h-0">
        <textarea
          value={draft.md}
          onChange={(e) => upd({ md: e.target.value })}
          spellCheck={false}
          className={`${pane === "lihat" ? "hidden md:block" : ""} h-full w-full resize-none bg-card p-6 font-mono text-sm outline-none border-r border-line`}
          placeholder={"# Bab Satu\n\nTulis di sini…"}
        />
        <div
          className={`${pane === "tulis" ? "hidden md:block" : ""} h-full overflow-y-auto px-6 py-8`}>
          <ContentRenderer book={pseudo} chap={0} mode={mode} onTap={null} />
        </div>
      </div>
    </div>
  );
}
