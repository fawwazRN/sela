import { useEffect, useMemo, useRef, useState } from "react";
import { DIK } from "../../data/books";
import { inlineTokens, extractNames } from "../../lib/markdown";

function Words({ s, bold, italic, code }) {
  const parts = s.split(/(\s+)/).filter(Boolean);
  return parts.map((w, j) => {
    if (/^\s+$/.test(w)) return " ";
    const dw = w.toLowerCase().replace(/[^a-z-]/g, "");
    const el = code ? (
      <code key={j}>{w}</code>
    ) : (
      <span key={j} className="wd" data-w={dw}>
        {w}
      </span>
    );
    if (bold) return <b key={j}>{el}</b>;
    if (italic) return <i key={j}>{el}</i>;
    return el;
  });
}

function Inline({ text }) {
  return inlineTokens(text).map((tok, i) => {
    if (tok.n)
      return (
        <span key={i} className="wn" data-name={tok.s}>
          {tok.s}
        </span>
      );
    return <Words key={i} s={tok.s} bold={tok.b} italic={tok.i} code={tok.c} />;
  });
}

function RichPara({ raw, big }) {
  return (
    <p data-raw={raw} className={big ? "text-[1.12em] leading-[1.9]" : ""}>
      <Inline text={raw} />
    </p>
  );
}

function Diagram({ v }) {
  const [on, setOn] = useState(false);
  return (
    <div className="my-6 p-5 card">
      <p className="mb-3 lbl">{v.label}</p>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {v.items.map((x) => (
          <span key={x} className="!cursor-default chip">
            {x}
          </span>
        ))}
        <button
          onClick={() => setOn((o) => !o)}
          className="!px-4 !py-1.5 text-xs btn btn-p">
          {on ? "↺ Ulangi" : "Jalankan proses ▸"}
        </button>
      </div>
      <div
        className={`grid transition-all duration-500 overflow-hidden ${on ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="flex flex-wrap items-center gap-2 min-h-0 text-sm">
          <span className="px-1 font-display text-accent text-xl">→</span>
          {v.out.map((x) => (
            <span key={x} className="!cursor-default chip chip-on">
              {x}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineList({ items }) {
  const ref = useRef(null);
  useEffect(() => {
    const els = ref.current.querySelectorAll(".tl-item");
    const ob = new IntersectionObserver(
      (es) =>
        es.forEach((e) => e.target.classList.toggle("on", e.isIntersecting)),
      { rootMargin: "-35% 0px -35% 0px" },
    );
    els.forEach((el) => ob.observe(el));
    return () => ob.disconnect();
  }, []);
  return (
    <div ref={ref} className="my-4">
      {items.map((it, i) => (
        <div key={i} className="tl-item" data-y={it.y}>
          <p className="tl-txt">{it.v}</p>
        </div>
      ))}
    </div>
  );
}

function Verse({ v, lambat }) {
  return lambat ? (
    <div className="verse-wrap">
      {v.map((l, i) => (
        <p key={i} className="verse">
          {l}
        </p>
      ))}
    </div>
  ) : (
    <p className="text-[1.05em] italic leading-loose">
      {v.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
    </p>
  );
}

/* kutipan: hanya bullet → callout; ada prosa → real quote */
function Quote({ v }) {
  const parts = [];
  let items = [];
  const flushItems = () => {
    if (items.length) {
      parts.push(
        <ul key={"q-ul-" + parts.length}>
          {items.map((li, j) => (
            <li key={j}>
              <Inline text={li} />
            </li>
          ))}
        </ul>,
      );
      items = [];
    }
  };
  v.forEach((qq, j) => {
    const q = typeof qq === "string" ? { text: qq, li: false } : qq;
    if (q.li) items.push(q.text);
    else {
      flushItems();
      parts.push(
        <p key={j}>
          <Inline text={q.text} />
        </p>,
      );
    }
  });
  flushItems();
  const allItems = v.every((qq) => (typeof qq === "string" ? false : !!qq.li));
  return (
    <blockquote className={allItems ? "quote-list" : ""}>{parts}</blockquote>
  );
}

export default function ContentRenderer({ book, chap, mode, onTap }) {
  const c = book.bab[chap];

  const blocks = useMemo(() => {
    const out = [];
    let tl = null;
    (c.isi || []).forEach((b) => {
      if (b.t === "tl") {
        (tl = tl || []).push(b);
        return;
      }
      if (tl) {
        out.push({ t: "tlgroup", items: tl });
        tl = null;
      }
      out.push(b);
    });
    if (tl) out.push({ t: "tlgroup", items: tl });
    return out;
  }, [book.id, chap]);

  const counts = useMemo(() => {
    const m = {};
    (c.isi || []).forEach((b) => {
      const s = typeof b.v === "string" ? b.v : "";
      Object.entries(extractNames(s)).forEach(
        ([k, v]) => (m[k] = (m[k] || 0) + v),
      );
    });
    return m;
  }, [book.id, chap]);

  return (
    <div
      className="mx-auto max-w-[68ch] read"
      onClick={(e) => {
        const t = e.target.closest(".wd, .wn");
        if (!t || !onTap) return;
        const r = t.getBoundingClientRect();
        if (t.classList.contains("wn")) {
          onTap({
            rect: r,
            word: t.dataset.name,
            name: true,
            count: counts[t.dataset.name] || 1,
          });
        } else {
          onTap({
            rect: r,
            word: t.textContent,
            arti: DIK[t.dataset.w],
            para: t.closest("p")?.dataset?.raw || "",
          });
        }
      }}>
      <p className="mb-2 lbl">{book.judul}</p>
      <h1 className="mb-8 font-display font-bold text-3xl md:text-4xl leading-tight">
        {c.judul}
      </h1>
      {blocks.map((b, i) => {
        if (b.t === "p")
          return <RichPara key={i} raw={b.v} big={mode === "ceria"} />;
        if (b.t === "h")
          return b.lvl >= 3 ? (
            <h3 key={i}>
              <Inline text={b.v} />
            </h3>
          ) : (
            <h2 key={i}>
              <Inline text={b.v} />
            </h2>
          );
        if (b.t === "quote") return <Quote key={i} v={b.v} />;
        if (b.t === "ul")
          return (
            <ul key={i}>
              {b.v.map((li, j) => (
                <li key={j}>
                  <Inline text={li} />
                </li>
              ))}
            </ul>
          );
        if (b.t === "pre")
          return (
            <pre key={i}>
              <code>{b.v}</code>
            </pre>
          );
        if (b.t === "table")
          return (
            <table key={i}>
              <thead>
                <tr>
                  {b.v[0].map((h, j) => (
                    <th key={j}>
                      <Inline text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.v.slice(1).map((row, j) => (
                  <tr key={j}>
                    {row.map((cell, k) => (
                      <td key={k}>
                        <Inline text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          );
        if (b.t === "diagram") return <Diagram key={i} v={b.v} />;
        if (b.t === "tlgroup") return <TimelineList key={i} items={b.items} />;
        if (b.t === "verse")
          return (
            <div
              key={i}
              className={
                mode === "lambat"
                  ? "lambat-snap min-h-[62vh] flex flex-col justify-center"
                  : "my-5"
              }>
              <Verse v={b.v} lambat={mode === "lambat"} />
            </div>
          );
        return null;
      })}
    </div>
  );
}
