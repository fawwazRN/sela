import { useParams, Link } from "react-router";
import { KURASI } from "../data/books";
import { useApp } from "../context/AppContext";
import BookCard from "../components/BookCard";
import NotFound from "./NotFound";

export default function Kurasi() {
  const { slug } = useParams();
  const { books } = useApp();
  const k = KURASI.find((x) => x.slug === slug);
  if (!k) return <NotFound />;
  const list = k.ids
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);
  return (
    <div className="mx-auto px-5 pt-12 max-w-6xl fadein">
      <Link to="/jelajah" className="text-ink2 hover:text-ink text-sm">
        ← Jelajah
      </Link>
      <h1 className="mt-3 font-display font-bold text-3xl md:text-4xl">
        {k.judul}
      </h1>
      <p className="mt-2 text-ink2">{k.desc}</p>
      <div className="gap-4 grid grid-cols-2 md:grid-cols-3 mt-8 pb-4">
        {list.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </div>
  );
}
