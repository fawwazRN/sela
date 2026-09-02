import { Navigate, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtDate } from "../lib/utils";

export default function StudioList() {
  const { user, drafts, saveDraft, removeDraft, books, removeCustomBook } =
    useApp();
  const nav = useNavigate();
  if (!user)
    return <Navigate to="/masuk" state={{ from: "/studio" }} replace />;

  const published = books.filter((b) => b.custom === "Studio");
  const baru = () => {
    const id = saveDraft({
      judul: "Tanpa Judul",
      genre: "Fiksi",
      md: `# Bab Satu\n\nMulai menulis di sini. Tandai tokoh dengan {Nama}.\n\n**Bold**, *italic*, \`kode\`, > kutipan, dan daftar:\n- poin satu\n- poin dua\n\nBuat bab baru dengan baris \`# Judul Bab\`.\n\n%% Ini ringkasan bab (muncul di akhir bab).\n\n@?? Contoh kuis? | Jawaban A | Jawaban benar* | Jawaban C`,
    });
    nav(`/studio/${id}`);
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-3xl fadein">
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-display font-bold text-3xl md:text-4xl">Studio</h1>
        <button onClick={baru} className="btn btn-p shrink-0">
          + Tulis baru
        </button>
      </div>
      <p className="mt-2 text-ink2">
        Tulis buku interaktif: kuis, ringkasan, tokoh. Pratinjau = hasil asli.
      </p>

      <p className="mt-8 mb-3 lbl">Draft ({drafts.length})</p>
      <div className="space-y-2">
        {drafts.map((d) => (
          <div key={d.id} className="flex items-center gap-3 p-4 card">
            <Link to={`/studio/${d.id}`} className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{d.judul}</p>
              <p className="text-ink2 text-xs">
                {d.genre} · diubah {fmtDate(d.at)}
              </p>
            </Link>
            <Link
              to={`/studio/${d.id}`}
              className="text-xs hover:underline shrink-0">
              buka
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
          <p className="py-8 text-ink2 text-sm text-center">Belum ada draft.</p>
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
                    {b.bab.length} bab · oleh {b.penulis}
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
            "Edit" membuka salinan draft dari buku ter-publish — ubah, lalu
            publish ulang.
          </p>
        </>
      )}
    </div>
  );
}
