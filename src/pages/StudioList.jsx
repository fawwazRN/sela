import { useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtDate } from "../lib/utils";

/* ===== bangun ulang markdown satu bab dari buku ter-publish ===== */
const babKeMd = (c) => {
  /* raw tersimpan (publish versi baru) → 100% akurat */
  if (c.raw) return `# ${c.judul}\n\n${c.raw}`;

  /* rekonstruksi dari blok (publish versi lama) */
  let s = "";
  (c.isi || []).forEach((bl) => {
    if (bl.t === "p") s += bl.v + "\n\n";
    else if (bl.t === "h") s += "#".repeat(bl.lvl || 2) + " " + bl.v + "\n\n";
    else if (bl.t === "ul")
      s += bl.v.map((li) => "- " + li).join("\n") + "\n\n";
    else if (bl.t === "pre") s += "```\n" + bl.v + "\n```\n\n";
    else if (bl.t === "tl") s += `@tl ${bl.y || ""} | ${bl.v}\n`;
    else if (bl.t === "verse") s += bl.v.join("\n") + "\n\n";
    else if (bl.t === "quote") {
      const arr = Array.isArray(bl.v) ? bl.v : [];
      s +=
        arr
          .map((q) =>
            typeof q === "string"
              ? "> " + q
              : q.li
                ? "> * " + q.text
                : "> " + q.text,
          )
          .join("\n") + "\n\n";
    } else if (bl.t === "table") {
      const rows = bl.v || [];
      if (rows.length) {
        s += "| " + rows[0].join(" | ") + " |\n";
        s += "| " + rows[0].map(() => "---").join(" | ") + " |\n";
        rows.slice(1).forEach((r) => (s += "| " + r.join(" | ") + " |\n"));
        s += "\n";
      }
    }
    /* diagram tidak punya bentuk markdown — dilewati */
  });
  if (c.ringkasan) s += `%% ${c.ringkasan}\n\n`;
  if (c.kuis)
    s +=
      `@?? ${c.kuis.q} | ` +
      c.kuis.o.map((o, i) => o + (i === c.kuis.a ? "*" : "")).join(" | ") +
      "\n\n";
  return `# ${c.judul}\n\n` + s;
};

