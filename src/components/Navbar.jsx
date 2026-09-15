import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router";
import { useApp } from "../context/AppContext";

/* pill latar yang meluncur ke link aktif */
function Pill({ links, lokasi }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ opacity: 0 });
  useEffect(() => {
    const aktip = ref.current?.querySelector("[data-aktif='1']");
    if (aktip) {
      setStyle({
        opacity: 1,
        width: aktip.offsetWidth,
        left: aktip.offsetLeft,
      });
    } else setStyle((s) => ({ ...s, opacity: 0 }));
  }, [lokasi, links.length]);
  return (
    <span
      ref={ref}
      className="hidden relative md:flex items-center gap-0.5 bg-line/40 p-1 rounded-full">
      <span
        className="top-1 bottom-1 absolute bg-paper shadow-sm rounded-full transition-all duration-300 ease-out"
        style={style}
      />
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          data-aktif={l.to === lokasi ? "1" : "0"}
          className={({ isActive }) =>
            `relative z-10 px-3.5 py-1.5 rounded-full text-[13px] transition-colors ${isActive ? "text-ink font-semibold" : "text-ink2 hover:text-ink"}`
          }>
          {l.label}
        </NavLink>
      ))}
    </span>
  );
}

export default function Navbar({ onSearch }) {
  const { user, logout, isAdmin } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [susut, setSusut] = useState(false);
  const [progress, setProgress] = useState(0);
  const nav = useNavigate();
  const lokasi = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const f = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("click", f);
    return () => document.removeEventListener("click", f);
  }, []);

  /* navbar menyusut + progress baca saat scroll */
  useEffect(() => {
    const f = () => {
      setSusut(window.scrollY > 30);
      const max = document.body.scrollHeight - innerHeight;
      setProgress(max > 0 ? Math.min(1, scrollY / max) : 0);
    };
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [lokasi.pathname]);

  /* tutup menu saat pindah halaman */
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [lokasi.pathname]);

  const links = [
    { to: "/jelajah", label: "Jelajah" },
    { to: "/glosarium", label: "Glosarium" },
    { to: "/catatan", label: "Catatan" },
    { to: "/tutorial", label: "Tutorial" },
    { to: "/impor", label: "Impor" },
    ...(user ? [{ to: "/studio", label: "Studio" }] : []),
  ];

  const MENU = [
    ["/saya", "Rak saya", "M4 6h16v14H4zM8 6v14"],
    ["/saya/statistik", "Statistik", "M4 20V10M10 20V4M16 20v-6"],
    ["/saya/pengaturan", "Pengaturan", "M12 8a4 4 0 100 8 4 4 0 000-8z"],
    ...(isAdmin
      ? [
          [
            "/admin",
            "Panel Admin ★",
            "M12 2l8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V6z",
          ],
        ]
      : []),
  ];

  return (
    <header className="top-0 z-40 sticky">
      <div
        className={`bg-paper/85 backdrop-blur-md border-b border-line transition-all duration-300 ${susut ? "shadow-[0_2px_16px_rgba(26,24,21,0.06)]" : ""}`}>
        <div
          className={`max-w-6xl mx-auto px-5 flex items-center gap-4 transition-all duration-300 ${susut ? "h-11" : "h-16"}`}>
          {/* LOGO — titik bernapas */}
          <Link
            to="/"
            className="group flex items-center font-display font-bold text-xl tracking-tight">
            Sela
            <span className="relative ml-0.5 text-accent">
              .
              <span className="-top-1 -right-2 absolute inset-0 opacity-30 text-[8px] text-accent animate-ping">
                ●
              </span>
            </span>
          </Link>

          {/* PILL NAV — signature */}
          <Pill links={links} lokasi={lokasi.pathname} />

          <div className="flex-1" />

          {/* CARI */}
          <button
            onClick={onSearch}
            className="hidden sm:inline-flex items-center gap-2 hover:scale-[1.03] transition-transform chip">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Cari <span className="ml-1 kbd">⌘K</span>
          </button>

          {/* AKUN */}
          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setMenu((m) => !m)}
                className={`relative w-9 h-9 rounded-full bg-accent text-white font-display font-semibold grid place-items-center transition-all ${menu ? "ring-2 ring-accent/40 ring-offset-2 ring-offset-paper scale-105" : "hover:scale-105"}`}
                title={isAdmin ? "Admin" : undefined}>
                {user.name[0].toUpperCase()}
                {isAdmin && (
                  <span className="-top-1 -right-1 absolute place-items-center grid bg-ink border border-paper rounded-full w-4 h-4 text-paper">
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="currentColor">
                      <path d="M12 2l2.9 6.26 6.6.57-5 4.36 1.5 6.45L12 16.9 5.99 19.64l1.5-6.45-5-4.36 6.6-.57L12 2z" />
                    </svg>
                  </span>
                )}
              </button>
              {menu && (
                <div className="right-0 absolute bg-paper shadow-[0_12px_32px_rgba(26,24,21,0.16)] mt-3 p-1.5 border border-line rounded-2xl w-56 overflow-hidden fadein">
                  <div className="flex items-center gap-3 px-3 pt-2.5 pb-3">
                    <span className="place-items-center grid bg-accent rounded-full w-10 h-10 font-display font-bold text-white shrink-0">
                      {user.name[0].toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.name}
                        {isAdmin && (
                          <span className="ml-1 font-semibold text-[10px] text-accent">
                            · ADMIN
                          </span>
                        )}
                      </p>
                      <p className="text-ink2 text-xs truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="bg-line h-px" />
                  {MENU.map(([to, label, d]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-2.5 hover:bg-line/50 px-3 py-2 rounded-lg text-sm">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="text-ink2">
                        <path d={d} />
                      </svg>
                      {label}
                    </Link>
                  ))}
                  <div className="bg-line my-1 h-px" />
                  <button
                    onClick={() => {
                      logout();
                      setMenu(false);
                      nav("/");
                    }}
                    className="flex items-center gap-2.5 hover:bg-accent/10 px-3 py-2 rounded-lg w-full text-accent text-sm text-left">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/masuk" className="!px-4 !py-1.5 btn btn-p">
              Masuk
            </Link>
          )}

          {/* HAMBURGER */}
          <button
            className="md:hidden -mr-1.5 p-1.5"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu">
            {open ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* ===== PROGRESS BACA GLOBAL ===== */}
        <div className="bg-transparent h-[2px]">
          <div
            className="bg-accent h-full transition-[width] duration-150"
            style={{
              width: `${progress * 100}%`,
              opacity: progress > 0.01 ? 1 : 0,
            }}
          />
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <nav className="md:hidden flex flex-col gap-0.5 bg-paper px-5 py-3 border-line border-t fadein">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-2.5 px-3 rounded-lg text-sm ${isActive ? "bg-line/50 font-medium" : "text-ink2 hover:text-ink"}`
              }>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <NavLink
              to="/saya"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `py-2.5 px-3 rounded-lg text-sm ${isActive ? "bg-line/50 font-medium" : "text-ink2"}`
              }>
              Rak saya
            </NavLink>
          ) : (
            <Link
              to="/masuk"
              onClick={() => setOpen(false)}
              className="mt-2 btn btn-p">
              Masuk
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
