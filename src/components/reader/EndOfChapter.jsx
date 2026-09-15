import { useState } from "react";
import { Link } from "react-router";

/* kompatibel: kuis lama = 1 objek, kuis baru = array */
const daftarKuis = (c) => {
  if (!c?.kuis) return [];
  return Array.isArray(c.kuis) ? c.kuis : [c.kuis];
};

function KuisItem({ kuis, nomor }) {
  const [pick, setPick] = useState(null);
  return (
    <div>
      {nomor && (
        <p className="mb-2 font-medium text-[11px] text-ink2">Soal {nomor}</p>
      )}
      <p className="mb-4 font-display font-semibold text-lg">{kuis.q}</p>
      <div className="gap-2 grid">
        {kuis.o.map((o, i) => {
          const isAns = i === kuis.a;
          let st = "border-line hover:border-ink";
          if (pick !== null && isAns) st = "border-green-600 bg-green-600/10";
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
  );
}

export default function EndOfChapter({ book, chap, done, onNext, onFinish }) {
  const c = book.bab[chap];
  const last = chap === book.bab.length - 1;
  const kuis = daftarKuis(c);
  return (
    <div className="mx-auto my-16 max-w-[68ch] fadein">
      <div className="bg-line mb-10 h-px" />
      {c.ringkasan && (
        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mb-6 p-5 border border-line rounded-2xl">
          <p className="mb-2 lbl">Ringkasan bab</p>
          <p className="text-[15px] leading-relaxed">{c.ringkasan}</p>
        </div>
      )}
      {kuis.length > 0 && (
        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mb-6 p-5 border border-line rounded-2xl">
          <p className="mb-2 lbl">
            Kuis cepat{kuis.length > 1 && ` — ${kuis.length} soal`}
          </p>
          <div className="space-y-7">
            {kuis.map((k, ki) => (
              <KuisItem
                key={ki}
                kuis={k}
                nomor={kuis.length > 1 ? ki + 1 : null}
              />
            ))}
          </div>
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
        <div className="bg-paper shadow-[0_2px_10px_rgba(26,24,21,0.05)] mt-8 p-6 border border-line rounded-2xl text-center">
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
