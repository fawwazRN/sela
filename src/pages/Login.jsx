import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useApp } from "../context/AppContext";
import { LS, SV } from "../lib/storage";

export default function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const { state } = useLocation();
  const [tab, setTab] = useState("masuk");
  const [f, setF] = useState({ name: "", email: "", pass: "" });
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    const { name, email, pass } = f;
    if (!email.includes("@") || pass.length < 6) {
      setErr("Email valid & password minimal 6 karakter ya.");
      return;
    }
    const em = email.toLowerCase();
    const us = LS("users") || [];
    const found = us.find((u) => u.email === em);
    if (tab === "daftar") {
      if (found) {
        setErr("Email sudah terdaftar — silakan masuk.");
        return;
      }
      SV("users", [...us, { name: name || em.split("@")[0], email: em, pass }]);
      login(name || em.split("@")[0], em);
      nav(state?.from || "/saya");
      return;
    }
    if (!found) {
      setErr("Email belum terdaftar. Daftar dulu yuk — gratis.");
      return;
    }
    if (found.pass !== pass) {
      setErr("Password salah.");
      return;
    }
    login(found.name, found.email);
    nav(state?.from || "/saya");
  };

  return (
    <div className="mx-auto px-5 pt-20 pb-10 max-w-sm fadein">
      <h1 className="font-display font-bold text-3xl text-center">
        {tab === "masuk" ? "Selamat datang kembali" : "Buat akun"}
      </h1>
      <p className="mt-2 text-ink2 text-sm text-center">
        Baca tetap gratis tanpa akun — ini cuma untuk sinkron & Studio.
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
          Demo: akun tersimpan lokal di browser ini.
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
