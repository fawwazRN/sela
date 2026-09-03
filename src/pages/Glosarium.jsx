import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";

export default function Glosarium() {
  const { glos, addGlos, removeGlos, restoreGlos, isAdmin } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState({ kata: "", arti: "" });
  const [editKey, setEditKey] = useState(null);

  const entries = useMemo(() => {
    const s = q.toLowerCase().trim();
    return Object.entries(glos)
      .filter(([k]) => !s || k.includes(s) || glos[k].toLowerCase().includes(s))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [glos, q]);

  const simpan = (e) => {
    e.preventDefault();
    if (!f.kata.trim() || !f.arti.trim()) return;
    addGlos(f.kata, f.arti);
    setF({ kata: "", arti: "" });
    setEditKey(null);
  };

  const mulaiEdit = (k) => {
    setEditKey(k);
    setF({ kata: k, arti: glos[k] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-2xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">Glosarium</h1>
      <p className="mt-2 text-ink2">
        {Object.keys(glos).length} istilah · tersinkron untuk semua pembaca.
      </p>

      {isAdmin && (
        <form onSubmit={simpan} className="gap-3 grid mt-6 p-5 card">
          <p className="lbl">
            {editKey ? `Edit istilah: ${editKey}` : "Tambah istilah baru"}
          </p>
          <div className="flex sm:flex-row flex-col gap-3">
            <input
              className="inp"
              placeholder="kata (huruf kecil)"
              value={f.kata}
              onChange={(e) => setF({ ...f, kata: e.target.value })}
            />
            <input
              className="flex-1 inp"
              placeholder="artinya…"
              value={f.arti}
              onChange={(e) => setF({ ...f, arti: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
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
          </div>
          <p className="text-[11px] text-ink2">
            Langsung tersimpan ke server — semua pengunjung mendapatkannya.
          </p>
        </form>
      )}

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari istilah…"
        className="mt-8 !w-56 inp"
      />

      <div className="space-y-2 mt-4">
        {entries.map(([k, v]) => (
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
        {entries.length === 0 && (
          <p className="py-12 text-ink2 text-center">
            Tidak ada istilah untuk “{q}”.
          </p>
        )}
      </div>

      {isAdmin && (
        <p className="mt-6 text-center">
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
