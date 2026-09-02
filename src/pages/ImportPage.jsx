import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { uid } from "../lib/storage";
import { GENRES_LIST, G2M, MODE } from "../data/books";
import { mdToBlocks, splitChapters } from "../lib/markdown";

const SPLITTERS = [
  ["otomatis", "Otomatis"],
  ["h1", "# Judul (H1)"],
  ["h2", "## Sub-judul (H2)"],
  ["bab", "Bab N / Chapter N"],
];

const CONTOH = `# Judul Buku Kamu

# Bab Satu

Paragraf pembuka. **Bold**, *italic*, dan {Tokoh} jadi kartu karakter.

%% Ringkasan bab satu.

@?? Contoh kuis? | Opsi A | Opsi benar* | Opsi C

# Bab Dua

Isi bab dua di sini.
`;

export default function ImportPage() {
  const { addCustomBook, books, removeCustomBook, saveDraft } = useApp();
  const nav = useNavigate();
  const [genre, setGenre] = useState("Umum");
  const [splitter, setSplitter] = useState("otomatis");
  const [st, setSt] = useState("idle"); // idle | parsing | done | error
  const [msg, setMsg] = useState("");
  const [text, setText] = useState(null); // isi .md mentah
  const [judul, setJudul] = useState("");

  const parsed = useMemo(() => {
    if (!text) return null;
    const r = splitChapters(text, splitter);
    return { judul: r.judul, chapters: r.chapters };
  }, [text, splitter]);

  const mode = MODE[G2M[genre] || "imersi"];
  const imports = books.filter((b) => b.custom === "Impor");

  const parse = async (file) => {
    setSt("parsing");
    setMsg("");
    setText(null);
    try {
      if (!/\.md$/i.test(file.name))
        throw new Error(
          "Hanya file .md yang didukung. Konversi dulu ke Markdown.",
        );
      const t = await file.text();
      if (!t.trim()) throw new Error("File kosong.");
      setText(t);
      const r = splitChapters(t, splitter);
      setJudul(r.judul || file.name.replace(/\.md$/i, ""));
      setSt("done");
    } catch (e) {
      setSt("error");
      setMsg(e.message || "Gagal membaca file.");
    }
  };

  const pickSplitter = (v) => {
    setSplitter(v);
    if (text) setJudul(splitChapters(text, v).judul || judul);
  };

  const save = () => {
    const slug = "impor-" + uid();
    addCustomBook({
      id: "imp-" + uid(),
      slug,
      judul: judul || "Buku Imporan",
      penulis: "Imporan kamu",
      genre,
      durasi: Math.max(
        5,
        Math.round(
          parsed.chapters.reduce(
            (a, c) => a + c.raw.split(/\s+/).filter(Boolean).length,
            0,
          ) / 200,
        ),
      ),
      desc: `Diimpor dari Markdown · ${parsed.chapters.length} bab.`,
      custom: "Impor",
      bab: parsed.chapters.map((c) => ({
        judul: c.judul,
        isi: mdToBlocks(c.raw),
        ringkasan: null,
        kuis: null,
        raw: c.raw,
      })),
    });
    nav(`/buku/${slug}`);
  };

  const editInStudio = (b) => {
    const md = b.bab
      .map((c) => {
        const raw =
          c.raw ||
          (c.isi || [])
            .filter((x) => x.t === "p")
            .map((x) => x.v)
            .join("\n\n");
        return `# ${c.judul}\n\n${raw}`;
      })
      .join("\n\n");
    const id = saveDraft({ judul: b.judul, genre: b.genre, md });
    nav(`/studio/${id}`);
  };

  const unduhContoh = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([CONTOH], { type: "text/markdown" }));
    a.download = "contoh-buku.md";
    a.click();
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-2xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Impor buku
      </h1>
      <p className="mt-2 text-ink2">
        Format <b>.md (Markdown)</b>. Pemisah bab, style teks, dan pratinjaunya
        konsisten dengan Studio.
      </p>

      <label className="place-items-center grid mt-6 py-14 hover:border-ink border-dashed text-center transition-colors cursor-pointer card">
        <input
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={(e) => e.target.files[0] && parse(e.target.files[0])}
        />
        <p className="font-display text-xl">
          Taruh file .md di sini, atau klik
        </p>
        <p className="mt-1 text-ink2 text-sm">
          {st === "parsing" ? "Memproses…" : "Markdown saja — .md"}
        </p>
      </label>
      <p className="mt-3 text-center">
        <button
          onClick={unduhContoh}
          className="text-ink2 hover:text-ink text-xs underline underline-offset-4">
          ⬇ Unduh contoh struktur .md
        </button>
      </p>

      {st === "error" && <p className="mt-4 text-accent text-sm">{msg}</p>}

      {st === "done" && parsed && (
        <div className="mt-4 p-5 card fadein">
          <p className="mb-2 lbl">
            Pratinjau — {parsed.chapters.length} bab terdeteksi
          </p>
          <input
            className="mb-3 inp"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Judul buku"
          />

          <p className="mb-2 lbl">Pemisah bab</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {SPLITTERS.map(([v, n]) => (
              <button
                key={v}
                onClick={() => pickSplitter(v)}
                className={`chip ${splitter === v ? "chip-on" : ""}`}>
                {n}
              </button>
            ))}
          </div>

          <div className="mb-4 border border-line rounded-xl divide-y divide-line max-h-48 overflow-y-auto">
            {parsed.chapters.map((c, i) => (
              <div
                key={i}
                className="flex items-baseline gap-3 px-3 py-2 text-sm">
                <span className="w-6 text-ink2 text-xs shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{c.judul}</span>
                <span className="ml-auto text-[11px] text-ink2 shrink-0">
                  {c.raw.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
            ))}
          </div>

          <p className="mb-2 lbl">Genre (menentukan mode baca)</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {GENRES_LIST.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`chip ${genre === g ? "chip-on" : ""}`}>
                {g}
              </button>
            ))}
          </div>
          <p className="mb-4 text-sm">
            <span className="!cursor-default chip">{mode.n}</span>
            <span className="ml-1 text-ink2 text-xs">{mode.d}</span>
          </p>

          <div className="flex gap-2">
            <button onClick={save} className="flex-1 btn btn-p">
              Tambahkan ke rak & buka →
            </button>
            <button
              onClick={
                editInStudio({
                  bab: parsed.chapters.map((c) => ({
                    judul: c.judul,
                    raw: c.raw,
                  })),
                  judul,
                  genre,
                }) && undefined
              }
              className="hidden"
            />
          </div>
          <button
            onClick={() => {
              const md = parsed.chapters
                .map((c) => `# ${c.judul}\n\n${c.raw}`)
                .join("\n\n");
              const id = saveDraft({ judul, genre, md });
              nav(`/studio/${id}`);
            }}
            className="mt-2 w-full text-xs btn btn-o">
            Buka di Studio dulu (edit sebelum terbit)
          </button>
        </div>
      )}

      {imports.length > 0 && (
        <>
          <p className="mt-10 mb-3 lbl">Imporan sebelumnya</p>
          <div className="space-y-2">
            {imports.map((b) => (
              <div key={b.id} className="flex items-center gap-3 p-4 card">
                <Link to={`/buku/${b.slug}`} className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.judul}</p>
                  <p className="text-ink2 text-xs">
                    {b.bab.length} bab · {b.genre}
                  </p>
                </Link>
                <button
                  onClick={() => editInStudio(b)}
                  className="text-xs hover:underline shrink-0">
                  Edit di Studio
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus "${b.judul}"?`))
                      removeCustomBook(b.slug);
                  }}
                  className="text-accent text-xs hover:underline shrink-0">
                  hapus
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
