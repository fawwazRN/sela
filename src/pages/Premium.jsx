import { Link } from "react-router";
import { useApp } from "../context/AppContext";

/* ===== ISI: kontak & harga ===== */
const KONTAK = "https://wa.me/628xxxxxxxxxx";
const HARGA = [
  {
    paket: "plus",
    nama: "Sela Plus",
    tag: "Untuk Penulis",
    bulanan: 15000,
    tahunan: 150000,
  },
  {
    paket: "pro",
    nama: "Sela Pro",
    tag: "Untuk Pembaca",
    bulanan: 10000,
    tahunan: 100000,
  },
  {
    paket: "ekstra",
    nama: "Sela Ekstra",
    tag: "Plus + Pro",
    bulanan: 20000,
    tahunan: 200000,
    unggulan: true,
  },
];

const BENEFIT = {
  plus: [
    "Buku tanpa batas (gratis: 3 buku)",
    "Badge penulis terverifikasi",
    "Cerita eksklusif Sela Plus",
    "Prioritas tampil di Jelajah",
    "Analitik pembaca per bab",
    "Halaman penulis publik",
  ],
  pro: [
    "Tema eksklusif Midnight & Forest",
    "Unduh buku ke PDF bergaya",
    "Ekspor catatan ke PDF",
    "Statistik bacaan lanjutan",
    "Badge pendukung",
    "Akses cerita eksklusif",
  ],
  ekstra: [
    "Semua benefit Sela Plus",
    "Semua benefit Sela Pro",
    "Lebih murah dari beli keduanya",
    "Satu tagihan, dua dunia",
  ],
};

const fmt = (n) => "Rp" + n.toLocaleString("id-ID");

export default function Premium() {
  const { user, subs } = useApp();

  const status = (p) =>
    subs?.[p]
      ? `Aktif s.d. ${new Date(subs[p].expired_at).toLocaleDateString("id-ID")}`
      : null;

  return (
    <div className="mx-auto px-5 pt-12 pb-10 max-w-4xl fadein">
      <p className="lbl">Anggota Sela</p>
      <h1 className="mt-1 font-display font-bold text-3xl md:text-4xl">
        Dukung Sela, dapat lebih.
      </h1>
      <p className="mt-2 max-w-xl text-ink2 text-sm leading-relaxed">
        Membaca buku di Sela selalu gratis. Sela Plus untuk penulis yang serius,
        Sela Pro untuk pembaca yang ingin lebih, dan Sela Ekstra untuk yang mau
        dua-duanya sekaligus — lebih murah dari beli terpisah.
      </p>

      <div className="gap-4 grid md:grid-cols-3 mt-8">
        {HARGA.map(({ paket, nama, tag, bulanan, tahunan, unggulan }) => {
          const st = status(paket);
          return (
            <div
              key={paket}
              className={`p-6 bg-paper border rounded-2xl shadow-[0_2px_10px_rgba(26,24,21,0.05)] flex flex-col ${
                unggulan
                  ? "border-accent ring-1 ring-accent/30"
                  : paket === "plus"
                    ? "border-line"
                    : "border-line"
              }`}>
              <div className="flex justify-between items-center gap-2">
                <p className="font-display font-bold text-lg">{nama}</p>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-wider ${
                    unggulan
                      ? "border-accent/50 text-accent"
                      : "border-line text-ink2"
                  }`}>
                  {tag}
                </span>
              </div>
              {unggulan && (
                <p className="mt-1 font-medium text-[10px] text-accent uppercase tracking-wider">
                  Paling berhemat
                </p>
              )}
              <p className="mt-3 font-display font-bold text-2xl">
                {fmt(bulanan)}
                <span className="font-normal text-ink2 text-sm">/bulan</span>
              </p>
              <p className="text-[11px] text-ink2">
                atau {fmt(tahunan)}/tahun (hemat 2 bulan)
              </p>
              <ul className="flex-1 space-y-2 mt-4 text-sm">
                {BENEFIT[paket].map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className="text-accent">–</span> {b}
                  </li>
                ))}
              </ul>
              {st ? (
                <p className="mt-5 font-medium text-green-600 text-sm">{st}</p>
              ) : (
                <a
                  href={KONTAK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-5 text-xs btn btn-p">
                  Berlangganan {nama}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* CARA */}
      <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-8 p-6 border border-line rounded-2xl">
        <p className="mb-3 lbl">Cara berlangganan — sederhana</p>
        <ol className="space-y-2 text-ink2 text-sm list-decimal list-inside">
          <li>
            Klik tombol berlangganan di atas — chat kami untuk rekening/QRIS.
          </li>
          <li>Transfer sesuai paket (bulanan/tahunan).</li>
          <li>
            Kirim bukti transfer + <b>email akun Sela</b>-mu.
          </li>
          <li>
            Admin mengaktifkan — maksimal 24 jam. Status muncul di halaman ini.
          </li>
        </ol>
        {!user && (
          <p className="mt-4 text-ink2 text-xs">
            <Link
              to="/masuk"
              className="text-accent underline underline-offset-4">
              Masuk
            </Link>{" "}
            dulu supaya aktivasi tercatat ke akunmu.
          </p>
        )}
      </div>
    </div>
  );
}
