import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useApp } from "../context/AppContext";
import { fmtDate } from "../lib/utils";

export default function Highlights() {
  const { highlights, removeHighlight, books } = useApp();
  const [view, setView] = useState("list");
  const [i, setI] = useState(0);
  const [flip, setFlip] = useState(false);
  const [dijawab, setDijawab] = useState(0);

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
      jenis: "highlight",
    })),
    ...quiz.map((k) => ({
      front: k.q,
      back: k.a,
      to: `/baca/${k.book.slug}?bab=${k.ci}`,
      jenis: "kuis",
    })),
  ];
  const pos = cards.length
    ? ((i % cards.length) + cards.length) % cards.length
    : 0;
  const card = cards.length ? cards[pos] : null;

  /* grup highlight per buku */
  const perBuku = useMemo(() => {
    const m = new Map();
    highlights.forEach((h) => {
      if (!m.has(h.book)) m.set(h.book, []);
      m.get(h.book).push(h);
    });
    return [...m.entries()];
  }, [highlights]);

  const next = () => {
    setI((v) => v + 1);
    setFlip(false);
  };
  const prev = () => {
    setI((v) => v - 1);
    setFlip(false);
  };

  return (
    <div className="mx-auto px-5 pt-12 max-w-3xl fadein">
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl">
            Highlight & Flashcard
          </h1>
          <p className="mt-1 text-ink2 text-sm">
            {highlights.length} highlight · {quiz.length} kuis dari buku —
            semuanya jadi kartu latihan.
          </p>
        </div>
      </div>

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
        <div className="space-y-6 mt-8 pb-10">
          {perBuku.map(([buku, daftar]) => (
            <div key={buku}>
              <div className="flex items-center gap-3 mb-2">
                <span className="place-items-center grid bg-ink rounded-full w-7 h-7 font-display font-bold text-paper text-xs">
                  {buku[0].toUpperCase()}
                </span>
                <span className="font-medium text-sm">{buku}</span>
                <span className="flex-1 bg-line h-px" />
                <span className="text-[11px] text-ink2">
                  {daftar.length} highlight
                </span>
              </div>
              <div className="space-y-2">
                {daftar.map((h) => (
                  <div key={h.id} className="relative p-4 overflow-hidden card">
                    <span className="top-0 bottom-0 left-0 absolute bg-accent/40 w-0.5" />
                    <div className="flex justify-between items-center gap-3">
                      <Link
                        to={`/baca/${h.bookSlug}?bab=${h.chap}`}
                        className="text-ink2 hover:text-ink text-xs">
                        {h.chapTitle}
                      </Link>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-ink2">
                          {fmtDate(h.at)}
                        </span>
                        <button
                          onClick={() => removeHighlight(h.id)}
                          className="text-accent text-xs hover:underline">
                          hapus
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-[15px] italic leading-relaxed">
                      “{h.text}”
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {highlights.length === 0 && (
            <div className="p-10 text-center card">
              <p className="font-display text-lg">Belum ada highlight.</p>
              <p className="mt-2 text-ink2 text-sm">
                Saat membaca, ketuk kata mana pun → “Highlight paragraf ini”.
                Nanti kumpul di sini — dan jadi kartu latihan.
              </p>
              <Link to="/jelajah" className="mt-4 text-xs btn btn-o">
                Mulai membaca →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 pb-10">
          {!card ? (
            <div className="p-10 text-center card">
              <p className="font-display text-lg">Belum ada kartu.</p>
              <p className="mt-2 text-ink2 text-sm">
                Highlight & kuis dari buku akan otomatis jadi kartu di sini.
              </p>
            </div>
          ) : (
            <>
              {/* progress sesi */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 bg-line rounded h-1 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all"
                    style={{
                      width: `${(((pos % cards.length) + 1) / cards.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="tabular-nums text-[11px] text-ink2">
                  {pos + 1} / {cards.length}
                </span>
              </div>

              {/* kartu flip 3D */}
              <div className="relative" style={{ perspective: "1200px" }}>
                <button
                  onClick={() => setFlip((f) => !f)}
                  className="rounded-2xl outline-none ring-accent focus-visible:ring-2 w-full text-left"
                  style={{
                    transformStyle: "preserve-3d",
                    transition: "transform .5s",
                    transform: flip ? "rotateY(180deg)" : "none",
                    minHeight: "240px",
                  }}>
                  {/* sisi depan */}
                  <span
                    className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center card"
                    style={{ backfaceVisibility: "hidden" }}>
                    <span className="top-4 absolute lbl">
                      {card.jenis === "kuis"
                        ? "Pertanyaan kuis"
                        : "Isi highlight"}
                    </span>
                    <span className="font-display font-semibold text-xl leading-snug">
                      {card.front}
                    </span>
                    <span className="mt-6 lbl">
                      ketuk untuk melihat jawaban
                    </span>
                  </span>
                  {/* sisi belakang */}
                  <span
                    className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center card"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "var(--c-card)",
                      boxShadow: "inset 0 0 0 2px var(--c-accent)",
                    }}>
                    <span className="top-4 absolute lbl">Jawaban</span>
                    <span className="text-[15px] leading-relaxed">
                      {card.back}
                    </span>
                  </span>
                </button>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button onClick={prev} className="btn btn-o">
                  ← Sebelumnya
                </button>
                <div className="flex gap-2">
                  <button onClick={next} className="text-xs btn btn-o">
                    Sulit
                  </button>
                  <button onClick={next} className="text-xs btn btn-p">
                    Mudah ✓
                  </button>
                </div>
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
