import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export default function Navbar({ onSearch }) {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenu(false);
    };
    document.addEventListener("click", f);
    return () => document.removeEventListener("click", f);
  }, []);
  const cls = ({ isActive }) =>
    `text-sm ${isActive ? "text-ink font-medium" : "text-ink2 hover:text-ink"}`;
  const links = [
    { to: "/jelajah", label: "Jelajah" },
    { to: "/impor", label: "Impor" },
    ...(user ? [{ to: "/studio", label: "Studio" }] : []),
  ];
  return (
    <header className="top-0 z-40 sticky bg-paper/90 backdrop-blur border-line border-b">
      <div className="flex items-center gap-5 mx-auto px-5 max-w-6xl h-14">
        <Link to="/" className="font-display font-bold text-xl tracking-tight">
          Sela<span className="text-accent">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-5">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={cls}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1" />
        <button onClick={onSearch} className="hidden sm:inline-flex chip">
          Cari <span className="ml-1 kbd">⌘K</span>
        </button>
        {user ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenu((m) => !m)}
              className="place-items-center grid bg-accent rounded-full w-9 h-9 font-display font-semibold text-white">
              {user.name[0].toUpperCase()}
            </button>
            {menu && (
              <div className="right-0 absolute shadow-xl mt-2 p-1.5 w-48 card fadein">
                <div className="px-3 py-2">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-ink2 text-xs truncate">{user.email}</p>
                </div>
                <div className="bg-line h-px" />
                <Link
                  to="/saya"
                  onClick={() => setMenu(false)}
                  className="block hover:bg-line/50 px-3 py-2 rounded-lg text-sm">
                  Rak saya
                </Link>
                <Link
                  to="/saya/pengaturan"
                  onClick={() => setMenu(false)}
                  className="block hover:bg-line/50 px-3 py-2 rounded-lg text-sm">
                  Pengaturan
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenu(false);
                    nav("/");
                  }}
                  className="hover:bg-line/50 px-3 py-2 rounded-lg w-full text-accent text-sm text-left">
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
        <button
          className="md:hidden px-1 text-2xl leading-none"
          onClick={() => setOpen((o) => !o)}>
          ☰
        </button>
      </div>
      {open && (
        <nav className="md:hidden flex flex-col gap-1 px-5 py-3 border-line border-t fadein">
          {[
            ...links,
            { to: "/saya", label: "Rak saya" },
            { to: "/saya/pengaturan", label: "Pengaturan" },
          ].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="py-2 text-sm">
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
