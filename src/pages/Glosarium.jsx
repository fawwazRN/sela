import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";

export default function Glosarium() {
  const { glos, addGlos, removeGlos, restoreGlos, isAdmin, user } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ kata: "", arti: "" });
  const [editKey, setEditKey] = useState(null);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const entries = useMemo(() => {
    const s = q.toLowerCase().trim();
    return Object.entries(glos)
      .filter(([k]) => !s || k.includes(s) || glos[k].toLowerCase().includes(s))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [glos, q]);

  const grup = useMemo(() => {
    const m = new Map();
    entries.forEach(([k, v]) => {
      const h = k[0].toUpperCase();
      if (!m.has(h)) m.set(h, []);
      m.get(h).push([k, v]);
    });
    return [...m.entries()];
  }, [entries]);

  const simpan = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    if (!f.kata.trim() || !f.arti.trim()) {
      setErr("Isi kata dan artinya.");
      return;
    }
    try {
      await addGlos(f.kata, f.arti);
      setOk(
        editKey
          ? `✓ "${f.kata}" diperbarui.`
          : `✓ "${f.kata}" ditambahkan. Terima kasih!`,
      );
      setF({ kata: "", arti: "" });
      setEditKey(null);
      setTimeout(() => setOk(""), 3000);
    } catch {
      setErr("Gagal menyimpan. Coba lagi.");
    }
  };

  const mulaiEdit = (k) => {
    setEditKey(k);
    setF({ kata: k, arti: glos[k] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-2xl fadein">
      {/* HERO */}
      <div
        className="relative mb-8 p-8 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #2F5D50, #1A1815)" }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <p className="text-[11px] text-white/60 uppercase tracking-[0.3em]">
            Kamus bersama
          </p>
          <h1 className="mt-1 font-display font-bold text-white text-3xl md:text-4xl">
            Glosarium
          </h1>
          <p className="mt-2 text-white/70 text-sm">
            {Object.keys(glos).length} istilah · tersinkron untuk semua pembaca
            · huruf besar/kecil diabaikan
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari istilah…"
            className="bg-white/95 mt-4 px-4 py-2.5 rounded-xl outline-none w-full max-w-sm text-ink placeholder:text-ink2/70 text-sm"
          />
        </div>
      </div>

      {/* FORM — hanya yang login */}
      {user ? (
        <form onSubmit={simpan} className="gap-3 grid p-5 card">
          <p className="lbl">
            {editKey ? `Edit istilah: ${editKey}` : "Tambah istilah baru"}
          </p>
          <div className="gap-3 grid sm:grid-cols-[1fr_1.4fr]">
            <input
              className="inp"
              placeholder="Kata (contoh: tidur)"
              value={f.kata}
              onChange={(e) => setF({ ...f, kata: e.target.value })}
            />
            <input
              className="inp"
              placeholder="Artinya…"
              value={f.arti}
              onChange={(e) => setF({ ...f, arti: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="text-xs btn btn-p">
              {editKey ? "Simpan perubahan" : "+ Tambah istilah"}
            </button>
            {editKey && (
              <button
                type="button"
                onClick={() => {
                  setEditKey(null);
                  setF({ kata: "", arti: "" });
                }}
                className="text-xs btn btn-o">
                Batal
              </button>
            )}
            {ok && <span className="text-green-600 text-xs">{ok}</span>}
            {err && <span className="text-accent text-xs">{err}</span>}
          </div>
          <p className="text-[11px] text-ink2">
            Tercatat atas nama {user.name || user.email}.
            {isAdmin
              ? " Sebagai admin, kamu bisa mengedit & menghapus."
              : " Admin yang mengkurasi (edit/hapus)."}
          </p>
        </form>
      ) : (
        <div className="mt-6 p-6 text-center card">
          <p className="font-display font-semibold">Ingin menambah istilah?</p>
          <p className="mt-1.5 text-ink2 text-sm">
            Masuk dulu yuk — supaya kontribusimu tercatat atas namamu.
          </p>
          <Link
            to="/masuk"
            state={{ from: "/glosarium" }}
            className="mt-4 text-xs btn btn-p">
            Masuk / Daftar
          </Link>
        </div>
      )}

      {/* DAFTAR PER HURUF */}
      {grup.map(([huruf, daftar]) => (
        <div key={huruf} className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="place-items-center grid bg-ink rounded-full w-8 h-8 font-display font-bold text-paper text-sm">
              {huruf}
            </span>
            <span className="flex-1 bg-line h-px" />
            <span className="text-[11px] text-ink2">
              {daftar.length} istilah
            </span>
          </div>
          <div className="space-y-2">
            {daftar.map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 p-4 card">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold">{k}</p>
                  <p className="mt-0.5 text-ink2 text-sm">{v}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 text-xs shrink-0">
                    <button
                      onClick={() => mulaiEdit(k)}
                      className="hover:underline">
                      edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus "${k}"?`)) removeGlos(k);
                      }}
                      className="text-accent hover:underline">
                      hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {entries.length === 0 && (
        <p className="py-12 text-ink2 text-center">
          Tidak ada istilah untuk “{q}”.
        </p>
      )}

      {isAdmin && (
        <p className="mt-8 text-center">
          <button
            onClick={() => {
              if (confirm("Kembalikan semua istilah bawaan?")) restoreGlos();
            }}
            className="text-ink2 hover:text-ink text-xs underline underline-offset-4">
            ↺ Pulihkan istilah bawaan
          </button>
        </p>
      )}
    </div>
  );
}
