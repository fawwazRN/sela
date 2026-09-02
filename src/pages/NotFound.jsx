import { Link } from "react-router";
export default function NotFound() {
  return (
    <div className="mx-auto px-5 py-28 max-w-xl text-center fadein">
      <p className="font-display font-bold text-accent text-7xl">404</p>
      <h1 className="mt-4 font-display text-2xl">
        Halaman ini seperti bab yang dicabut dari cetakan pertama.
      </h1>
      <p className="mt-3 text-ink2 text-sm">
        Mungkin pindah, mungkin memang tak pernah ada.
      </p>
      <div className="flex justify-center gap-3 mt-7">
        <Link to="/" className="btn btn-p">
          Ke Beranda
        </Link>
        <Link to="/jelajah" className="btn btn-o">
          Jelajah buku
        </Link>
      </div>
    </div>
  );
}
