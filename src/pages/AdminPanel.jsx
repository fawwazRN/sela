import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useApp } from "../context/AppContext";

export default function AdminPanel() {
  const {
    isAdmin,
    user,
    listAdmin,
    addAdmin,
    removeAdmin,
    aktifkanSubs,
    listSubs,
    matikanSubs,
    addGenre,
    removeGenre,
    customGenres,
  } = useApp();
  const [emails, setEmails] = useState(null);
  const [baru, setBaru] = useState("");
  const [msg, setMsg] = useState("");
  const [subsList, setSubsList] = useState([]);
  const [fSub, setFSub] = useState({ email: "", paket: "plus", bulan: 1 });
  const [fG, setFG] = useState({ nama: "", mode: "imersi" });

  const muat = () =>
    listAdmin()
      .then(setEmails)
      .catch(() => setEmails([]));
  useEffect(() => {
    if (!isAdmin) return;
    muat();
    listSubs()
      .then(setSubsList)
      .catch(() => setSubsList([]));
  }, [isAdmin]);

  if (!user) return <Navigate to="/masuk" state={{ from: "/admin" }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tambah = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await addAdmin(baru);
      setBaru("");
      setMsg("Admin ditambahkan.");
      muat();
    } catch (er) {
      setMsg(er.message || "Gagal.");
    }
    setTimeout(() => setMsg(""), 3000);
  };

  const hapus = async (email) => {
    if (
      email === user.email &&
      !confirm(
        "Ini emailmu sendiri — kamu akan KEHILANGAN akses admin. Lanjut?",
      )
    )
      return;
    if (!confirm(`Jadikan ${email} bukan admin?`)) return;
    try {
      await removeAdmin(email);
      muat();
    } catch (er) {
      setMsg(er.message);
    }
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Panel Admin
      </h1>
      <p className="mt-2 text-ink2">
        Kelola admin, langganan, dan genre katalog.
      </p>

      <form
        onSubmit={tambah}
        className="gap-3 grid bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-6 p-5 border border-line rounded-2xl">
        <p className="lbl">Tambah admin baru</p>
        <div className="flex gap-2">
          <input
            className="flex-1 inp"
            placeholder="email@orang.com"
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
          />
          <button className="text-xs btn btn-p shrink-0">
            + Jadikan admin
          </button>
        </div>
        {msg && <p className="text-ink2 text-xs">{msg}</p>}
      </form>

      <p className="mt-8 mb-3 lbl">Daftar admin ({emails?.length ?? "…"})</p>
      <div className="space-y-2">
        {(emails || []).map((em) => (
          <div
            key={em}
            className="flex items-center gap-3 bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-4 border border-line rounded-2xl">
            <p className="flex-1 text-sm truncate">
              {em}
              {em === user.email && (
                <span className="ml-2 font-semibold text-[10px] text-accent">
                  KAMU
                </span>
              )}
            </p>
            <button
              onClick={() => hapus(em)}
              className="text-accent text-xs hover:underline shrink-0">
              cabut
            </button>
          </div>
        ))}
        {emails?.length === 0 && (
          <p className="py-8 text-ink2 text-sm text-center">
            Tidak ada admin terdaftar.
          </p>
        )}
      </div>

      {/* ===== KELOLA LANGGANAN ===== */}
      <p className="mt-10 mb-3 lbl">Langganan terdaftar ({subsList.length})</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          try {
            await aktifkanSubs(fSub.email, fSub.paket, fSub.bulan);
            setMsg("Langganan diaktifkan: " + fSub.email);
            setFSub({ email: "", paket: "plus", bulan: 1 });
            listSubs().then(setSubsList);
          } catch (er) {
            setMsg(er.message || "Gagal.");
          }
          setTimeout(() => setMsg(""), 4000);
        }}
        className="gap-3 grid bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-5 border border-line rounded-2xl">
        <p className="lbl">Aktifkan langganan (setelah terima pembayaran)</p>
        <div className="gap-2 grid sm:grid-cols-[1.5fr_auto_auto_auto]">
          <input
            className="inp"
            placeholder="email pembayar"
            value={fSub.email}
            onChange={(e) => setFSub({ ...fSub, email: e.target.value })}
          />
          <select
            className="!w-auto inp"
            value={fSub.paket}
            onChange={(e) => setFSub({ ...fSub, paket: e.target.value })}>
            <option value="plus">Sela Plus (penulis)</option>
            <option value="pro">Sela Pro (pembaca)</option>
            <option value="ekstra">Sela Ekstra (Plus + Pro)</option>
          </select>
          <select
            className="!w-auto inp"
            value={fSub.bulan}
            onChange={(e) => setFSub({ ...fSub, bulan: +e.target.value })}>
            {[1, 3, 6, 12].map((b) => (
              <option key={b} value={b}>
                {b} bln
              </option>
            ))}
          </select>
          <button className="text-xs btn btn-p shrink-0">Aktifkan</button>
        </div>
        {msg && <p className="text-ink2 text-xs">{msg}</p>}
        <div className="space-y-2 mt-2">
          {subsList.map((s) => (
            <div
              key={s.user_id + s.paket}
              className="flex items-center gap-3 bg-paper p-3 border border-line rounded-xl text-sm">
              <div className="flex-1 min-w-0">
                <p className="truncate">
                  {s.email}
                  <span className="bg-line ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase">
                    {s.paket}
                  </span>
                </p>
                <p className="text-ink2 text-xs">
                  s.d. {new Date(s.expired_at).toLocaleDateString("id-ID")} ·{" "}
                  {s.aktif ? "aktif" : "dimatikan"}
                </p>
              </div>
              {s.aktif && (
                <button
                  onClick={() => matikanSubs(s.user_id, s.paket)}
                  className="text-accent text-xs hover:underline shrink-0">
                  matikan
                </button>
              )}
            </div>
          ))}
          {subsList.length === 0 && (
            <p className="py-4 text-ink2 text-xs text-center">
              Belum ada langganan.
            </p>
          )}
        </div>
      </form>

      {/* ===== GENRE KUSTOM ===== */}
      <p className="mt-10 mb-3 lbl">Genre kustom</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await addGenre(fG.nama, fG.mode);
          setFG({ nama: "", mode: "imersi" });
        }}
        className="gap-3 grid bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-5 border border-line rounded-2xl">
        <p className="lbl">Tambah genre baru (untuk katalog)</p>
        <div className="gap-2 grid sm:grid-cols-[1.5fr_auto_auto]">
          <input
            className="inp"
            placeholder="Nama genre (mis. Mistery Medis)"
            value={fG.nama}
            onChange={(e) => setFG({ ...fG, nama: e.target.value })}
          />
          <select
            className="!w-auto inp"
            value={fG.mode}
            onChange={(e) => setFG({ ...fG, mode: e.target.value })}>
            <option value="fokus">Mode: Fokus</option>
            <option value="imersi">Mode: Imersi</option>
            <option value="linimasa">Mode: Linimasa</option>
            <option value="lambat">Mode: Lambat</option>
            <option value="ceria">Mode: Ceria</option>
          </select>
          <button className="text-xs btn btn-p shrink-0">Tambah</button>
        </div>
        {customGenres.length > 0 ? (
          <div className="space-y-2 mt-2">
            {customGenres.map((g) => (
              <div
                key={g.nama}
                className="flex items-center gap-3 bg-paper p-3 border border-line rounded-xl text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{g.nama}</p>
                  <p className="text-ink2 text-xs">
                    Mode: {g.mode || "imersi"}
                    {g.oleh ? ` · dibuat oleh ${g.oleh}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Hapus genre "${g.nama}"?\n\nBuku yang sudah memakai genre ini tidak ikut terhapus — hanya labelnya tetap tercatat.`,
                      )
                    )
                      removeGenre(g.nama);
                  }}
                  className="text-accent text-xs hover:underline shrink-0">
                  hapus
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-ink2 text-xs">
            Belum ada genre kustom. Genre bawaan (Fiksi, Pelajaran, Sejarah,
            Puisi, Anak, Umum) melekat pada kode dan tidak dapat dihapus.
          </p>
        )}
      </form>
    </div>
  );
}
