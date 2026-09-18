import { Link } from "react-router";

const KOLOM = [
  {
    judul: "Jelajahi",
    link: [
      ["/jelajah", "Semua buku"],
      ["/kurasi/bikin-paham", "Rak kurasi"],
      ["/glosarium", "Glosarium"],
      ["/catatan", "Catatan"],
      ["/premium", "Sela Plus & Pro"], // ← TAMBAH INI
    ],
  },
  {
    judul: "Untuk penulis",
    link: [
      ["/tutorial", "Cara membuat buku"],
      ["/studio", "Studio"],
      ["/impor", "Impor Markdown"],
    ],
  },
  {
    judul: "Akun",
    link: [
      ["/saya", "Rak saya"],
      ["/saya/statistik", "Statistik"],
      ["/saya/pengaturan", "Pengaturan"],
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-card/50 mt-20 border-line border-t">
      {/* MOTTO BESAR */}
      <div className="mx-auto px-5 pt-14 pb-10 max-w-6xl text-center">
        <p className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight">
          Baca pelan.
          <br />
          <span className="text-ink2">Paham dalam.</span>{" "}
          <span className="text-accent">Kapan saja.</span>
        </p>
        <p className="mx-auto mt-5 max-w-md text-ink2 text-sm">
          Sela adalah perpustakaan tenang untuk pembaca yang ingin fokus — dan
          rumah bagi penulis yang ingin membaca karyanya hidup.
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <Link to="/jelajah" className="text-xs btn btn-p">
            Mulai membaca
          </Link>
          <Link to="/tutorial" className="text-xs btn btn-o">
            Menulis di Sela
          </Link>
        </div>
      </div>

      <div className="bg-line mx-auto max-w-6xl h-px" />

      {/* KOLOM */}
      <div className="gap-8 grid grid-cols-2 md:grid-cols-4 mx-auto px-5 py-10 max-w-6xl">
        <div>
          <Link
            to="/"
            className="font-display font-bold text-lg tracking-tight">
            Sela<span className="text-accent">.</span>
          </Link>
          <p className="mt-2 text-ink2 text-xs leading-relaxed">
            Web paling tenang untuk membaca. Tanpa musik, tanpa iklan, tanpa
            paksaan.
          </p>
          <div className="flex gap-2 mt-4">
            {["Gratis", "PWA", "Tanpa iklan"].map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 border border-line rounded-full text-[10px] text-ink2">
                {t}
              </span>
            ))}
          </div>
        </div>
        {KOLOM.map((k) => (
          <div key={k.judul}>
            <p className="mb-3 lbl">{k.judul}</p>
            <div className="flex flex-col gap-2">
              {k.link.map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-ink2 hover:text-ink text-sm transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* BARIS BAWAH */}
      <div className="border-line border-t">
        <div className="flex sm:flex-row flex-col justify-between items-center gap-2 mx-auto px-5 py-5 max-w-6xl">
          <p className="text-[11px] text-ink2">
            © {new Date().getFullYear()} Sela — dibaca pelan, dibuat dengan
            hati.
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-ink2">
            <span className="inline-block bg-green-500 rounded-full w-1.5 h-1.5" />
            Semua sistem normal
          </p>
        </div>
      </div>
    </footer>
  );
}
