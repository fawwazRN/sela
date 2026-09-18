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
    editGenre,
    restoreGenre,
    warnaGenre,
    customGenres,
  } = useApp();
  const [emails, setEmails] = useState(null);
  const [baru, setBaru] = useState("");
  const [msg, setMsg] = useState("");
  const [subsList, setSubsList] = useState([]);
  const [fSub, setFSub] = useState({ email: "", paket: "plus", bulan: 1 });
  const [fG, setFG] = useState({ nama: "", mode: "imersi", warna: "#5B4B8A" });
  const [editNama, setEditNama] = useState(null);
  const [editMode, setEditMode] = useState("imersi");
  const [editWarna, setEditWarna] = useState("#5B4B8A");

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

      {/* ===== TAMBAH ADMIN ===== */}
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

      {/* ===== DAFTAR ADMIN ===== */}
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

      {/* ===== GENRE: KELOLA PENUH + WARNA SAMPUL ===== */}
      <p className="mt-10 mb-3 lbl">Genre katalog ({customGenres.length})</p>
      <div className="gap-3 grid bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] p-5 border border-line rounded-2xl">
        {/* tambah */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await addGenre(fG.nama, fG.mode, fG.warna);
            setFG({ nama: "", mode: "imersi", warna: "#5B4B8A" });
          }}
          className="gap-2 grid sm:grid-cols-[1.5fr_auto_auto_auto]">
          <input
            className="inp"
            placeholder="Nama genre baru"
            value={fG.nama}
            onChange={(e) => setFG({ ...fG, nama: e.target.value })}
          />
          <select
            className="!w-auto inp"
            value={fG.mode}
            onChange={(e) => setFG({ ...fG, mode: e.target.value })}>
            {["fokus", "imersi", "linimasa", "lambat", "ceria"].map((m) => (
              <option key={m} value={m}>
                Mode: {m}
              </option>
            ))}
          </select>
          <input
            type="color"
            value={fG.warna}
            onChange={(e) => setFG({ ...fG, warna: e.target.value })}
            title="Warna sampul buku genre ini"
            className="!p-1 !w-12 h-9 cursor-pointer inp"
          />
          <button className="text-xs btn btn-p shrink-0">+ Tambah</button>
        </form>

        {/* daftar */}
        <div className="space-y-2 mt-2">
          {customGenres.map((g) => (
            <div key={g.nama} className="p-3 border border-line rounded-xl">
              {editNama === g.nama ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await editGenre(g.nama, editNama, editMode, editWarna);
                    setEditNama(null);
                  }}
                  className="gap-2 grid sm:grid-cols-[1.5fr_auto_auto_auto_auto]">
                  <input
                    className="inp"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                  />
                  <select
                    className="!w-auto inp"
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}>
                    {["fokus", "imersi", "linimasa", "lambat", "ceria"].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ),
                    )}
                  </select>
                  <input
                    type="color"
                    value={editWarna}
                    onChange={(e) => setEditWarna(e.target.value)}
                    className="!p-1 !w-12 h-9 cursor-pointer inp"
                  />
                  <button className="text-xs btn btn-p">Simpan</button>
                  <button
                    type="button"
                    onClick={() => setEditNama(null)}
                    className="text-xs btn btn-o">
                    Batal
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  {/* pratinjau mini sampul dengan warna genre */}
                  <span
                    className="border border-black/20 rounded-md w-8 h-10 shrink-0"
                    style={{
                      background: `linear-gradient(160deg, ${warnaGenre(g.nama)}, ${warnaGenre(g.nama)}cc 55%, #1A1815)`,
                    }}
                    title={warnaGenre(g.nama)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{g.nama}</p>
                    <p className="text-ink2 text-xs">
                      Mode: {g.mode || "imersi"}
                      {g.oleh === "bawaan" ? " · bawaan Sela" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditNama(g.nama);
                      setEditMode(g.mode || "imersi");
                      setEditWarna(warnaGenre(g.nama));
                    }}
                    className="text-xs hover:underline shrink-0">
                    edit
                  </button>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Hapus genre "${g.nama}"?\n\nBuku yang memakainya tidak ikut terhapus — hanya labelnya tetap.`,
                        )
                      )
                        removeGenre(g.nama);
                    }}
                    className="text-accent text-xs hover:underline shrink-0">
                    hapus
                  </button>
                </div>
              )}
            </div>
          ))}
          {customGenres.length === 0 && (
            <p className="py-4 text-ink2 text-xs text-center">
              Semua genre terhapus. Tambah baru, atau pulihkan bawaan di bawah.
            </p>
          )}
        </div>

        {/* pulihkan */}
        <div className="flex justify-between items-center gap-3 mt-1 pt-3 border-line border-t">
          <p className="text-ink2 text-xs">
            Genre bawaan bisa dipulihkan bila terhapus. Warna sampul tiap genre
            bisa diubah lewat tombol edit.
          </p>
          <button onClick={restoreGenre} className="text-xs btn btn-o shrink-0">
            ↺ Pulihkan bawaan
          </button>
        </div>
      </div>
    </div>
  );
}
