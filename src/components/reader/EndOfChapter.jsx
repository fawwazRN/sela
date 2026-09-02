import { useState } from "react";
import { Link } from "react-router";

export default function EndOfChapter({ book, chap, done, onNext, onFinish }) {
  const c = book.bab[chap];
  const last = chap === book.bab.length - 1;
  const [pick, setPick] = useState(null);
  const kuis = c.kuis;
  return (
    <div className="mx-auto my-16 max-w-[68ch] fadein">
      <div className="bg-line mb-10 h-px" />
      {c.ringkasan && (
        <div className="mb-6 p-5 card">
          <p className="mb-2 lbl">Ringkasan bab</p>
          <p className="text-[15px] leading-relaxed">{c.ringkasan}</p>
        </div>
      )}
      {kuis && (
        <div className="mb-6 p-5 card">
          <p className="mb-2 lbl">Kuis cepat</p>
          <p className="mb-4 font-display font-semibold text-lg">{kuis.q}</p>
          <div className="gap-2 grid">
            {kuis.o.map((o, i) => {
              const isAns = i === kuis.a;
              let st = "border-line hover:border-ink";
              if (pick !== null && isAns)
                st = "border-green-600 bg-green-600/10";
              else if (pick === i) st = "border-red-500 bg-red-500/10";
              else if (pick !== null) st = "border-line opacity-50";
              return (
                <button
                  key={i}
                  disabled={pick !== null}
                  onClick={() => setPick(i)}
                  className={`text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${st}`}>
                  {o}
                  {pick !== null && isAns && " ✓"}
                </button>
              );
            })}
          </div>
          {pick !== null && (
            <p className="mt-3 text-ink2 text-sm">
              {pick === kuis.a
                ? "Benar! Mantap."
                : `Kurang tepat — jawabannya: ${kuis.o[kuis.a]}.`}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {!last ? (
          <button onClick={onNext} className="btn btn-p">
            Bab berikutnya →
          </button>
        ) : (
          <button
            onClick={onFinish}
            disabled={done}
            className="disabled:opacity-50 btn btn-a">
            ✓ Tandai selesai
          </button>
        )}
        <Link to={`/buku/${book.slug}`} className="btn btn-o">
          Detail buku
        </Link>
        <span className="text-ink2 text-xs">
          Bab {chap + 1} dari {book.bab.length}
        </span>
      </div>
      {last && done && (
        <div className="mt-8 p-6 text-center card">
          <p className="font-display font-bold text-3xl">Selesai. 🎉</p>
          <p className="mt-2 text-ink2 text-sm">
            “{book.judul}” masuk rak selesai baca. Kartu bacaanmu siap di
            Statistik.
          </p>
          <Link to="/saya/statistik" className="mt-4 btn btn-o">
            Lihat kartu bacaan
          </Link>
        </div>
      )}
    </div>
  );
}
