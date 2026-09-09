import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="mx-auto px-5 py-28 max-w-xl text-center fadein">
      {/* buku tergeletak dari CSS */}
      <div
        className="relative mx-auto mb-8 w-24 h-32"
        style={{ transform: "rotate(-8deg)" }}>
        <div
          className="absolute inset-0 shadow-xl rounded-r-lg rounded-l-sm"
          style={{ background: "linear-gradient(150deg, #B3402A, #7A2A1C)" }}
        />
        <div className="top-0 bottom-0 left-0 absolute bg-black/30 rounded-l-sm w-2" />
        <div className="top-6 bottom-6 absolute inset-x-4">
          <p className="font-display font-bold text-white text-lg leading-tight">
            404
          </p>
          <div className="space-y-1.5 mt-2">
            <div className="bg-white/30 rounded h-0.5" />
            <div className="bg-white/20 mx-auto rounded w-3/4 h-0.5" />
            <div className="bg-white/20 mx-auto rounded w-1/2 h-0.5" />
          </div>
        </div>
        <div className="-right-3 -bottom-2 absolute bg-ink/20 blur-sm rounded-full w-8 h-3" />
      </div>

      <p className="font-display font-bold text-accent text-6xl">404</p>
      <h1 className="mt-4 font-display text-2xl leading-snug">
        Halaman ini seperti bab yang dicabut
        <br className="hidden sm:block" /> dari cetakan pertama.
      </h1>
      <p className="mt-3 text-ink2 text-sm">
        Mungkin pindah, mungkin memang tak pernah ada. Yang jelas: bukumu
        menunggu di rak.
      </p>
      <div className="flex justify-center gap-3 mt-8">
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
