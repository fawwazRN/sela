import { useState } from "react";
import { useApp, ADMIN_EMAILS, PENERBIT_RESMI } from "../context/AppContext";

const THEMES = [
  ["terang", "Terang", "#F7F3EA"],
  ["sepia", "Sepia", "#E9DCC0"],
  ["gelap", "Gelap", "#151310"],
];
const keys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith("sela."));

export default function SettingsPage() {
  const { theme, setTheme, isAdmin, hiddenIds, restoreBuiltin, user } =
    useApp();
  const [rfs, setRfs] = useState(() =>
    localStorage.getItem("sela.rfs") ? +localStorage.getItem("sela.rfs") : 18,
  );

  const setFont = (v) => {
    setRfs(v);
    localStorage.setItem("sela.rfs", String(v));
    document.documentElement.style.setProperty("--rfs", v + "px");
  };
  const exportData = () => {
    const data = {};
    keys().forEach((k) => (data[k] = localStorage.getItem(k)));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    a.download = "sela-data.json";
    a.click();
  };
  const importData = (file) => {
    file.text().then((t) => {
      const d = JSON.parse(t);
      Object.entries(d).forEach(([k, v]) => localStorage.setItem(k, v));
      location.reload();
    });
  };
  const resetAll = () => {
    if (confirm("Hapus SEMUA data (rak, progres, highlight, akun lokal)?")) {
      keys().forEach((k) => localStorage.removeItem(k));
      location.reload();
    }
  };

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Pengaturan
      </h1>

      <p className="mt-8 mb-3 lbl">Tema</p>
      <div className="gap-2 grid grid-cols-3">
        {THEMES.map(([id, n, bg]) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`rounded-xl border p-2 text-xs ${theme === id ? "border-ink font-medium" : "border-line"}`}>
            <span
              className="block mb-1.5 rounded-md h-10"
              style={{ background: bg, border: "1px solid #0002" }}
            />
            {n}
          </button>
        ))}
      </div>

      <p className="mt-8 mb-3 lbl">Ukuran huruf baca — {rfs}px</p>
      <input
        type="range"
        min="15"
        max="24"
        value={rfs}
        onChange={(e) => setFont(+e.target.value)}
        className="w-full"
      />
      <div className="mt-3 p-5 card read" style={{ "--rfs": rfs + "px" }}>
        <p>
          Begitu cahaya jatuh pada halaman, dunia lain mulai bernapas. Beginilah
          tulisanmu akan terlihat.
        </p>
      </div>

      {isAdmin && hiddenIds.length > 0 && (
        <>
          <p className="mt-10 mb-3 lbl">Admin</p>
          <div className="flex justify-between items-center gap-3 p-5 card">
            <p className="text-ink2 text-sm">
              {hiddenIds.length} buku bawaan disembunyikan.
            </p>
            <button
              onClick={restoreBuiltin}
              className="text-xs btn btn-o shrink-0">
              Pulihkan semua
            </button>
          </div>
        </>
      )}

      <p className="mt-10 mb-3 lbl">Data kamu (lokal)</p>
      <div className="gap-3 grid p-5 card">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="text-xs btn btn-o">
            ⬇ Export JSON
          </button>
          <label className="text-xs cursor-pointer btn btn-o">
            ⬆ Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) =>
                e.target.files[0] && importData(e.target.files[0])
              }
            />
          </label>
          <button
            onClick={resetAll}
            className="!border-accent/40 !text-accent text-xs btn btn-o">
            Hapus semua data
          </button>
        </div>
        <p className="text-ink2 text-xs">
          Progres, rak, highlight, dan akun demo tersimpan di browser ini —
          tidak dikirim ke mana pun.
        </p>
      </div>

      <p className="mt-10 mb-3 lbl">Akun</p>
      <div className="p-5 text-sm card">
        {user ? (
          <p>
            Masuk sebagai <b>{user.name}</b> ({user.email})
            {isAdmin && (
              <span className="bg-accent/15 ml-2 px-1.5 py-0.5 rounded text-[10px] text-accent uppercase tracking-wider">
                Admin
              </span>
            )}
          </p>
        ) : (
          <p className="text-ink2">Belum masuk. Baca tetap bisa tanpa akun.</p>
        )}
      </div>
    </div>
  );
}
