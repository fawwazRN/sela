/* ===== inline: teks → token berformat (aman, tanpa raw HTML) ===== */
const RX =
  /(\*\*([^*]+)\*\*)|(__([^_]+)__)|(\*(\S(?:[^*\n]*\S)?)\*)|(`([^`]+)`)|((?<!\\)\{([^}\n]{1,60})\})/g;
const UNESC = /\\([\\`*_{}[\]()#+\-.!|>~])/g;
const unesc = (s) => s.replace(UNESC, "$1");

/* {Nama} hanya jika menyerupai nama: kapital di awal, 1–3 kata, tanpa simbol kode */
const NAME_LIKE = /^[A-Z][A-Za-z0-9.'’-]*(\s+[A-Z][A-Za-z0-9.'’-]*){0,2}$/;

export function inlineTokens(text) {
  const out = [];
  let last = 0,
    m;
  RX.lastIndex = 0;
  while ((m = RX.exec(text))) {
    if (m.index > last) out.push({ s: unesc(text.slice(last, m.index)) });
    if (m[2] != null) out.push({ s: unesc(m[2]), b: 1 });
    else if (m[4] != null) out.push({ s: unesc(m[4]), b: 1 });
    else if (m[6] != null) out.push({ s: unesc(m[6]), i: 1 });
    else if (m[8] != null) out.push({ s: m[8], c: 1 });
    else if (m[10] != null) {
      const name = m[10].trim();
      if (NAME_LIKE.test(name))
        out.push({ s: name, n: 1 }); // {Kancil} → kartu tokoh
      else out.push({ s: unesc("{" + m[10] + "}") }); // kode { } → literal
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ s: unesc(text.slice(last)) });
  return out;
}

export function extractNames(text) {
  const m = {};
  let x;
  const r = /(?<!\\)\{([^}\n]{1,60})\}/g;
  while ((x = r.exec(text))) {
    const name = x[1].trim();
    if (NAME_LIKE.test(name)) m[name] = (m[name] || 0) + 1;
  }
  return m;
}

const clean = (s) =>
  s
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(UNESC, "$1")
    .trim();

