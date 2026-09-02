import { useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtDate } from "../lib/utils";

export default function Highlights() {
  const { highlights, removeHighlight, books } = useApp();
  const [view, setView] = useState("list");
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);

  const quiz = books.flatMap((b) =>
    b.bab.flatMap((c, ci) =>
      c.kuis ? [{ book: b, ci, q: c.kuis.q, a: c.kuis.o[c.kuis.a] }] : [],
    ),
  );
  const cards = [
    ...highlights.map((h) => ({
      front: `${h.book} — ${h.chapTitle}`,
      back: h.text,
      to: `/baca/${h.bookSlug}?bab=${h.chap}`,
    })),
    ...quiz.map((k) => ({
      front: k.q,
      back: k.a,
      to: `/baca/${k.book.slug}?bab=${k.ci}`,
    })),
  ];
  const card = cards.length ? cards[i % cards.length] : null;

  return (
    <div className="mx-auto px-5 pt-12 max-w-3xl fadein">
      <h1 className="font-display font-bold text-3xl md:text-4xl">
        Highlight & Flashcard
      </h1>
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setView("list")}
          className={`chip ${view === "list" ? "chip-on" : ""}`}>
          Daftar ({highlights.length})
        </button>
        <button
          onClick={() => setView("kartu")}
          className={`chip ${view === "kartu" ? "chip-on" : ""}`}>
          Mode flashcard ({cards.length})
        </button>
      </div>

      {view === "list" ? (
        <div className="space-y-3 mt-6 pb-10">
          {highlights.map((h) => (
            <div key={h.id} className="p-4 card">
              <div className="flex justify-between items-center gap-3">
                <Link
                  to={`/baca/${h.bookSlug}?bab=${h.chap}`}
                  className="text-ink2 hover:text-ink text-xs">
                  {h.book} · {h.chapTitle}
                </Link>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-ink2">{fmtDate(h.at)}</span>
                  <button
                    onClick={() => removeHighlight(h.id)}
                    className="text-accent text-xs hover:underline">
                    hapus
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed">“{h.text}”</p>
            </div>
          ))}
          {highlights.length === 0 && (
            <p className="py-14 text-ink2 text-center">
              Belum ada highlight. Saat membaca, ketuk kata mana pun →
              “Highlight paragraf ini”.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 pb-10">
          {!card ? (
            <p className="py-14 text-ink2 text-center">
              Belum ada kartu. Highlight & kuis dari buku akan jadi kartu di
              sini.
            </p>
          ) : (
            <>
              <button
                onClick={() => setFlip((f) => !f)}
                className="place-items-center grid p-8 hover:border-ink w-full min-h-56 text-center transition-colors card">
                <div>
                  {!flip ? (
                    <p className="font-display font-semibold text-xl leading-snug">
                      {card.front}
                    </p>
                  ) : (
                    <p className="text-[15px] leading-relaxed">{card.back}</p>
                  )}
                  <p className="mt-6 lbl">
                    {flip
                      ? "ketuk untuk melihat pertanyaan"
                      : "ketuk untuk melihat jawaban"}
                  </p>
                </div>
              </button>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    setI((v) => v - 1);
                    setFlip(false);
                  }}
                  className="btn btn-o">
                  ← Sebelumnya
                </button>
                <span className="text-ink2 text-xs">
                  {(i % cards.length) + 1} / {cards.length}
                </span>
                <button
                  onClick={() => {
                    setI((v) => v + 1);
                    setFlip(false);
                  }}
                  className="btn btn-o">
                  Berikutnya →
                </button>
              </div>
              <p className="mt-3 text-center">
                <Link
                  to={card.to}
                  className="text-ink2 hover:text-ink text-xs underline underline-offset-4">
                  Buka di buku →
                </Link>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
