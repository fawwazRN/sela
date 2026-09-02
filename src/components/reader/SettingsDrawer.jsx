import { useApp } from "../../context/AppContext";

const THEMES = [
  ["terang", "Terang"],
  ["sepia", "Sepia"],
  ["gelap", "Gelap"],
];
const MODES = [
  ["fokus", "Fokus"],
  ["imersi", "Imersi"],
  ["linimasa", "Linimasa"],
  ["lambat", "Lambat"],
  ["ceria", "Ceria"],
];

export default function SettingsDrawer({
  open,
  onClose,
  mode,
  setMode,
  rfs,
  setRfs,
}) {
  const { theme, setTheme } = useApp();
  if (!open) return null;
  return (
    <>
      <div className="z-40 fixed inset-0 bg-black/30" onClick={onClose} />
      <aside className="top-0 right-0 bottom-0 z-50 fixed bg-card p-6 border-line border-l w-80 max-w-full overflow-y-auto fadein">
        <div className="flex justify-between items-center mb-6">
          <p className="font-display font-bold text-lg">Pengaturan baca</p>
          <button onClick={onClose} className="px-2 text-2xl leading-none">
            ×
          </button>
        </div>
        <p className="mb-2 lbl">Tema</p>
        <div className="gap-2 grid grid-cols-3 mb-6">
          {THEMES.map(([id, n]) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={`rounded-xl border p-2 text-xs ${theme === id ? "border-ink font-medium" : "border-line"}`}>
              <span
                className="block mb-1.5 rounded-md h-8"
                style={{
                  background:
                    id === "terang"
                      ? "#F7F3EA"
                      : id === "sepia"
                        ? "#E9DCC0"
                        : "#151310",
                  border: "1px solid #0002",
                }}
              />
              {n}
            </button>
          ))}
        </div>
        <p className="mb-2 lbl">Ukuran huruf — {rfs}px</p>
        <input
          type="range"
          min="15"
          max="24"
          value={rfs}
          onChange={(e) => setRfs(+e.target.value)}
          className="mb-6 w-full"
        />
        <p className="mb-2 lbl">Mode tampil</p>
        <div className="gap-2 grid mb-6">
          {MODES.map(([id, n]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`text-left px-4 py-2.5 rounded-xl border text-sm ${mode === id ? "border-ink bg-line/40 font-medium" : "border-line"}`}>
              {n}
              {mode === id && " ●"}
            </button>
          ))}
        </div>
        <p className="text-ink2 text-xs leading-relaxed">
          Setelan disimpan otomatis di perangkat ini.
        </p>
      </aside>
    </>
  );
}