/* ===== markdown → blocks ===== */
export function mdToBlocks(mdRaw) {
  const md = mdRaw.replace(/^(\s*)&gt;/gm, "$1>"); // jaga-jaga entity HTML
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let buf = [],
    list = null,
    quote = null,
    pre = null,
    table = null;
  const pushP = () => {
    if (buf.length) {
      blocks.push({ t: "p", v: buf.join(" ").trim() });
      buf = [];
    }
  };
  const pushL = () => {
    if (list) {
      blocks.push({ t: "ul", v: list });
      list = null;
    }
  };
  const pushQ = () => {
    if (quote) {
      blocks.push({ t: "quote", v: quote });
      quote = null;
    }
  };
  const pushT = () => {
    if (table) {
      blocks.push({ t: "table", v: table });
      table = null;
    }
  };
  const flush = () => {
    pushP();
    pushL();
    pushQ();
    pushT();
  };

  for (const l of lines) {
    const t = l.trim();
    if (pre !== null) {
      if (/^```/.test(t)) {
        blocks.push({ t: "pre", v: pre.join("\n") });
        pre = null;
      } else pre.push(l);
      continue;
    }
    if (/^```/.test(t)) {
      flush();
      pre = [];
      continue;
    }
    if (!t) {
      flush();
      continue;
    }
    if (/^\|(.+)\|?$/.test(t)) {
      pushP();
      pushL();
      pushQ();
      const cells = t
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((s) => s.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;
      table = table || [];
      table.push(cells);
      continue;
    }
    pushT();
    if (/^#{1,6}\s/.test(t)) {
      flush();
      const lvl = t.match(/^#+/)[0].length;
      blocks.push({ t: "h", v: t.replace(/^#+\s*/, ""), lvl });
      continue;
    }
    /* blockquote + dukungan list di dalamnya (> * item → bullet) */
    if (/^>\s?/.test(t)) {
      pushP();
      pushL();
      let content = t.replace(/^>\s*/, "");
      const li = content.match(/^\s*(?:[-*+]|\d+[.)])\s+(.+)$/);
      let isItem = false;
      if (li) {
        content = li[1];
        isItem = true;
      }
      quote = quote || [];
      quote.push({ text: content, li: isItem });
      continue;
    }
    if (/^\s*(?:[-*+]|\d+[.)])\s+/.test(t)) {
      pushP();
      pushQ();
      list = list || [];
      list.push(t.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, ""));
      continue;
    }
    pushL();
    pushQ();
    buf.push(t);
  }
  flush();
  if (pre) blocks.push({ t: "pre", v: pre.join("\n") });
  return blocks;
}

/* ===== pisah markdown → chapters ===== */
export function splitChapters(md, mode = "otomatis") {
  const lines = md.split(/\r?\n/);
  const wc = (s) => s.split(/\s+/).filter(Boolean).length;

  let judul = null,
    start = 0;
  const firstIdx = lines.findIndex((l) => l.trim());
  if (firstIdx >= 0) {
    const t = lines[firstIdx].trim();
    if (/^#\s+/.test(t)) {
      const hasMore = lines
        .slice(firstIdx + 1)
        .some((l) => /^\s*#{1,6}\s/.test(l));
      if (hasMore) {
        const jt = clean(t.replace(/^#\s+/, ""));
        if (jt && jt.length <= 150) {
          judul = jt;
          start = firstIdx + 1;
        }
      }
    } else if (!/^[>|*`-]/.test(t) && t.length <= 90) {
      judul = clean(t);
      start = firstIdx + 1;
    }
  }
  const body = lines.slice(start).join("\n");

  const splitOn = (re) => {
    const parts = [];
    let cur = null,
      buf = [];
    body.split(/\r?\n/).forEach((l) => {
      if (re.test(l)) {
        if (cur !== null || buf.length)
          parts.push({ judul: cur, raw: buf.join("\n").trim() });
        cur = clean(l.replace(re, "")) || clean((l.match(re) || [""])[0]);
        buf = [];
      } else buf.push(l);
    });
    parts.push({ judul: cur, raw: buf.join("\n").trim() });
    return parts;
  };

  const H1 = /^\s*#\s+/,
    H2 = /^\s*#{2}\s+/,
    BAB = /^\s*(bab\s+\d+|bagian\s+\d+|chapter\s+\d+)[.:—-]?\s*/i;

  let parts;
  if (mode === "h1") parts = splitOn(H1);
  else if (mode === "h2") parts = splitOn(H2);
  else if (mode === "bab") parts = splitOn(BAB);
  else {
    parts = splitOn(H1);
    if (parts.filter((p) => p.raw.trim()).length < 2) parts = splitOn(H2);
    if (parts.filter((p) => p.raw.trim()).length < 2) parts = splitOn(BAB);
  }

  const out = [];
  let intro = "";
  parts.forEach((p) => {
    if (!p.judul && !p.raw.trim()) return;
    if (!p.judul) {
      intro = (intro ? intro + "\n\n" : "") + p.raw;
      return;
    }
    out.push(p);
  });

  let chapters;
  if (out.length) {
    chapters = out;
    if (intro.trim()) {
      if (wc(intro) >= 20)
        chapters.unshift({ judul: "Pendahuluan", raw: intro.trim() });
      else chapters[0].raw = intro.trim() + "\n\n" + chapters[0].raw;
    }
  } else {
    chapters = [{ judul: judul || "Isi", raw: body.trim() }];
  }

  chapters.forEach((c, i) => {
    if (!c.judul) {
      const first = (
        c.raw.split("\n").find((l) => l.trim() && !/^\s*#/.test(l)) || ""
      ).replace(/^[>#*\-\s]+/, "");
      c.judul = first
        ? clean(first).split(/[.!?]/)[0].slice(0, 60)
        : `Bagian ${i + 1}`;
    }
  });
  return { judul, chapters };
}
