import { useMemo, useState, useEffect, useRef } from "react";
import { Navigate, useParams, Link } from "react-router";
import { useApp, PENERBIT_RESMI } from "../context/AppContext";
import { G2M2, MODE, GENRES_LIST } from "../data/books";
import ContentRenderer from "../components/reader/ContentRenderer";
import { mdToBlocks } from "../lib/markdown";
import { uid } from "../lib/storage";

function parseMd(md) {
  const bab = [];
  let cur = null;
  let buf = [];
  const flush = () => {
    if (buf.length) {
      if (!cur) {
        cur = { judul: "Pendahuluan", isi: [], ringkasan: null, kuis: [] };
        bab.push(cur);
      }
      const rawBab = buf.join("\n").trim();
      if (!cur.raw) cur.raw = rawBab; // markdown asli per bab — untuk edit ulang lintas perangkat
      cur.isi.push(...mdToBlocks(rawBab));
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
        kuis: [], // ← ARRAY: semua @?? terkumpul, tidak ada yang ditimpa
      };
      bab.push(cur);
    } else if (/^%%\s?/.test(t)) {
      flush();
      if (cur)
        cur.ringkasan = t
          .replace(/^%%\s?/, "")
          .split("@??")[0]
          .trim();
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
        cur.kuis.push({ q: q.replace(/\\/g, ""), o, a }); // ← PUSH!
      }
    } else if (t === "") flush();
    else buf.push(l);
  });
  flush();
  return bab.length
    ? bab
    : [{ judul: "Tanpa Judul", isi: [], ringkasan: null, kuis: [] }];
}

const SISIP = [
  ["**B**", "Tebal", "**teks tebal**"],
  ["*I*", "Miring", "*teks miring*"],
  ["H", "Bab baru", "\n# Judul Bab Baru\n\n"],
  ["TL", "Linimasa", "\n@tl 2024 | Peristiwa penting.\n"],
  ["?", "Kuis", "\n@?? Pertanyaannya? | Opsi A | Opsi benar* | Opsi C\n"],
  ["%%", "Ringkasan", "\n%% Ringkasan bab dalam satu kalimat.\n"],
  ["{ }", "Tokoh", "{Nama Tokoh}"],
  ["¶", "Daftar", "\n- poin satu\n- poin dua\n"],
];

