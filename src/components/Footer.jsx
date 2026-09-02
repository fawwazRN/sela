import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="mt-20 border-line border-t">
      <div className="flex md:flex-row flex-col justify-between md:items-center gap-6 mx-auto px-5 py-10 max-w-6xl">
        <div>
          <p className="font-display font-bold text-lg">
            Sela<span className="text-accent">.</span>
          </p>
          <p className="mt-1 text-ink2 text-xs">
            Web paling tenang untuk membaca. Tanpa musik, tanpa iklan, tanpa
            paksaan.
          </p>
        </div>
        <div className="flex gap-6 text-ink2 text-sm">
          <Link to="/jelajah" className="hover:text-ink">
            Jelajah
          </Link>
          <Link to="/impor" className="hover:text-ink">
            Impor
          </Link>
          <Link to="/saya/statistik" className="hover:text-ink">
            Statistik
          </Link>
          <Link to="/saya/pengaturan" className="hover:text-ink">
            Pengaturan
          </Link>
        </div>
      </div>
    </footer>
  );
}
