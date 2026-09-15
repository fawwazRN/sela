import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import Cover from "./Cover";

const fmtHits = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + " rb" : n;

/* timeline (detik) */
const T0 = 1.6; // reveal pertama (peringkat terbawah)
const STEP = 0.9; // jarak antar reveal
const delayOf = (i) => T0 + i * STEP; // i: 0=peringkat bawah … terakhir=junior

export default function IntroAward() {
  const { books, views } = useApp();
  const [phase, setPhase] = useState("wait"); // wait | play | exit
  const [gone, setGone] = useState(false);
  const tungguRef = useRef(null);

  /* ===== FIX URUTAN: naik (kecil→besar), ambil 3 teratas.
     Array = [Peringkat 3, Peringkat 2, JUARA] — reveal countdown benar ===== */
  const top = useMemo(
    () =>
      [...books]
        .map((b) => ({ ...b, hits: views[b.slug] || 0 }))
        .filter((b) => b.hits > 0)
        .sort((a, b) => a.hits - b.hits)
        .slice(-3),
    [books, views],
  );

  /* gerbang: 1×/sesi + reduced-motion. Flag ditulis SAAT KELUAR
     (aman dari double-effect StrictMode di localhost) */
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      sessionStorage.getItem("sela.intro")
    ) {
      setGone(true);
    }
  }, []);

  useEffect(() => {
    if (gone || phase !== "wait") return;
    if (top.length) {
      setPhase("play");
    } else if (!tungguRef.current) {
      tungguRef.current = setTimeout(() => setGone(true), 3000);
    }
  }, [top.length, phase, gone]);

  const masuk = () => {
    sessionStorage.setItem("sela.intro", "1");
    setPhase((p) => (p === "play" ? "exit" : p));
  };

  useEffect(() => {
    if (phase !== "exit") return;
    sessionStorage.setItem("sela.intro", "1");
    const t = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(t);
  }, [phase]);

  /* scroll lock — pulih di jalur keluar apa pun */
  useEffect(() => {
    if (gone || phase === "wait") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase, gone]);

  /* FAILSAFE: auto-tutup, tak pernah menjebak halaman */
  useEffect(() => {
    if (phase !== "play") return;
    const champDelay = T0 + (top.length - 1) * STEP;
    const t = setTimeout(() => masuk(), (champDelay + 5) * 1000);
    return () => clearTimeout(t);
  }, [phase, top.length]);

  useEffect(() => {
    if (phase !== "play") return;
    const f = (e) => {
      if (e.key === "Escape" || e.key === "Enter") masuk();
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [phase]);

  const champDelay = delayOf(top.length - 1);
  const ctaDelay = champDelay + 0.7;

  /* debu emas melayang */
  const dust = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 67 + 13) % 100,
        top: (i * 41 + 7) % 100,
        s: 1.5 + (i % 3),
        d: 7 + (i % 6),
        delay: (i * 0.9) % 7,
      })),
    [],
  );

  /* confetti saat juara mendarat */
  const confetti = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        d: champDelay + 0.15 + ((i * 13) % 22) / 10,
        dur: 2.6 + (i % 4) * 0.5,
        s: 5 + (i % 3) * 3,
        c: ["#F6D860", "#B3402A", "#F7F3EA"][i % 3],
      })),
    [champDelay],
  );

  if (gone || phase === "wait") return null;

  return (
    <>
      <style>{`
        .ia-root{
          position:fixed;inset:0;z-index:100;overflow:hidden;cursor:pointer;
          background:radial-gradient(ellipse at 50% 118%,#241d14 0%,#14110e 55%);
          color:#F7F3EA;font-family:var(--font-body,Georgia,serif);
        }
        .ia-root[data-phase="exit"]{transform:translateY(-100%);
          transition:transform .95s cubic-bezier(.76,0,.24,1);}
        .ia-root[data-phase="exit"] .ia-stage{transform:translateY(9%);
          transition:transform .95s cubic-bezier(.76,0,.24,1);}
        .ia-stage{position:relative;height:100%;display:flex;flex-direction:column;
          align-items:center;justify-content:center;padding:24px 16px;}
        /* sinematik */
        .ia-vignette{position:absolute;inset:0;pointer-events:none;
          background:radial-gradient(ellipse at 50% 42%,transparent 30%,rgba(0,0,0,.6) 100%);}
        .ia-grain{position:absolute;inset:-50%;pointer-events:none;opacity:.05;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:ia-grain 1.2s steps(4) infinite;}
        @keyframes ia-grain{0%{transform:translate(0,0)}25%{transform:translate(-2%,1%)}
          50%{transform:translate(1%,-2%)}75%{transform:translate(-1%,2%)}100%{transform:translate(0,0)}}
        .ia-dust{position:absolute;border-radius:50%;background:#F6D860;
          opacity:0;animation:ia-dust var(--dur) ease-in-out infinite;pointer-events:none;}
        @keyframes ia-dust{0%,100%{opacity:0;transform:translateY(0)}
          50%{opacity:.35;transform:translateY(-16px)}}
        /* confetti */
        .ia-conf{position:absolute;top:-4vh;border-radius:2px;opacity:0;
          animation:ia-fall var(--dur) linear both;animation-delay:var(--d);
          pointer-events:none;}
        @keyframes ia-fall{0%{opacity:0;transform:translateY(0) rotate(0)}
          8%{opacity:1}100%{opacity:0;transform:translateY(115vh) rotate(560deg)}}
        /* berkas sorot juara */
        .ia-beam{position:absolute;top:0;left:50%;width:min(430px,82vw);height:66%;
          transform:translateX(-50%);pointer-events:none;
          background:linear-gradient(to bottom,rgba(246,216,96,.30),rgba(246,216,96,.04) 72%,transparent);
          clip-path:polygon(41% 0,59% 0,88% 100%,12% 100%);
          opacity:0;animation:ia-beam 1.1s cubic-bezier(.22,1,.36,1) both;
          animation-delay:var(--d);}
        @keyframes ia-beam{from{opacity:0;transform:translateX(-50%) scaleY(.35)}
          to{opacity:1;transform:translateX(-50%) scaleY(1)}}
        /* header */
        .ia-logo{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(20px,3vw,28px);animation:ia-logo 1.1s cubic-bezier(.22,1,.36,1) both;}
        .ia-logo b{color:#B3402A;}
        @keyframes ia-logo{from{opacity:0;letter-spacing:.6em;filter:blur(8px)}
          to{opacity:1;letter-spacing:.02em;filter:none}}
        .ia-label{font-size:clamp(10px,1.4vw,12px);letter-spacing:.42em;
          text-transform:uppercase;color:rgba(247,243,234,.5);
          animation:ia-up .8s cubic-bezier(.22,1,.36,1) both;animation-delay:.5s;}
        @keyframes ia-up{from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:none}}
        /* ===== PODIUM ===== */
        .ia-row{display:flex;align-items:flex-end;justify-content:center;
          gap:clamp(10px,3vw,30px);margin-top:clamp(26px,5vh,48px);}
        .pos-1{order:2}.pos-2{order:1}.pos-3{order:3}
        .ia-card{position:relative;display:flex;flex-direction:column;
          align-items:center;gap:9px;width:clamp(128px,20vw,168px);
          padding:26px 13px 15px;border-radius:16px;
          background:rgba(247,243,234,.045);border:1px solid rgba(247,243,234,.14);
          animation:ia-drop .8s cubic-bezier(.3,1.35,.55,1) both;
          animation-delay:var(--d);}
        @keyframes ia-drop{from{opacity:0;transform:translateY(-64px) scale(1.05);
          filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
        .pos-1 .ia-card{width:clamp(158px,26vw,212px);padding-top:32px;
          border-color:rgba(246,216,96,.55);background:rgba(246,216,96,.07);
          box-shadow:0 18px 50px rgba(0,0,0,.55),0 0 46px rgba(246,216,96,.14);
          animation-name:ia-dropchamp;}
        @keyframes ia-dropchamp{from{opacity:0;transform:translateY(-120px)
          scale(1.14);filter:blur(6px)}
          to{opacity:1;transform:none;filter:none}}
        /* kilau menyapu kartu juara */
        .pos-1 .ia-card::after{content:"";position:absolute;inset:0;border-radius:16px;
          pointer-events:none;background:linear-gradient(105deg,transparent 42%,
          rgba(255,255,255,.16) 50%,transparent 58%);
          background-size:260% 100%;animation:ia-shine 2.6s ease-in-out 2 both;
          animation-delay:calc(var(--d) + .9s);}
        @keyframes ia-shine{0%{background-position:130% 0}100%{background-position:-130% 0}}
        /* medali + pita */
        .ia-medal{position:absolute;top:-21px;left:50%;margin-left:-22px;
          width:44px;height:44px;border-radius:50%;display:grid;place-items:center;
          z-index:2;font-family:var(--font-display,Fraunces,Georgia);
          font-weight:700;font-size:20px;color:#14110e;
          box-shadow:0 6px 16px rgba(0,0,0,.45);}
        .ia-medal::before,.ia-medal::after{content:"";position:absolute;top:-12px;
          width:12px;height:24px;background:#B3402A;border-radius:2px;z-index:-1;}
        .ia-medal::before{left:8px;transform:rotate(-24deg)}
        .ia-medal::after{right:8px;transform:rotate(24deg)}
        .ia-gold{background:linear-gradient(145deg,#FBE28A,#F6D860 45%,#C9A227);}
        .ia-silver{background:linear-gradient(145deg,#F2EDE1,#C9C2B2 45%,#8F887A);}
        .ia-bronze{background:linear-gradient(145deg,#E0A06A,#C2571F 55%,#7E3D14);color:#F7F3EA;}
        .ia-cv{width:100%;aspect-ratio:3/4;border-radius:9px;
          box-shadow:0 12px 30px rgba(0,0,0,.5);}
        .ia-r{font-size:9px;letter-spacing:.32em;text-transform:uppercase;
          color:rgba(247,243,234,.4);}
        .pos-1 .ia-r{color:#F6D860;}
        .ia-t{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(13px,1.7vw,16px);line-height:1.2;text-align:center;}
        .pos-1 .ia-t{font-size:clamp(16px,2.3vw,20px);}
        .ia-s{font-size:11px;color:rgba(247,243,234,.55);text-align:center;}
        /* pedestal */
        .ia-pod{width:clamp(112px,20vw,180px);height:var(--h);
          background:linear-gradient(180deg,rgba(247,243,234,.10),rgba(247,243,234,.02));
          border:1px solid rgba(247,243,234,.12);border-bottom:none;
          border-radius:10px 10px 0 0;display:grid;place-items:center;
          transform-origin:bottom;
          animation:ia-pod .8s cubic-bezier(.22,1,.36,1) both;animation-delay:.85s;}
        .pos-1 .ia-pod{border-color:rgba(246,216,96,.4);
          background:linear-gradient(180deg,rgba(246,216,96,.14),rgba(246,216,96,.02));}
        @keyframes ia-pod{from{transform:scaleY(0)}to{transform:scaleY(1)}}
        .ia-pod b{font-family:var(--font-display,Fraunces,Georgia);font-weight:700;
          font-size:clamp(30px,4.5vw,46px);color:transparent;
          -webkit-text-stroke:1px rgba(247,243,234,.3);}
        .pos-1 .ia-pod b{-webkit-text-stroke:1px rgba(246,216,96,.55);}
        .ia-floor{width:min(780px,94vw);height:1px;margin-top:0;
          background:linear-gradient(90deg,transparent,rgba(247,243,234,.2),transparent);}
        /* CTA dkk */
        .ia-cta{margin-top:clamp(24px,4.5vh,42px);animation:ia-up .8s
          cubic-bezier(.22,1,.36,1) both;animation-delay:var(--d);
          background:#B3402A;color:#fff;border:none;cursor:pointer;
          font-family:var(--font-display,Fraunces,Georgia);font-weight:600;
          font-size:clamp(14px,1.8vw,16px);padding:14px 36px;border-radius:999px;
          transition:transform .25s,box-shadow .25s;}
        .ia-cta:hover{transform:translateY(-2px) scale(1.03);
          box-shadow:0 12px 34px rgba(179,64,42,.45);}
        .ia-skip{position:absolute;bottom:22px;right:26px;font-size:11px;
          letter-spacing:.2em;text-transform:uppercase;
          color:rgba(247,243,234,.35);animation:ia-up .8s both;animation-delay:1s;}
        .ia-progress{position:absolute;bottom:0;left:0;right:0;display:flex;gap:6px;
          padding:10px 26px 16px;max-width:680px;margin:0 auto;}
        .ia-seg{flex:1;height:2px;background:rgba(247,243,234,.12);border-radius:2px;
          overflow:hidden;}
        .ia-seg i{display:block;height:100%;background:#F6D860;
          transform-origin:left;transform:scaleX(0);
          animation:ia-prog var(--dur) linear both;animation-delay:var(--d);}
        @keyframes ia-prog{to{transform:scaleX(1)}}
        @media (max-width:680px){
          .ia-row{flex-direction:column;align-items:center;gap:14px}
          .pos-1{order:0}.pos-2{order:1}.pos-3{order:2}
          .ia-pod{height:34px}
          .ia-pod b{font-size:20px}
          .ia-beam{height:46%}
        }
        @media (prefers-reduced-motion:reduce){
          .ia-root,.ia-root *{animation:none!important;transition:none!important;}
        }
      `}</style>

      <div
        className="ia-root"
        data-phase={phase}
        onClick={masuk}
        role="button"
        aria-label="Masuk ke Sela">
        <div className="ia-grain" />
        <div className="ia-vignette" />

        {/* berkas sorot juara */}
        {top.length > 0 && (
          <span className="ia-beam" style={{ "--d": champDelay + "s" }} />
        )}
        {/* confetti */}
        {confetti.map((p, i) => (
          <span
            key={i}
            className="ia-conf"
            style={{
              left: p.left + "%",
              width: p.s,
              height: p.s * 1.6,
              background: p.c,
              "--d": p.d + "s",
              "--dur": p.dur + "s",
            }}
          />
        ))}
        {dust.map((p, i) => (
          <span
            key={i}
            className="ia-dust"
            style={{
              left: p.left + "%",
              top: p.top + "%",
              width: p.s,
              height: p.s,
              "--dur": p.d + "s",
              animationDelay: p.delay + "s",
            }}
          />
        ))}

        <div className="ia-stage">
          <span className="ia-logo">
            Sela<b>.</b>
          </span>
          <span className="ia-label" style={{ marginTop: 16 }}>
            Rekor pembaca tahun ini
          </span>

          {/* ===== PODIUM: 2 kiri · JUARA tengah · 3 kanan ===== */}
          <div className="ia-row">
            {top.map((b, i) => {
              const place = top.length - i; // 3, 2, 1
              const isChamp = place === 1;
              const podH = place === 1 ? 120 : place === 2 ? 92 : 70;
              const medal =
                place === 1
                  ? "ia-gold"
                  : place === 2
                    ? "ia-silver"
                    : "ia-bronze";
              return (
                <div
                  key={b.id}
                  className={`pos-${place}`}
                  style={{ "--d": delayOf(i) + "s" }}>
                  <div className="ia-card">
                    <span className={`ia-medal ${medal}`}>{place}</span>
                    <Cover book={b} className="ia-cv" />
                    <span className="ia-r">
                      {isChamp ? "★ Juara 1" : `Peringkat ${place}`}
                    </span>
                    <h2 className="ia-t">{b.judul}</h2>
                    <p className="ia-s">
                      {b.penulis} · {fmtHits(b.hits)} pembaca
                    </p>
                  </div>
                  <div
                    className="ia-pod"
                    style={{ "--h": podH + "px" }}
                    aria-hidden="true">
                    <b>{place}</b>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ia-floor" />

          <button
            className="ia-cta"
            style={{ "--d": ctaDelay + "s" }}
            onClick={(e) => {
              e.stopPropagation();
              masuk();
            }}>
            Masuk ke Sela →
          </button>
        </div>

        <span className="ia-skip">klik di mana saja untuk masuk</span>

        <div className="ia-progress">
          {top.map((_, i) => (
            <span key={i} className="ia-seg">
              <i style={{ "--d": delayOf(i) + "s", "--dur": STEP + "s" }} />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
