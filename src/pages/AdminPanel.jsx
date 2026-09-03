import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useApp } from "../context/AppContext";

export default function AdminPanel() {
  const { isAdmin, user, listAdmin, addAdmin, removeAdmin } = useApp();
  const [emails, setEmails] = useState(null);
  const [baru, setBaru] = useState("");
  const [msg, setMsg] = useState("");

  const muat = () =>
    listAdmin()
      .then(setEmails)
      .catch(() => setEmails([]));
  useEffect(() => {
    if (isAdmin) muat();
  }, [isAdmin]);

  if (!user) return <Navigate to="/masuk" state={{ from: "/admin" }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const tambah = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await addAdmin(baru);
      setBaru("");
      setMsg("✓ Admin ditambahkan.");
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
        Kelola siapa saja yang punya akses admin.
      </p>

      <form onSubmit={tambah} className="gap-3 grid mt-6 p-5 card">
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
          <div key={em} className="flex items-center gap-3 p-4 card">
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
    </div>
  );
}
