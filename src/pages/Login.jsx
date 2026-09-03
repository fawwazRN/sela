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
        // simpan nama tampilan yang diketik
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
    <div className="mx-auto px-5 pt-20 pb-10 max-w-sm fadein">
      <h1 className="font-display font-bold text-3xl text-center">
        {tab === "masuk" ? "Selamat datang kembali" : "Buat akun"}
      </h1>
      <p className="mt-2 text-ink2 text-sm text-center">
        Baca tetap gratis tanpa akun — ini untuk sinkron & Studio.
      </p>
      <div className="flex justify-center gap-2 mt-6">
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
            className={`chip ${tab === id ? "chip-on" : ""}`}>
            {n}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="gap-3 grid mt-5 p-6 card">
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
          <input
            className="inp"
            type="password"
            value={f.pass}
            onChange={(e) => setF({ ...f, pass: e.target.value })}
            placeholder="minimal 6 karakter"
          />
        </label>
        {err && <p className="text-accent text-sm">{err}</p>}
        <button className="mt-1 w-full btn btn-p">
          {tab === "masuk" ? "Masuk" : "Buat akun"}
        </button>
        <p className="text-[11px] text-ink2 text-center">
          Akunmu tersimpan aman dan terenkripsi..
        </p>
      </form>
      <p className="mt-5 text-sm text-center">
        <Link
          to="/jelajah"
          className="text-ink2 hover:text-ink underline underline-offset-4">
          Lanjut tanpa akun →
        </Link>
      </p>
    </div>
  );
}
