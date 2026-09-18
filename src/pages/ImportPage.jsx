import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useApp, PENERBIT_RESMI } from "../context/AppContext";
import { uid } from "../lib/storage";
import { G2M2, MODE } from "../data/books";
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

Linimasa:

@tl 1945 | Proklamasi dibacakan.
@tl 1949 | Kedaulatan diakui.

%% Ringkasan bab satu.

@?? Contoh kuis? | Opsi A | Opsi benar* | Opsi C

# Bab Dua

Isi bab dua di sini.
`;

export default function ImportPage() {
  const {
    addCustomBook,
    books,
    removeCustomBook,
    saveDraft,
    isAdmin,
    user,
    genres,
  } = useApp();
  const nav = useNavigate();

  /* ===== GERBANG LOGIN ===== */
  if (!user)
    return (
      <div className="mx-auto px-5 pt-24 pb-10 max-w-md text-center fadein">
        <div className="place-items-center grid bg-accent/10 mx-auto mb-5 rounded-2xl w-16 h-16">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#B3402A"
            strokeWidth="1.8">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-3xl">Impor buku</h1>
        <p className="mt-3 text-ink2 leading-relaxed">
          Mengimpor naskah memerlukan akun supaya bukumu tersimpan atas namamu.
          Gratis dan cepat.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Link to="/masuk" state={{ from: "/impor" }} className="btn btn-p">
            Masuk / Daftar
          </Link>
          <Link to="/tutorial" className="btn btn-o">
            Pelajari dulu
          </Link>
        </div>
      </div>
    );

  const [genre, setGenre] = useState("Umum");
  const [splitter, setSplitter] = useState("otomatis");
  const [st, setSt] = useState("idle");
  const [msg, setMsg] = useState("");
  const [text, setText] = useState(null);
  const [namaFile, setNamaFile] = useState("");
  const [judul, setJudul] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const parsed = useMemo(() => {
    if (!text) return null;
    const r = splitChapters(text, splitter);
    return { judul: r.judul, chapters: r.chapters };
  }, [text, splitter]);

  const mode = MODE[G2M2[genre] || "imersi"];
  const imports = books.filter(
    (b) => b.custom && (isAdmin || b.owner === user?.email),
  );
  const totalKata = parsed
    ? parsed.chapters.reduce(
        (a, c) => a + c.raw.split(/\s+/).filter(Boolean).length,
        0,
      )
    : 0;

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parse(file);
  };

  const parse = async (file) => {
    setSt("parsing");
    setMsg("");
    setText(null);
    setNamaFile(file.name);
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
      setNamaFile("");
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
      penulis: isAdmin ? PENERBIT_RESMI : user?.name || "Imporan kamu",
      genre,
      durasi: Math.max(5, Math.round(totalKata / 200)),
      desc: `Diimpor dari Markdown · ${parsed.chapters.length} bab.`,
      custom: isAdmin ? PENERBIT_RESMI : "Impor",
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
      {/* HERO */}
      <div
        className="relative mb-8 p-8 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8A5A2B, #1A1815)" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-[11px] text-white/60 uppercase tracking-[0.3em]">
            Bawa naskahmu
          </p>
          <h1 className="mt-1 font-display font-bold text-white text-3xl">
            Impor buku
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            Format <b className="text-white">.md (Markdown)</b> — pemisah bab,
            style teks, dan pratinjau konsisten dengan Studio.
          </p>
        </div>
      </div>

      {/* DROPZONE */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`bg-paper border rounded-2xl shadow-[0_2px_10px_rgba(26,24,21,0.05)] grid place-items-center text-center py-14 cursor-pointer transition-all ${
          dragOver
            ? "border-2 border-accent bg-accent/5 scale-[1.01]"
            : "border-line border-dashed hover:border-ink"
        }`}>
        <input
          type="file"
          accept=".md,text/markdown"
          className="hidden"
          onChange={(e) => e.target.files[0] && parse(e.target.files[0])}
        />

        {st === "parsing" ? (
          <>
            <span className="mb-3 border-2 border-line border-t-accent rounded-full w-8 h-8 animate-spin" />
            <p className="font-display text-lg">Memproses naskah…</p>
          </>
        ) : st === "done" ? (
          <>
            <span className="place-items-center grid bg-green-600/15 mb-3 rounded-full w-12 h-12">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <p className="px-6 font-display text-green-600 text-lg break-all">
              ✓ {namaFile}
            </p>
            <p className="mt-1 text-ink2 text-sm">
              {parsed
                ? `${parsed.chapters.length} bab terdeteksi · ${totalKata} kata`
                : ""}
            </p>
          </>
        ) : (
          <>
            <svg
              width="42"
              height="42"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="mb-3 text-ink2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <p className="font-display text-xl">
              {dragOver
                ? "Lepaskan di sini!"
                : "Taruh file .md di sini, atau klik"}
            </p>
            <p className="mt-1 text-ink2 text-sm">Markdown saja — .md</p>
          </>
        )}
      </label>

      <p className="mt-3 text-center">
        <button
          onClick={unduhContoh}
          className="text-ink2 hover:text-ink text-xs underline underline-offset-4">
          ⬇ Unduh contoh struktur .md
        </button>
      </p>

      {st === "error" && (
        <p className="bg-paper mt-4 p-3 border !border-accent/40 border-line rounded-2xl text-accent text-sm">
          {msg}
        </p>
      )}

      {st === "done" && parsed && (
        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-4 p-5 border border-line rounded-2xl fadein">
          <div className="flex justify-between items-center mb-2">
            <p className="lbl">Pratinjau — {parsed.chapters.length} bab</p>
            <span className="text-[11px] text-ink2">
              {totalKata} kata · ±{Math.max(1, Math.round(totalKata / 200))} mnt
              baca
            </span>
          </div>

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

          <p className="mb-2 lbl">Genre — menentukan mode baca</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`chip ${genre === g ? "chip-on" : ""}`}>
                {g}
              </button>
            ))}
          </div>
          <p className="mb-5 text-sm">
            <span className="!cursor-default chip">{mode.n}</span>
            <span className="ml-1 text-ink2 text-xs">{mode.d}</span>
          </p>

          <button onClick={save} className="w-full btn btn-p">
            Tambahkan ke rak & buka →
            {isAdmin && (
              <span className="opacity-70"> (sebagai {PENERBIT_RESMI})</span>
            )}
          </button>
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
              <div
                key={b.id}
                className="flex items-center gap-3 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
                <Link
                  to={`/buku/${b.slug}`}
                  className="flex-1 min-w-0 hover:underline underline-offset-4">
                  <p className="font-medium text-sm truncate">{b.judul}</p>
                  <p className="text-ink2 text-xs">
                    {b.bab.length} bab · {b.penulis}
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