export default function StudioEditor() {
  const { id } = useParams();
  const { user, drafts, saveDraft, addCustomBook, isAdmin } = useApp();
  const draft = drafts.find((d) => d.id === id);
  const [pub, setPub] = useState(false);
  const [pane, setPane] = useState("both");
  const [penulis, setPenulis] = useState(() =>
    isAdmin ? PENERBIT_RESMI : user?.name || "",
  );
  const [prevChap, setPrevChap] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [versi, setVersi] = useState(0);
  const taRef = useRef(null);

  useEffect(() => {
    setPub(false);
    setPrevChap(0);
  }, [id]);

  useEffect(() => {
    if (!draft) return;
    setSavedFlash(false);
    const t = setTimeout(() => setSavedFlash(true), 900);
    return () => clearTimeout(t);
  }, [draft?.md, draft?.judul]);

  const bab = useMemo(
    () => (draft ? parseMd(draft.md) : []),
    [draft?.md, draft?.id],
  );
  useEffect(() => {
    if (prevChap >= bab.length) setPrevChap(Math.max(0, bab.length - 1));
  }, [bab.length]);

  /* hooks sebelum early return */
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

  const mode = G2M2[draft.genre] || "imersi";
  const pseudo = {
    id: "draft-" + versi,
    judul: draft.judul,
    genre: draft.genre,
    bab,
  };
  const upd = (patch) => {
    saveDraft({ ...draft, ...patch });
    setVersi((v) => v + 1);
  };
  const kata = draft.md.split(/\s+/).filter(Boolean).length;

  const sisip = (snip) => {
    const ta = taRef.current;
    if (!ta) return;
    const start = ta.selectionStart,
      end = ta.selectionEnd;
    const baru = draft.md.slice(0, start) + snip + draft.md.slice(end);
    upd({ md: baru });
    setTimeout(() => {
      ta.focus();
      const pos = start + snip.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  /* publish memakai targetId/targetSlug kalau ada —
     edit buku yang sudah tayang MENIMPA buku yang sama
     (slug & id tetap → progres pembaca tidak putus) */
  const publish = () => {
    const penerbit = isAdmin ? penulis.trim() || PENERBIT_RESMI : user.name;
    addCustomBook({
      id: draft.targetId || "stu-" + uid(),
      slug: draft.targetSlug || "studio-" + draft.id,
      judul: draft.judul,
      penulis: penerbit,
      genre: draft.genre,
      durasi: Math.max(5, Math.round(kata / 200)),
      desc: `Ditulis di Studio Sela · ${bab.length} bab.`,
      custom: isAdmin ? PENERBIT_RESMI : "Studio",
      bab: bab.map((c) => ({ ...c })),
    });
    setPub(true);
    setTimeout(() => setPub(false), 4000);
  };

  return (
    <div className="flex flex-col bg-paper h-screen">
      {/* ===== HEADER ===== */}
      <header className="flex flex-wrap items-center gap-2.5 bg-paper px-4 py-2.5 border-line border-b">
        <Link to="/studio" className="!px-3 !py-1.5 text-xs btn btn-o shrink-0">
          ← Studio
        </Link>
        <input
          value={draft.judul}
          onChange={(e) => upd({ judul: e.target.value })}
          className="!w-44 font-medium inp"
          placeholder="Judul buku"
        />
        {isAdmin && (
          <input
            value={penulis}
            onChange={(e) => setPenulis(e.target.value)}
            className="!w-28 text-xs inp"
            title="Penulis / Penerbit"
          />
        )}
        <select
          value={draft.genre}
          onChange={(e) => upd({ genre: e.target.value })}
          className="!py-2 !w-auto text-xs inp">
          {GENRES_LIST.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        {/* penanda mode kolaborasi */}
        {!draft.mine && (
          <span className="bg-accent/15 px-2 py-0.5 rounded text-[10px] text-accent uppercase tracking-wider">
            Mengedit draft {draft.ownerEmail || "penulis lain"}
          </span>
        )}
        <span
          className={`text-[11px] transition-opacity ${savedFlash ? "opacity-100 text-green-600" : "opacity-0"}`}>
          ✓ tersimpan
        </span>
        {pub && (
          <span className="font-medium text-green-600 text-xs">
            ✓ Terpublikasi ke Jelajah!
          </span>
        )}
        <button
          onClick={publish}
          className="!px-4 !py-1.5 text-xs btn btn-a shrink-0">
          Publish
        </button>
      </header>

      {/* ===== TOOLBAR ===== */}
      <div className="flex flex-wrap items-center gap-1.5 bg-paper px-4 py-1.5 border-line border-b text-[11px]">
        <span className="mr-1 text-ink2">Sisip:</span>
        {SISIP.map(([lbl, nm, snip]) => (
          <button
            key={nm}
            onClick={() => sisip(snip)}
            title={`Sisip ${nm}`}
            className="!px-2.5 !py-0.5 chip">
            {lbl}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-ink2">
          {bab.length} bab · {kata} kata ·{" "}
          {bab.reduce((a, c) => a + (c.kuis?.length || 0), 0)} soal kuis
        </span>
      </div>

      {/* ===== MOBILE PANE ===== */}
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

      {/* ===== BODY ===== */}
      <div className="flex-1 grid md:grid-cols-2 min-h-0">
        <textarea
          ref={taRef}
          value={draft.md}
          onChange={(e) => upd({ md: e.target.value })}
          spellCheck={false}
          className={`${pane === "lihat" ? "hidden md:block" : ""} h-full w-full resize-none bg-paper p-5 font-mono text-[13px] leading-relaxed outline-none border-r border-line`}
          placeholder={"# Bab Satu\n\nTulis di sini…"}
        />

        {/* PRATINJAU — live terjamin via versi */}
        <div
          className={`${pane === "tulis" ? "hidden md:block" : ""} h-full flex flex-col min-h-0 bg-paper`}>
          <div className="flex items-center gap-2 bg-paper/50 px-5 py-2 border-line border-b">
            <span className="!text-[10px] lbl">Pratinjau langsung</span>
            <span className="bg-green-500 rounded-full w-1.5 h-1.5 animate-pulse" />
            <div className="flex-1" />
            <button
              disabled={prevChap === 0}
              onClick={() => setPrevChap((c) => Math.max(0, c - 1))}
              className="disabled:opacity-30 !px-2 !py-0.5 text-[11px] chip">
              ←
            </button>
            <select
              value={Math.min(prevChap, Math.max(0, bab.length - 1))}
              onChange={(e) => setPrevChap(+e.target.value)}
              className="!py-1 !w-auto text-[11px] inp">
              {bab.map((c, i) => (
                <option key={i} value={i}>
                  Bab {i + 1} — {c.judul}
                </option>
              ))}
            </select>
            <button
              disabled={prevChap >= bab.length - 1}
              onClick={() =>
                setPrevChap((c) => Math.min(bab.length - 1, c + 1))
              }
              className="disabled:opacity-30 !px-2 !py-0.5 text-[11px] chip">
              →
            </button>
          </div>
          <div className="flex-1 px-6 py-8 min-h-0 overflow-y-auto">
            <ContentRenderer
              book={pseudo}
              chap={Math.min(prevChap, bab.length - 1)}
              mode={mode}
              onTap={null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
