import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { GENRES_LIST, ACC } from "../data/books";

const THEMES = [
  ["terang", "Terang", "#F7F3EA"],
  ["sepia", "Sepia", "#E9DCC0"],
  ["gelap", "Gelap", "#151310"],
];
const keys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith("sela."));

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    isAdmin,
    hiddenIds,
    restoreBuiltin,
    user,
    goal,
    setGoal,
  } = useApp();
  const [rfs, setRfs] = useState(() =>
    localStorage.getItem("sela.rfs") ? +localStorage.getItem("sela.rfs") : 18,
  );
  const [fontSerif, setFontSerif] = useState(
    () => localStorage.getItem("sela.fontSerif") !== "0",
  );
  const [nama, setNama] = useState(user?.name || "");
  const [tersimpan, setTersimpan] = useState("");
  const flash = (t) => {
    setTersimpan(t);
    setTimeout(() => setTersimpan(""), 2000);
  };

  const setFont = (v) => {
    setRfs(v);
    localStorage.setItem("sela.rfs", String(v));
    document.documentElement.style.setProperty("--rfs", v + "px");
  };
  const setSerif = (v) => {
    setFontSerif(v);
    localStorage.setItem("sela.fontSerif", v ? "1" : "0");
    document.documentElement.style.setProperty(
      "--font-body-override",
      v
        ? "var(--font-body)"
        : "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    );
    document.body.style.fontFamily = v
      ? ""
      : "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
  };
  const simpanNama = () => {
    if (!nama.trim()) return;
    const u = JSON.parse(localStorage.getItem("sela.user") || "null");
    if (u) {
      u.name = nama.trim();
      localStorage.setItem("sela.user", JSON.stringify(u));
      flash("✓ Nama tersimpan");
    }
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

  const jmlNotes = keys().filter((k) => k.startsWith("sela.note.")).length;

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-2xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Pengaturan
      </h1>
      {tersimpan && <p className="mt-2 text-green-600 text-xs">{tersimpan}</p>}

      {/* ===== PROFIL ===== */}
      <section className="mt-6 p-5 card">
        <div className="flex items-center gap-4">
          <span className="relative place-items-center grid bg-accent rounded-full w-14 h-14 font-display font-bold text-white text-xl">
            {(user?.name || "?")[0].toUpperCase()}
            {isAdmin && (
              <span
                className="-top-1 -right-1 absolute place-items-center grid bg-ink border-2 border-paper rounded-full text-paper"
                style={{ width: 20, height: 20 }}>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="currentColor">
                  <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
                </svg>
              </span>
            )}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold">
              {user?.name || "Pembaca tamu"}
            </p>
            <p className="text-ink2 text-xs truncate">
              {user?.email || "Belum masuk — "}
              {!user && (
                <Link
                  to="/masuk"
                  className="text-accent underline underline-offset-4">
                  masuk sekarang
                </Link>
              )}
            </p>
          </div>
          {isAdmin && (
            <span className="bg-accent/15 px-2 py-1 rounded text-[10px] text-accent uppercase tracking-wider">
              Admin
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 inp"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama tampilan (kartu, ulasan, chat)"
          />
          <button onClick={simpanNama} className="text-xs btn btn-o shrink-0">
            Simpan nama
          </button>
        </div>
      </section>

      {/* ===== TAMPILAN ===== */}
      <p className="mt-10 mb-3 lbl">Tema</p>
      <div className="gap-3 grid grid-cols-3">
        {THEMES.map(([id, n, bg]) => (
          <button
            key={id}
            onClick={() => setTheme(id)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${theme === id ? "border-accent shadow-md" : "border-line hover:border-ink"}`}>
            <span
              className="block relative mb-2 rounded-lg h-12 overflow-hidden"
              style={{ background: bg, border: "1px solid #0002" }}>
              <span
                className="top-2 right-6 left-2 absolute rounded h-1.5"
                style={{ background: "#1A181522" }}
              />
              <span
                className="top-5 right-3 left-2 absolute rounded h-1.5"
                style={{ background: "#1A181514" }}
              />
              <span
                className="top-8 left-2 absolute rounded w-8 h-1.5"
                style={{ background: ACC.Fiksi + "55" }}
              />
            </span>
            <span className="font-medium text-xs">{n}</span>
          </button>
        ))}
      </div>

      <p className="mt-8 mb-3 lbl">Tipografi baca</p>
      <div className="gap-4 grid p-5 card">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-ink2">Ukuran huruf</span>
            <span className="font-medium">{rfs}px</span>
          </div>
          <input
            type="range"
            min="15"
            max="24"
            value={rfs}
            onChange={(e) => setFont(+e.target.value)}
            className="w-full"
          />
        </div>
        <label className="flex justify-between items-center gap-3 cursor-pointer">
          <span>
            <span className="block font-medium text-sm">Huruf serif</span>
            <span className="block text-ink2 text-xs">
              Literata untuk isi buku. Matikan untuk font sistem yang lebih
              polos.
            </span>
          </span>
          <button
            onClick={() => setSerif(!fontSerif)}
            role="switch"
            aria-checked={fontSerif}
            className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${fontSerif ? "bg-accent" : "bg-line"}`}>
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${fontSerif ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </label>
        <div
          className="bg-paper p-4 border border-line rounded-xl"
          style={{ fontSize: rfs + "px" }}>
          <p
            style={{
              fontFamily: fontSerif
                ? "var(--font-body)"
                : "system-ui, sans-serif",
            }}>
            Begitu cahaya jatuh pada halaman, dunia lain mulai bernapas —
            beginilah bukumu terlihat.
          </p>
        </div>
      </div>

      {/* ===== TARGET ===== */}
      <p className="mt-8 mb-3 lbl">Target membaca harian</p>
      <div className="p-5 card">
        <div className="flex flex-wrap gap-2">
          {[10, 15, 20, 30, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => setGoal(m)}
              className={`chip ${goal === m ? "chip-on" : ""}`}>
              {m} mnt
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-ink2">
          Cincin target tampil di Beranda & Statistik. Tersinkron ke akunmu.
        </p>
      </div>

      {/* ===== ADMIN ===== */}
      {isAdmin && (
        <>
          <p className="mt-8 mb-3 lbl">Kelola katalog</p>
          <div className="gap-3 grid p-5 card">
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-medium text-sm">Buku bawaan disembunyikan</p>
                <p className="text-ink2 text-xs">
                  {hiddenIds.length} buku tidak tampil di katalog.
                </p>
              </div>
              <button
                onClick={restoreBuiltin}
                disabled={!hiddenIds.length}
                className="disabled:opacity-40 text-xs btn btn-o shrink-0">
                Pulihkan semua
              </button>
            </div>
            <div className="bg-line h-px" />
            <div className="flex justify-between items-center gap-3">
              <div>
                <p className="font-medium text-sm">Panel admin</p>
                <p className="text-ink2 text-xs">
                  Tambah/cabut akses admin lain.
                </p>
              </div>
              <Link to="/admin" className="text-xs btn btn-p shrink-0">
                Buka →
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ===== GENRE FAVORIT (info) ===== */}
      <p className="mt-8 mb-3 lbl">Genre yang tersedia</p>
      <div className="flex flex-wrap gap-2 p-4 card">
        {GENRES_LIST.map((g) => (
          <span key={g} className="!text-[11px] !cursor-default chip">
            {g}
          </span>
        ))}
      </div>

      {/* ===== DATA ===== */}
      <p className="mt-8 mb-3 lbl">Data & privasi</p>
      <div className="gap-3 grid p-5 card">
        <p className="text-ink2 text-xs">
          {jmlNotes > 0 && (
            <>Ada {jmlNotes} catatan tersimpan di perangkat ini. </>
          )}
          Semua progres, rak, highlight, dan akunmu tersimpan aman — tidak ada
          iklan, tidak ada pelacakan.
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="text-xs btn btn-o">
            Export JSON
          </button>
          <label className="text-xs cursor-pointer btn btn-o">
            Import JSON
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
      </div>
    </div>
  );
}
