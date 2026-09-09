import { useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtDate } from "../lib/utils";

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
            className="flex items-center gap-3 p-4 hover:border-ink transition-colors card">
            <span className="place-items-center grid bg-line/60 rounded-lg w-9 h-9 font-display font-bold text-sm shrink-0">
              {d.judul[0].toUpperCase()}
            </span>
            <Link to={`/studio/${d.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{d.judul}</p>
              <p className="text-ink2 text-xs">
                {d.genre} · diubah {fmtDate(d.at)}
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
          <p className="py-10 text-ink2 text-sm text-center card">
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
              <div key={b.id} className="flex items-center gap-3 p-4 card">
                <Link
                  to={`/buku/${b.slug}`}
                  className="flex-1 min-w-0 hover:underline underline-offset-4">
                  <p className="font-medium text-sm truncate">{b.judul}</p>
                  <p className="text-ink2 text-xs">
                    {b.bab.length} bab · oleh {b.penulis} · {b.genre}
                  </p>
                </Link>
                {b.slug.startsWith("studio-") && (
                  <Link
                    to={`/studio/${b.slug.slice(7)}`}
                    className="text-xs hover:underline shrink-0">
                    Edit
                  </Link>
                )}
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
            "Edit" membuka draft dari buku ter-publish — ubah, lalu publish
            ulang.
          </p>
        </>
      )}
    </div>
  );
}
