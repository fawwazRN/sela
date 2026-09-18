import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import Cover from "./Cover";

const fmtHits = (n) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + " rb" : n;

/* ===== timeline sinematik (detik) ===== */
const CURTAIN_OPEN = 1.5;
const WORD_START = 1.55;
const LABEL_DELAY = 2.5;
const RULE_DELAY = 2.7;
const T0 = 3.0; // reveal pertama
const STEP = 0.85;
const delayOf = (i) => T0 + i * STEP;

const LETTERS = ["S", "e", "l", "a"];

export default function IntroAward() {
  const { books, views } = useApp();
  const [phase, setPhase] = useState("wait"); // wait | play | exit
  const [booted, setBooted] = useState(false); // 1 frame "boot" agar transisi tirai jalan
  const [gone, setGone] = useState(false);
  const tungguRef = useRef(null);

  /* ===== HP: hanya Juara 1 — lewat matchMedia, bukan sekadar CSS
     (timeline, beam, kelopak & progress ikut menyesuaikan) ===== */
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width:680px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width:680px)");
    const f = (e) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", f);
    else mq.addListener(f);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", f);
      else mq.removeListener(f);
    };
  }, []);

  /* urutan benar: kecil → besar, ambil 3 teratas.
     Array = [Peringkat 3, Peringkat 2, JUARA] */
  const top = useMemo(
    () =>
      [...books]
        .map((b) => ({ ...b, hits: views[b.slug] || 0 }))
        .filter((b) => b.hits > 0)
        .sort((a, b) => a.hits - b.hits)
        .slice(-3),
    [books, views],
  );

  /* yang dirender: ponsel = juara saja; layar lain = podium lengkap */
  const tampil = useMemo(
    () => (isMobile ? top.slice(-1) : top),
    [top, isMobile],
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

  /* boot: mount tertutup 1 frame, lalu play → transisi tirai DIJAMIN jalan */
  useEffect(() => {
    if (phase !== "play") return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setBooted(true)),
    );
    return () => cancelAnimationFrame(id);
  }, [phase]);

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

  /* scroll lock halaman di belakang — pulih di jalur keluar apa pun */
  useEffect(() => {
    if (gone || phase === "wait") return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase, gone]);

  /* FAILSAFE: auto-tutup; ponsel diberi waktu lebih longgar (bisa digulir) */
  useEffect(() => {
    if (phase !== "play") return;
    const champDelay = delayOf(tampil.length - 1);
    const t = setTimeout(() => masuk(), (champDelay + 8) * 1000);
    return () => clearTimeout(t);
  }, [phase, tampil.length]);

  useEffect(() => {
    if (phase !== "play") return;
    const f = (e) => {
      if (e.key === "Escape" || e.key === "Enter") masuk();
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [phase]);

  /* desktop: klik di mana saja. ponsel: hanya tombol CTA */
  const onRootClick = () => {
    if (window.matchMedia("(min-width:681px)").matches) masuk();
  };

  const champDelay = delayOf(tampil.length - 1);
  const ctaDelay = champDelay + 1.6;
  const skipDelay = ctaDelay + 0.5;

  const motes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        left: (i * 67 + 13) % 100,
        top: (i * 41 + 7) % 100,
        s: 2 + (i % 3),
        d: 8 + (i % 6),
        delay: (i * 0.9) % 7,
        blur: i % 2 === 0,
      })),
    [],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        d: champDelay + 0.15 + ((i * 13) % 22) / 10,
        dur: 2.8 + (i % 4) * 0.5,
        s: 6 + (i % 3) * 3,
        c: ["#E7C468", "#7C2430", "#F1E9D8"][i % 3],
      })),
    [champDelay],
  );

  if (gone || phase === "wait") return null;

  return (
    <>
      <style>{`
        .ia-root{
          position:fixed;inset:0;z-index:100;overflow:hidden;
          overflow-x:hidden;cursor:pointer;
          background:radial-gradient(ellipse at 50% 112%,#0E1712 0%,#0A0F0C 62%);
          color:#F1E9D8;font-family:var(--font-body,Georgia,serif);
          -webkit-tap-highlight-color:transparent;
        }
        .ia-root[data-phase="exit"]{transform:translateY(-100%);
          transition:transform .95s cubic-bezier(.76,0,.24,1);}

        /* ===== letterbox ===== */
        .ia-letterbox{position:fixed;left:0;right:0;height:7vh;min-height:22px;
          background:#000;z-index:50;pointer-events:none;
          transform:scaleY(0);transition:transform .5s cubic-bezier(.22,1,.36,1);}
        .ia-letterbox.top{top:0;transform-origin:top;}
        .ia-letterbox.bottom{bottom:0;transform-origin:bottom;}
        .ia-root[data-phase="play"] .ia-letterbox,
        .ia-root[data-phase="exit"] .ia-letterbox{transform:scaleY(1);}

        .ia-flash{position:fixed;inset:0;z-index:8;pointer-events:none;
          background:radial-gradient(circle at 50% 44%,rgba(245,222,154,.9),transparent 62%);
          opacity:0;animation:ia-flash .5s ease-out both;animation-delay:${CURTAIN_OPEN}s;}
        @keyframes ia-flash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}

        /* panggung — relative, bisa tumbuh & digulir di ponsel */
        .ia-stage-wrap{position:relative;width:100%;min-height:100%;
          display:flex;flex-direction:column;
          animation:ia-push 9s cubic-bezier(.22,.6,.3,1) both;}
        @keyframes ia-push{from{transform:scale(1.04)}to{transform:scale(1)}}

        .ia-stage{position:relative;z-index:2;width:100%;max-width:900px;
          margin:auto;padding:32px 16px;
          display:flex;flex-direction:column;align-items:center;}

        /* ===== tirai ===== */
        .ia-curtain{position:absolute;top:0;bottom:0;width:53%;z-index:5;
          background:
            repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 3px,transparent 3px 26px),
            linear-gradient(180deg,#7C2430 0%,#5B1A23 55%,#3E1119 100%);
          box-shadow:inset 0 0 70px rgba(0,0,0,.55);
          transition:transform 1.2s cubic-bezier(.65,0,.2,1);transition-delay:.3s;
          pointer-events:none;}
        .ia-curtain::after{content:"";position:absolute;top:0;bottom:0;width:14px;
          background:linear-gradient(180deg,#E7C468,#8B6914 60%,#E7C468);
          box-shadow:0 0 18px rgba(231,196,104,.5);}
        .ia-curtain.left{left:0;} .ia-curtain.left::after{right:0;}
        .ia-curtain.right{right:0;} .ia-curtain.right::after{left:0;}
        .ia-root[data-phase="play"] .ia-curtain.left,
        .ia-root[data-phase="exit"] .ia-curtain.left{transform:translateX(-102%);}
        .ia-root[data-phase="play"] .ia-curtain.right,
        .ia-root[data-phase="exit"] .ia-curtain.right{transform:translateX(102%);}

        .ia-vignette{position:absolute;inset:0;pointer-events:none;z-index:1;
          background:radial-gradient(ellipse at 50% 40%,transparent 28%,rgba(0,0,0,.65) 100%);
          animation:ia-breathe 6s ease-in-out infinite;}
        @keyframes ia-breathe{0%,100%{opacity:.85}50%{opacity:1}}
        .ia-grain{position:absolute;inset:-50%;pointer-events:none;opacity:.045;z-index:1;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E");
          animation:ia-grainmove 1.2s steps(4) infinite;}
        @keyframes ia-grainmove{0%{transform:translate(0,0)}25%{transform:translate(-2%,1%)}
          50%{transform:translate(1%,-2%)}75%{transform:translate(-1%,2%)}100%{transform:translate(0,0)}}
        .ia-mote{position:absolute;border-radius:50%;background:#E7C468;z-index:1;
          opacity:0;animation:ia-mote var(--dur) ease-in-out infinite;pointer-events:none;
          box-shadow:0 0 6px rgba(231,196,104,.7);}
        .ia-mote.blur{filter:blur(1.5px);}
        @keyframes ia-mote{0%,100%{opacity:0;transform:translateY(0)}
          50%{opacity:.4;transform:translateY(-18px)}}
        .ia-petal{position:absolute;top:-4vh;border-radius:1px;opacity:0;z-index:6;
          animation:ia-fall var(--dur) linear both;animation-delay:var(--d);
          pointer-events:none;}
        @keyframes ia-fall{0%{opacity:0;transform:translateY(0) rotate(0)}
          8%{opacity:1}100%{opacity:0;transform:translateY(115vh) rotate(560deg)}}
        .ia-beam{position:absolute;top:0;left:50%;width:min(430px,82vw);height:66%;z-index:1;
          transform:translateX(-50%);pointer-events:none;
          background:linear-gradient(to bottom,rgba(231,196,104,.28),rgba(231,196,104,.04) 72%,transparent);
          clip-path:polygon(41% 0,59% 0,88% 100%,12% 100%);
          opacity:0;animation:ia-beam 1.3s cubic-bezier(.22,1,.36,1) both,
            ia-sway 5s ease-in-out ${champDelay + 1.3}s infinite;
          animation-delay:${champDelay}s,${champDelay + 1.3}s;}
        @keyframes ia-beam{from{opacity:0;transform:translateX(-50%) scaleY(.3)}
          to{opacity:1;transform:translateX(-50%) scaleY(1)}}
        @keyframes ia-sway{0%,100%{transform:translateX(-50%) rotate(-1.2deg)}
          50%{transform:translateX(-50%) rotate(1.2deg)}}

        .ia-crest{width:38px;height:38px;opacity:0;
          animation:ia-up .8s cubic-bezier(.22,1,.36,1) both;animation-delay:${WORD_START - 0.2}s;}
        @keyframes ia-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .ia-wordmark{display:flex;margin-top:10px;overflow:hidden;}
        .ia-wordmark span{display:inline-block;font-family:var(--font-display,Fraunces,Georgia);
          font-weight:500;font-size:clamp(26px,3.6vw,34px);opacity:0;
          animation:ia-letter .7s cubic-bezier(.22,1,.36,1) both;}
        .ia-wordmark span.dot{color:#E7C468;font-weight:400;}
        @keyframes ia-letter{from{opacity:0;transform:translateY(60%) rotateX(50deg);filter:blur(6px)}
          to{opacity:1;transform:none;filter:none}}
        .ia-label{font-variant:small-caps;font-size:clamp(13px,1.6vw,15px);
          letter-spacing:.06em;color:#C9BBA0;margin-top:8px;opacity:0;
          animation:ia-up .8s cubic-bezier(.22,1,.36,1) both;animation-delay:${LABEL_DELAY}s;}
        .ia-rule{width:0;height:1px;margin-top:12px;
          background:linear-gradient(90deg,transparent,#8B6914,transparent);
          animation:ia-widen .9s cubic-bezier(.22,1,.36,1) both;animation-delay:${RULE_DELAY}s;}
        @keyframes ia-widen{from{width:0;opacity:0}to{width:64px;opacity:1}}

        /* ===== PODIUM ===== */
        .ia-row{display:flex;align-items:flex-end;justify-content:center;
          gap:clamp(10px,3vw,30px);margin-top:clamp(26px,5vh,44px);
          width:100%;perspective:1200px;}
        .ia-pos{display:flex;flex-direction:column;align-items:center;}
        .pos-1{order:2} .pos-2{order:1} .pos-3{order:3}
        .pos-2,.pos-3{animation:ia-focuspull 1.1s ease both;animation-delay:${champDelay}s;}
        @keyframes ia-focuspull{0%{opacity:1}35%{opacity:.5;filter:blur(1px)}100%{opacity:1;filter:none}}

        .ia-card{position:relative;display:flex;flex-direction:column;
          align-items:center;gap:8px;width:clamp(128px,20vw,168px);
          padding:28px 13px 15px;border-radius:3px;
          background:linear-gradient(165deg,rgba(241,233,216,.05),rgba(241,233,216,.02));
          border:1px solid rgba(231,196,104,.22);opacity:0;
          animation:ia-drop .85s cubic-bezier(.3,1.3,.55,1) both;animation-delay:var(--d);
          transform-style:preserve-3d;}
        @keyframes ia-drop{from{opacity:0;transform:translateY(-70px) rotateX(18deg) scale(1.03);
          filter:blur(5px)}to{opacity:1;transform:none;filter:none}}
        .ia-card::before{content:"";position:absolute;inset:6px;pointer-events:none;
          border:1px solid rgba(231,196,104,.16);border-radius:2px;}
        .ia-corner{position:absolute;width:9px;height:9px;border:1.5px solid #8B6914;z-index:2;}
        .ia-c-tl{top:5px;left:5px;border-right:none;border-bottom:none;}
        .ia-c-tr{top:5px;right:5px;border-left:none;border-bottom:none;}
        .ia-c-bl{bottom:5px;left:5px;border-right:none;border-top:none;}
        .ia-c-br{bottom:5px;right:5px;border-left:none;border-top:none;}
        .pos-1 .ia-card{width:clamp(158px,26vw,212px);padding-top:34px;
          border-color:rgba(231,196,104,.5);
          background:linear-gradient(165deg,rgba(231,196,104,.1),rgba(231,196,104,.02));
          box-shadow:0 20px 54px rgba(0,0,0,.55),0 0 46px rgba(231,196,104,.15);
          animation-name:ia-dropchamp;}
        .pos-1 .ia-corner{border-color:#E7C468;width:12px;height:12px;}
        @keyframes ia-dropchamp{from{opacity:0;transform:translateY(-130px) rotateX(24deg) scale(1.1);
          filter:blur(7px)}to{opacity:1;transform:none;filter:none}}
        .pos-1 .ia-shine{position:absolute;inset:0;border-radius:3px;pointer-events:none;overflow:hidden;}
        .pos-1 .ia-shine::after{content:"";position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 42%,rgba(255,255,255,.16) 50%,transparent 58%);
          background-size:260% 100%;animation:ia-shine 2.4s ease-in-out 2 both;
          animation-delay:${champDelay + 0.9}s;}
        @keyframes ia-shine{0%{background-position:130% 0}100%{background-position:-130% 0}}
        .ia-shock{position:absolute;top:-22px;left:50%;width:46px;height:46px;margin-left:-23px;
          border-radius:50%;border:1.5px solid #E7C468;opacity:0;z-index:2;pointer-events:none;
          animation:ia-shock 1.1s ease-out both;animation-delay:${champDelay + 0.05}s;}
        @keyframes ia-shock{0%{opacity:.9;transform:scale(.6)}100%{opacity:0;transform:scale(3.4)}}

        .ia-medal{position:absolute;top:-22px;left:50%;margin-left:-23px;
          width:46px;height:46px;border-radius:50%;display:grid;place-items:center;
          z-index:3;overflow:hidden;font-family:var(--font-display,Fraunces,Georgia);
          font-weight:600;font-size:19px;color:#241105;
          box-shadow:0 6px 16px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.4);}
        .ia-medal::before,.ia-medal::after{content:"";position:absolute;top:-13px;
          width:12px;height:26px;border-radius:2px;z-index:-1;}
        .ia-medal::before{left:9px;transform:rotate(-22deg)}
        .ia-medal::after{right:9px;transform:rotate(22deg)}
        .ia-medal .ia-glint{position:absolute;inset:0;
          background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.85) 50%,transparent 60%);
          background-size:260% 100%;animation:ia-glintmove 2.4s ease-in-out 2 both;
          animation-delay:${champDelay + 0.4}s;}
        @keyframes ia-glintmove{0%{background-position:150% 0}100%{background-position:-150% 0}}
        .ia-gold{background:linear-gradient(145deg,#F5DE9A,#E7C468 45%,#B3891B);}
        .ia-gold::before,.ia-gold::after{background:#8B6914;}
        .ia-silver{background:linear-gradient(145deg,#EDE7D6,#D9CDA6 45%,#A38F55);}
        .ia-silver::before,.ia-silver::after{background:#2F4A38;}
        .ia-bronze{background:linear-gradient(145deg,#DDB07E,#C0803F 55%,#7A4A1C);}
        .ia-bronze::before,.ia-bronze::after{background:#5B1A23;}
        .ia-wreath{position:absolute;top:-33px;left:50%;transform:translateX(-50%);
          width:72px;height:72px;z-index:2;pointer-events:none;opacity:0;
          animation:ia-up .8s ease both;animation-delay:${champDelay + 0.2}s;}

        .ia-cv{width:100%;aspect-ratio:3/4;border-radius:2px;
          box-shadow:0 12px 30px rgba(0,0,0,.5);border:1px solid rgba(0,0,0,.35);}
        .ia-r{font-variant:small-caps;font-size:12px;letter-spacing:.03em;color:#9C8F72;}
        .pos-1 .ia-r{color:#E7C468;}
        .ia-t{font-family:var(--font-display,Fraunces,Georgia);font-weight:600;
          font-size:clamp(13px,1.7vw,16px);line-height:1.25;text-align:center;}
        .pos-1 .ia-t{font-size:clamp(16px,2.3vw,20px);}
        .ia-s{font-size:11.5px;color:#9C8F72;text-align:center;line-height:1.5;}
        .ia-s em{font-style:normal;color:#C9BBA0;}

        .ia-pod{width:clamp(112px,20vw,180px);height:var(--h);
          background:linear-gradient(180deg,rgba(231,196,104,.08),rgba(241,233,216,.015));
          border:1px solid rgba(231,196,104,.18);border-bottom:none;
          border-radius:2px 2px 0 0;display:grid;place-items:center;
          transform-origin:bottom;position:relative;z-index:2;opacity:0;
          animation:ia-pod .8s cubic-bezier(.22,1,.36,1) both;animation-delay:${CURTAIN_OPEN + 0.4}s;}
        .pos-1 .ia-pod{border-color:rgba(231,196,104,.45);
          background:linear-gradient(180deg,rgba(231,196,104,.16),rgba(231,196,104,.02));}
        @keyframes ia-pod{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
        .ia-pod b{font-family:var(--font-display,Fraunces,Georgia);font-weight:600;
          font-size:clamp(28px,4.2vw,42px);color:transparent;
          -webkit-text-stroke:1px rgba(231,196,104,.32);}
        .pos-1 .ia-pod b{-webkit-text-stroke:1px rgba(231,196,104,.6);}
        .ia-floor{width:min(780px,94vw);height:1px;position:relative;z-index:2;
          background:linear-gradient(90deg,transparent,rgba(231,196,104,.28),transparent);}

        .ia-cta{margin-top:clamp(22px,4.2vh,38px);display:inline-flex;align-items:center;
          gap:10px;position:relative;z-index:2;opacity:0;
          animation:ia-cta-in .9s cubic-bezier(.22,1,.36,1) both,
            ia-glow 2.6s ease-in-out ${ctaDelay + 0.2}s infinite;
          animation-delay:${ctaDelay}s,${ctaDelay + 0.2}s;
          background:linear-gradient(160deg,#7C2430,#5B1A23);color:#F1E9D8;
          border:1px solid rgba(231,196,104,.4);cursor:pointer;
          font-family:var(--font-display,Fraunces,Georgia);font-weight:500;
          font-size:clamp(14px,1.8vw,16px);padding:13px 30px 13px 22px;border-radius:3px;
          box-shadow:0 10px 26px rgba(0,0,0,.4);transition:transform .25s,box-shadow .25s;}
        @keyframes ia-cta-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        @keyframes ia-glow{0%,100%{box-shadow:0 10px 26px rgba(0,0,0,.4)}
          50%{box-shadow:0 10px 30px rgba(0,0,0,.45),0 0 24px rgba(231,196,104,.22)}}
        .ia-cta:hover{transform:translateY(-2px);
          box-shadow:0 14px 34px rgba(0,0,0,.5),0 0 0 1px rgba(231,196,104,.55);}
        .ia-seal{width:20px;height:20px;border-radius:50%;flex:none;
          background:radial-gradient(circle at 34% 30%,#F5DE9A,#B3891B 70%);
          display:grid;place-items:center;font-family:var(--font-display,Fraunces,Georgia);
          font-size:11px;font-weight:700;color:#241105;
          box-shadow:inset 0 0 0 1px rgba(0,0,0,.25);}

        .ia-skip{position:absolute;bottom:calc(7vh + 22px);right:26px;
          font-variant:small-caps;font-size:12.5px;letter-spacing:.03em;z-index:2;
          color:rgba(241,233,216,.4);opacity:0;
          animation:ia-up .8s both;animation-delay:${skipDelay}s;}
        .ia-skip .only-mobile{display:none;}
        .ia-progress{position:absolute;bottom:7vh;left:0;right:0;display:flex;gap:8px;
          padding:10px 26px 16px;max-width:680px;margin:0 auto;z-index:2;}
        .ia-seg{flex:1;height:1px;background:rgba(231,196,104,.14);overflow:hidden;}
        .ia-seg i{display:block;height:100%;background:#E7C468;transform-origin:left;
          transform:scaleX(0);animation:ia-prog var(--dur) linear both;animation-delay:var(--d);}
        @keyframes ia-prog{to{transform:scaleX(1)}}

        /* ===== PONSEL — kolom digulir sendiri; HANYA JUARA ===== */
        @media (max-width:680px){
          .ia-root{overflow-y:auto;-webkit-overflow-scrolling:touch;
            overscroll-behavior:contain;}
          .ia-letterbox{height:3.2vh;min-height:14px;}
          .ia-stage-wrap{min-height:100%;}
          .ia-stage{padding:calc(3.2vh + 18px) 14px calc(3.2vh + 18px);}
          .ia-crest{width:30px;height:30px;}
          .ia-wordmark span{font-size:clamp(24px,7vw,30px);}
          .ia-label{font-size:11.5px;}
          .ia-row{flex-direction:column;align-items:center;gap:20px;margin-top:24px;}
          .ia-card{width:min(72vw,190px);padding:20px 11px 12px;}
          .pos-1 .ia-card{width:min(78vw,210px);padding-top:26px;}
          .ia-medal{width:40px;height:40px;font-size:17px;top:-20px;margin-left:-20px;}
          .ia-wreath{width:54px;height:54px;top:-26px;}
          .ia-shock{width:38px;height:38px;top:-19px;margin-left:-19px;}
          .ia-pod{height:26px;width:min(60vw,170px);}
          .ia-pod b{font-size:17px;}
          .ia-beam{width:84vw;height:40%;}
          .ia-cta{margin-top:22px;padding:12px 26px 12px 20px;font-size:14px;}

          .ia-curtain{width:100%;height:55%;left:0;right:0;}
          .ia-curtain.left{top:0;bottom:auto;}
          .ia-curtain.right{top:auto;bottom:0;}
          .ia-curtain::after{top:auto;bottom:auto;left:0;right:0;width:auto;height:12px;}
          .ia-curtain.left::after{bottom:0;top:auto;
            background:linear-gradient(90deg,#E7C468,#8B6914 60%,#E7C468);}
          .ia-curtain.right::after{top:0;bottom:auto;
            background:linear-gradient(90deg,#E7C468,#8B6914 60%,#E7C468);}
          .ia-root[data-phase="play"] .ia-curtain.left,
          .ia-root[data-phase="exit"] .ia-curtain.left{transform:translateY(-102%);}
          .ia-root[data-phase="play"] .ia-curtain.right,
          .ia-root[data-phase="exit"] .ia-curtain.right{transform:translateY(102%);}

          .ia-skip{position:static;display:block;margin:18px auto 4px;
            text-align:center;bottom:auto;right:auto;}
          .ia-skip .only-desktop{display:none;}
          .ia-skip .only-mobile{display:inline;}
          .ia-progress{position:static;margin:0 auto 8px;padding:0 40px;max-width:320px;}
        }

        /* ===== TABLET ===== */
        @media (min-width:681px) and (max-width:1024px){
          .ia-row{gap:clamp(16px,3.6vw,34px);}
          .ia-card{width:clamp(140px,17vw,170px);}
          .pos-1 .ia-card{width:clamp(170px,22vw,210px);}
        }

        /* ===== LAYAR BESAR / TV ===== */
        @media (min-width:1600px){
          .ia-letterbox{height:9vh;}
          .ia-stage{padding:48px;}
          .ia-stage-wrap{animation-duration:13s;}
          .ia-crest{width:52px;height:52px;}
          .ia-wordmark span{font-size:clamp(38px,3vw,58px);}
          .ia-label{font-size:17px;letter-spacing:.08em;}
          .ia-rule{animation-name:ia-widen-tv;}
          @keyframes ia-widen-tv{from{width:0;opacity:0}to{width:110px;opacity:1}}
          .ia-row{gap:56px;margin-top:64px;}
          .ia-card{width:200px;padding:34px 18px 18px;}
          .pos-1 .ia-card{width:300px;padding-top:42px;}
          .ia-medal{width:56px;height:56px;font-size:23px;top:-27px;margin-left:-28px;}
          .pos-1 .ia-medal{width:60px;height:60px;}
          .ia-cta{padding:17px 40px 17px 28px;font-size:19px;}
          .ia-curtain{width:47%;transition-duration:1.6s;}
          .ia-beam{width:min(560px,40vw);}
        }

        @media (prefers-reduced-motion:reduce){
          .ia-root,.ia-root *{animation:none!important;transition:none!important;}
          .ia-curtain.left{transform:translateX(-102%)!important;}
          .ia-curtain.right{transform:translateX(102%)!important;}
          .ia-letterbox{transform:scaleY(1)!important;}
          .ia-card,.ia-pod,.ia-cta,.ia-wordmark span,.ia-label,.ia-crest,
          .ia-skip{opacity:1!important;}
        }
      `}</style>

      <div
        className="ia-root"
        data-phase={booted ? phase : "boot"}
        onClick={onRootClick}
        role="button"
        aria-label="Masuk ke Sela">
        <div className="top ia-letterbox" />
        <div className="bottom ia-letterbox" />
        <div className="ia-flash" />

        <div className="ia-stage-wrap">
          <div className="ia-grain" />
          <div className="ia-vignette" />
          <div className="left ia-curtain" />
          <div className="right ia-curtain" />
          {tampil.length > 0 && <span className="ia-beam" />}

          {petals.map((p, i) => (
            <span
              key={i}
              className="ia-petal"
              style={{
                left: p.left + "%",
                width: p.s,
                height: p.s * 1.5,
                background: p.c,
                "--d": p.d + "s",
                "--dur": p.dur + "s",
              }}
            />
          ))}
          {motes.map((p, i) => (
            <span
              key={i}
              className={`ia-mote${p.blur ? " blur" : ""}`}
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
            <svg className="ia-crest" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 4c4 5 9 7 14 7-1 12-5 21-14 33C15 32 11 23 10 11c5 0 10-2 14-7Z"
                stroke="#8B6914"
                strokeWidth="1.2"
                fill="rgba(231,196,104,.08)"
              />
              <path
                d="M24 12v20M17 19l7-4 7 4"
                stroke="#E7C468"
                strokeWidth="1.1"
              />
            </svg>

            <div className="ia-wordmark">
              {LETTERS.map((l, i) => (
                <span
                  key={l + i}
                  style={{ animationDelay: WORD_START + i * 0.07 + "s" }}>
                  {l}
                </span>
              ))}
              <span
                className="dot"
                style={{ animationDelay: WORD_START + 0.31 + "s" }}>
                .
              </span>
            </div>
            <span className="ia-label">Anugerah Pembaca Tahun Ini</span>
            <div className="ia-rule" />

            {/* PODIUM — ponsel: juara saja */}
            <div className="ia-row">
              {tampil.map((b, i) => {
                const place = tampil.length - i;
                const isChamp = place === 1;
                const podH = place === 1 ? 120 : place === 2 ? 92 : 70;
                const medal =
                  place === 1
                    ? "ia-gold"
                    : place === 2
                      ? "ia-silver"
                      : "ia-bronze";
                return (
                  <div key={b.id} className={`ia-pos pos-${place}`}>
                    <div
                      className="ia-card"
                      style={{ "--d": delayOf(i) + "s" }}>
                      {isChamp && (
                        <svg
                          className="ia-wreath"
                          viewBox="0 0 70 70"
                          fill="none">
                          <path
                            d="M14 50C6 40 6 24 16 14M56 50c8-10 8-26-2-36"
                            stroke="#E7C468"
                            strokeWidth="1.3"
                            opacity=".8"
                          />
                          <path
                            d="M14 50c-3 3-3 6-1 8M56 50c3 3 3 6 1 8"
                            stroke="#E7C468"
                            strokeWidth="1.3"
                            opacity=".8"
                          />
                        </svg>
                      )}
                      <span className="ia-corner ia-c-tl" />
                      <span className="ia-corner ia-c-tr" />
                      <span className="ia-corner ia-c-bl" />
                      <span className="ia-corner ia-c-br" />
                      {isChamp && <div className="ia-shine" />}
                      {isChamp && <span className="ia-shock" />}
                      <span className={`ia-medal ${medal}`}>
                        {place}
                        {isChamp && <span className="ia-glint" />}
                      </span>
                      <Cover book={b} className="ia-cv" />
                      <span className="ia-r">
                        {isChamp ? "Juara Pertama" : `Peringkat ${place}`}
                      </span>
                      <h2 className="ia-t">{b.judul}</h2>
                      <p className="ia-s">
                        Karya <em>{b.penulis}</em>
                        <br />
                        {fmtHits(b.hits)} pembaca
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
              onClick={(e) => {
                e.stopPropagation();
                masuk();
              }}>
              <span className="ia-seal">S</span>
              Masuki Sela
            </button>

            <span className="ia-skip">
              <span className="only-desktop">
                klik di mana saja untuk masuk
              </span>
              <span className="only-mobile">sentuh tombol untuk masuk</span>
            </span>
            <div className="ia-progress">
              {tampil.map((_, i) => (
                <span key={i} className="ia-seg">
                  <i style={{ "--d": delayOf(i) + "s", "--dur": STEP + "s" }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
