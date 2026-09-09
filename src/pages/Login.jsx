import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { login, register } = useApp();
  const nav = useNavigate();
  const { state } = useLocation();
  const [tab, setTab] = useState("masuk");
  const [f, setF] = useState({ name: "", email: "", pass: "" });
  const [err, setErr] = useState("");
  const [lihat, setLihat] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const { name, email, pass } = f;
    if (!email.includes("@") || pass.length < 6) {
      setErr("Email valid & password minimal 6 karakter ya.");
      return;
    }
    try {
      await (tab === "daftar" ? register(email, pass) : login(email, pass));
      if (name) {
        setTimeout(() => {
          const u = JSON.parse(localStorage.getItem("sela.user") || "null");
          if (u) {
            u.name = name;
            localStorage.setItem("sela.user", JSON.stringify(u));
          }
        }, 300);
      }
      nav(state?.from || "/saya");
    } catch (er) {
      setErr(er.message || "Gagal. Periksa koneksi / kredensial.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 min-h-[80vh] fadein">
      {/* PANEL BRAND — hanya desktop */}
      <div
        className="hidden md:flex flex-col justify-between p-10"
        style={{ background: "linear-gradient(160deg, #2F5D50, #1A1815)" }}>
        <Link to="/" className="font-display font-bold text-white text-2xl">
          Sela<span className="text-accent">.</span>
        </Link>
        <div>
          <p className="font-display font-bold text-white text-3xl leading-snug">
            “Begitu cahaya jatuh pada halaman,
            <br />
            dunia lain mulai bernapas.”
          </p>
          <p className="mt-4 text-white/60 text-sm">
            — kalimat pembuka di Pengaturanmu
          </p>
        </div>
        <div className="flex gap-6 text-white/50 text-xs">
          <span>Tanpa iklan</span>
          <span>·</span>
          <span>Tanpa musik</span>
          <span>·</span>
          <span>Tanpa paksaan</span>
        </div>
      </div>

      {/* FORM */}
      <div className="flex justify-center items-center px-5 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="md:hidden font-display font-bold text-2xl">
            Sela<span className="text-accent">.</span>
          </Link>
          <h1 className="mt-6 md:mt-0 font-display font-bold text-3xl">
            {tab === "masuk" ? "Selamat datang kembali" : "Buat akun"}
          </h1>
          <p className="mt-2 text-ink2 text-sm">
            Baca tetap gratis tanpa akun — ini untuk sinkron & Studio.
          </p>

          <div className="flex gap-1 bg-line/50 mt-6 p-1 rounded-xl">
            {[
              ["masuk", "Masuk"],
              ["daftar", "Daftar"],
            ].map(([id, n]) => (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  setErr("");
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? "bg-paper shadow-sm" : "text-ink2 hover:text-ink"}`}>
                {n}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="gap-4 grid mt-6">
            {tab === "daftar" && (
              <label className="gap-1.5 grid">
                <span className="text-ink2 text-xs">Nama</span>
                <input
                  className="inp"
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                  placeholder="Nama kamu"
                />
              </label>
            )}
            <label className="gap-1.5 grid">
              <span className="text-ink2 text-xs">Email</span>
              <input
                className="inp"
                type="email"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                placeholder="nama@email.com"
              />
            </label>
            <label className="gap-1.5 grid">
              <span className="text-ink2 text-xs">Password</span>
              <span className="relative">
                <input
                  className="pr-16 inp"
                  type={lihat ? "text" : "password"}
                  value={f.pass}
                  onChange={(e) => setF({ ...f, pass: e.target.value })}
                  placeholder="minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setLihat((v) => !v)}
                  className="top-1/2 right-3 absolute text-[11px] text-ink2 hover:text-ink -translate-y-1/2">
                  {lihat ? "sembunyi" : "lihat"}
                </button>
              </span>
            </label>
            {err && <p className="text-accent text-sm">{err}</p>}
            <button className="w-full btn btn-p">
              {tab === "masuk" ? "Masuk" : "Buat akun"}
            </button>
            <p className="text-[11px] text-ink2 text-center">
              Akunmu tersimpan aman dan terenkripsi.
            </p>
          </form>

          <p className="mt-6 text-sm text-center">
            <Link
              to="/jelajah"
              className="text-ink2 hover:text-ink underline underline-offset-4">
              Lanjut tanpa akun →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