export default function StudioList() {
  const {
    user,
    drafts,
    saveDraft,
    removeDraft,
    books,
    removeCustomBook,
    isAdmin,
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
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-3xl">Studio</h1>
        <p className="mt-3 text-ink2 leading-relaxed">
          Ruang penulis terbuka untuk pembaca terdaftar. Gratis, satu menit —
          dan bukumu bisa tayang untuk semua orang.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Link to="/masuk" state={{ from: "/studio" }} className="btn btn-p">
            Masuk / Daftar
          </Link>
          <Link to="/tutorial" className="btn btn-o">
            Pelajari dulu
          </Link>
        </div>
      </div>
    );

  const published = books.filter(
    (b) => b.custom && (isAdmin || b.owner === user.email),
  );

  /* ← LANGKAH 3: edit cerdas lintas admin.
     - draft ada          → langsung buka, pastikan target terisi
     - draft tidak ada    → bangun ulang dari buku ter-publish,
       ID & target tetap → publish ulang MENIMPA buku yang sama */
  const editBook = (b) => {
    const draftId = b.slug.startsWith("studio-") ? b.slug.slice(7) : null;

    if (draftId && drafts.some((d) => d.id === draftId)) {
      const d = drafts.find((x) => x.id === draftId);
      if (!d.targetId) saveDraft({ ...d, targetId: b.id, targetSlug: b.slug });
      nav(`/studio/${draftId}`);
      return;
    }

    const md = b.bab.map(babKeMd).join("\n\n");
    const id = saveDraft({
      ...(draftId ? { id: draftId } : {}),
      targetId: b.id,
      targetSlug: b.slug,
      judul: b.judul,
      genre: b.genre,
      md,
    });
    nav(`/studio/${id}`);
  };

  const baru = () => {
    const id = saveDraft({
      judul: "Tanpa Judul",
      genre: "Fiksi",
      md: `# Bab Satu\n\nMulai menulis di sini. Tandai tokoh dengan {Nama}.\n\n**Bold**, *italic*, \`kode\`, > kutipan, dan daftar:\n- poin satu\n- poin dua\n\nBuat bab baru dengan baris \`# Judul Bab\`.\n\nLinimasa:\n\n@tl 1901 | Peristiwa pertama.\n@tl 1920 | Peristiwa kedua.\n\n%% Ini ringkasan bab (muncul di akhir bab).\n\n@?? Contoh kuis? | Jawaban A | Jawaban benar* | Jawaban C`,
    });
    nav(`/studio/${id}`);
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-3xl fadein">
      {/* HERO */}
      <div
        className="relative mb-8 p-8 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #5B4B8A, #1A1815)" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative flex justify-between items-center gap-4">
          <div>
            <p className="text-[11px] text-white/60 uppercase tracking-[0.3em]">
              Ruang penulis
            </p>
            <h1 className="mt-1 font-display font-bold text-white text-3xl">
              Studio
            </h1>
            <p className="mt-2 text-white/70 text-sm">
              {drafts.length} draft · {published.length} buku tayang
            </p>
          </div>
          <button onClick={baru} className="btn btn-p shrink-0">
            + Tulis baru
          </button>
        </div>
      </div>

      <p className="text-ink2 text-sm">
        Tulis buku interaktif dengan markap sederhana: kuis, ringkasan, tokoh,
        linimasa. Pratinjau = hasil asli. Butuh panduan? Buka{" "}
        <Link
          to="/tutorial"
          className="text-accent underline underline-offset-4">
          tutorial penulisan
        </Link>
        .
      </p>

      <p className="mt-10 mb-3 lbl">Draft ({drafts.length})</p>
      <div className="space-y-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line hover:border-ink rounded-2xl transition-colors">
            <span className="place-items-center grid bg-line/60 rounded-lg w-9 h-9 font-display font-bold text-sm shrink-0">
              {d.judul[0].toUpperCase()}
            </span>
            <Link to={`/studio/${d.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{d.judul}</p>
              {/* ← LANGKAH 3: penanda draft milik admin lain */}
              <p className="text-ink2 text-xs">
                {d.genre} · diubah {fmtDate(d.at)}
                {!d.mine && (
                  <span className="ml-1 font-semibold text-accent">
                    · draft {d.ownerEmail || "penulis lain"}
                  </span>
                )}
              </p>
            </Link>
            <Link
              to={`/studio/${d.id}`}
              className="!px-3 !py-1.5 text-[11px] btn btn-o shrink-0">
              Buka
            </Link>
            <button
              onClick={() => {
                if (confirm(`Hapus draft "${d.judul}"?`)) removeDraft(d.id);
              }}
              className="text-accent text-xs hover:underline shrink-0">
              hapus
            </button>
          </div>
        ))}
        {drafts.length === 0 && (
          <p className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] py-10 border border-line rounded-2xl text-ink2 text-sm text-center">
            Belum ada draft. Klik <b>+ Tulis baru</b> — template contoh sudah
            terisi otomatis.
          </p>
        )}
      </div>

      {published.length > 0 && (
        <>
          <p className="mt-10 mb-3 lbl">
            Terpublikasi ke Jelajah ({published.length})
          </p>
          <div className="space-y-2">
            {published.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-3 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
                <Link
                  to={`/buku/${b.slug}`}
                  className="flex-1 min-w-0 hover:underline underline-offset-4">
                  <p className="font-medium text-sm truncate">{b.judul}</p>
                  <p className="text-ink2 text-xs">
                    {b.bab.length} bab · oleh {b.penulis} · {b.genre}
                  </p>
                </Link>
                {/* ← LANGKAH 3: Edit untuk SEMUA buku custom (admin) */}
                <button
                  onClick={() => editBook(b)}
                  className="text-xs hover:underline shrink-0">
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus "${b.judul}" dari katalog?`))
                      removeCustomBook(b.slug);
                  }}
                  className="text-accent text-xs hover:underline shrink-0">
                  hapus
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink2">
            "Edit" membuka draft dari buku ter-publish — kalau draftnya tidak
            ada di perangkat ini, draft dibangun ulang otomatis dari bukunya.
            Publish ulang menimpa buku yang sama.
          </p>
        </>
      )}
    </div>
  );
}
