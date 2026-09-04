import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

const INK = "#1A1815";
const WARNA = ["#1A1815", "#B3402A", "#2F5D50", "#5B4B8A", "#C2571F"];
const STICKY = ["#F6D860", "#F4A9A0", "#9AD1D4", "#B8E0A8", "#D9C2F0"];
const KERTAS = [
  ["garis", "Garis"],
  ["kotak", "Kotak"],
  ["kuning", "Kuning"],
  ["putih", "Polos"],
];
const TOOL = [
  ["pilih", "Pilih"],
  ["tangan", "Geser"],
  ["kotak", "Kotak"],
  ["sticky", "Sticky"],
  ["panah", "Panah"],
  ["teks", "Teks"],
  ["pena", "Pena"],
];
const uid = () => crypto.randomUUID();

const textW = (e) =>
  Math.max(
    40,
    Math.max(...(e.text || "").split("\n").map((l) => l.length), 1) *
      e.size *
      0.62,
  );
function edgeAnchor(r, t) {
  const cx = r.x + r.w / 2,
    cy = r.y + r.h / 2;
  const dx = t.x - cx,
    dy = t.y - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const s = Math.min(
    dx ? r.w / 2 / Math.abs(dx) : 1e9,
    dy ? r.h / 2 / Math.abs(dy) : 1e9,
  );
  return { x: cx + dx * s, y: cy + dy * s };
}
const distSeg = (p, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1;
  const tt = Math.max(
    0,
    Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(p.x - (x1 + tt * dx), p.y - (y1 + tt * dy));
};

export default function Catatan() {
  const { user } = useApp();
  const [notes, setNotes] = useState(null);
  const [aktifId, setAktifId] = useState(null);
  const [tool, setTool] = useState("pilih");
  const [warna, setWarna] = useState(WARNA[1]);
  const [selIds, setSelIds] = useState([]);
  const [teksEd, setTeksEd] = useState(null); // {x, y, value, targetId?}
  const [draftS, setDraftS] = useState(null);
  const [lassoS, setLassoS] = useState(null);
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });

  const wrapRef = useRef(null),
    svgRef = useRef(null);
  const drag = useRef(null);
  const draftRef = useRef(null);
  const hist = useRef([]);

  const aktif = notes?.find((n) => n.id === aktifId) || null;
  const els = aktif?.elements || [];
  const rects = useMemo(
    () =>
      new Map(
        els
          .filter((e) => e.type === "kotak" || e.type === "sticky")
          .map((e) => [e.id, e]),
      ),
    [els],
  );
  const sel =
    selIds.length === 1 ? els.find((x) => x.id === selIds[0]) || null : null;
  const draft = draftS,
    lasso = lassoS;

  const toWorld = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - view.x) / view.z,
      y: (e.clientY - r.top - view.y) / view.z,
    };
  };
  const toScr = (wx, wy) => ({
    x: wx * view.z + view.x,
    y: wy * view.z + view.y,
  });

  /* ===== draft ref helpers ===== */
  const setDraft = (v) => {
    draftRef.current = v;
    setDraftS(v);
  };
  const setDraftUp = (fn) => {
    const nv = fn(draftRef.current);
    draftRef.current = nv;
    setDraftS(nv);
  };

  /* ===== muat ===== */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("notes")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setNotes(data || []);
        if (data?.length) setAktifId(data[0].id);
      });
  }, [user?.id]);

  const upd = (patch) =>
    setNotes((ns) =>
      ns.map((n) => (n.id === aktifId ? { ...n, ...patch } : n)),
    );
  const setEls = (fn) =>
    setNotes((ns) =>
      ns.map((n) =>
        n.id === aktifId ? { ...n, elements: fn(n.elements) } : n,
      ),
    );
  const snapshot = () => {
    hist.current.push(JSON.stringify(els));
    if (hist.current.length > 60) hist.current.shift();
  };
  const undo = () => {
    const prev = hist.current.pop();
    if (prev && aktif) {
      upd({ elements: JSON.parse(prev) });
      setSelIds([]);
    }
  };

  useEffect(() => {
    if (!aktif) return;
    const t = setTimeout(() => {
      supabase
        .from("notes")
        .update({
          judul: aktif.judul,
          kertas: aktif.kertas,
          elements: aktif.elements,
          updated_at: new Date().toISOString(),
        })
        .eq("id", aktif.id);
    }, 800);
    return () => clearTimeout(t);
  }, [aktif?.elements, aktif?.judul, aktif?.kertas, aktifId]);

  useEffect(() => {
    setSelIds((ids) => ids.filter((id) => els.some((e) => e.id === id)));
  }, [els]);

  /* ===== zoom ===== */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left,
        my = e.clientY - r.top;
      setView((v) => {
        const z = Math.min(4, Math.max(0.15, v.z * (e.deltaY < 0 ? 1.1 : 0.9)));
        return {
          z,
          x: mx - ((mx - v.x) / v.z) * z,
          y: my - ((my - v.y) / v.z) * z,
        };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [aktifId, notes]);

  /* ===== hit ===== */
  const rectAt = (p, except) => {
    for (const r of [...rects.values()].reverse())
      if (
        r.id !== except &&
        p.x >= r.x - 6 &&
        p.x <= r.x + r.w + 6 &&
        p.y >= r.y - 6 &&
        p.y <= r.y + r.h + 6
      )
        return r;
    return null;
  };
  const hitEl = (p) => {
    for (let i = els.length - 1; i >= 0; i--) {
      const e = els[i];
      if (
        (e.type === "kotak" || e.type === "sticky") &&
        p.x >= e.x &&
        p.x <= e.x + e.w &&
        p.y >= e.y &&
        p.y <= e.y + e.h
      )
        return e;
      if (
        e.type === "teks" &&
        p.x >= e.x - 4 &&
        p.x <= e.x + textW(e) + 4 &&
        p.y >= e.y - e.size &&
        p.y <= e.y + 8
      )
        return e;
      if (e.type === "pena")
        for (let j = 1; j < e.points.length; j++)
          if (
            distSeg(
              p,
              e.points[j - 1].x,
              e.points[j - 1].y,
              e.points[j].x,
              e.points[j].y,
            ) <
            8 / view.z + 4
          )
            return e;
      if (
        e.type === "panah" &&
        !e.from &&
        !e.to &&
        distSeg(p, e.x1, e.y1, e.x2, e.y2) < 10
      )
        return e;
    }
    return null;
  };
  const arrowEnds = (e) => {
    const A = rects.get(e.from),
      B = rects.get(e.to);
    const ca = A
      ? { x: A.x + A.w / 2, y: A.y + A.h / 2 }
      : { x: e.x1, y: e.y1 };
    const cb = B
      ? { x: B.x + B.w / 2, y: B.y + B.h / 2 }
      : { x: e.x2, y: e.y2 };
    const s = A ? edgeAnchor(A, cb) : ca,
      t = B ? edgeAnchor(B, ca) : cb;
    return { x1: s.x, y1: s.y, x2: t.x, y2: t.y };
  };
  const lassoHit = (L) => {
    const x0 = Math.min(L.x1, L.x2),
      x1 = Math.max(L.x1, L.x2);
    const y0 = Math.min(L.y1, L.y2),
      y1 = Math.max(L.y1, L.y2);
    return els
      .filter((e) => {
        if (e.type === "kotak" || e.type === "sticky")
          return e.x < x1 && e.x + e.w > x0 && e.y < y1 && e.y + e.h > y0;
        if (e.type === "teks")
          return (
            e.x < x1 && e.x + textW(e) > x0 && e.y - e.size < y1 && e.y + 8 > y0
          );
        if (e.type === "pena")
          return e.points.some(
            (q) => q.x >= x0 && q.x <= x1 && q.y >= y0 && q.y <= y1,
          );
        const a = arrowEnds(e);
        return (
          (a.x1 >= x0 && a.x1 <= x1 && a.y1 >= y0 && a.y1 <= y1) ||
          (a.x2 >= x0 && a.x2 <= x1 && a.y2 >= y0 && a.y2 <= y1)
        );
      })
      .map((e) => e.id);
  };

  /* ===== EDITOR TEKS (satu-satunya jalan membuat/mengubah teks) ===== */
  const bukaTeks = (x, y, targetId = null, value = "") =>
    setTeksEd({ x, y, value, targetId });
  const simpanTeks = () => {
    const t = teksEd;
    if (!t) return;
    const v = t.value;
    if (t.targetId) {
      snapshot();
      setEls((xs) =>
        xs
          .map((x) => (x.id === t.targetId ? { ...x, text: v } : x))
          .filter((x) => !(x.type === "teks" && !(x.text || "").trim())),
      );
    } else if (v.trim()) {
      snapshot();
      setEls((xs) => [
        ...xs,
        {
          id: uid(),
          type: "teks",
          x: t.x,
          y: t.y,
          size: 20,
          text: v,
          color: warna,
        },
      ]);
    }
    setTeksEd(null);
  };

  /* ===== pointer ===== */
  const down = (e) => {
    if (teksEd) return;
    svgRef.current.setPointerCapture(e.pointerId);
    const p = toWorld(e);

    if (tool === "tangan") {
      drag.current = {
        mode: "pan",
        sx: e.clientX,
        sy: e.clientY,
        vx: view.x,
        vy: view.y,
      };
      return;
    }

    if (tool === "teks") {
      bukaTeks(p.x, p.y + 20);
      return;
    } // ← sederhana: buka editor, titik.

    if (tool === "kotak" || tool === "sticky") {
      snapshot();
      const base =
        tool === "sticky"
          ? {
              id: uid(),
              type: "sticky",
              x: p.x - 70,
              y: p.y - 70,
              w: 140,
              h: 140,
              text: "",
              color: STICKY[Math.floor(Math.random() * STICKY.length)],
            }
          : {
              id: uid(),
              type: "kotak",
              x: p.x,
              y: p.y,
              w: 0,
              h: 0,
              text: "",
              color: warna,
            };
      setDraft(base);
      drag.current = { mode: "buat", ox: p.x, oy: p.y };
      return;
    }
    if (tool === "panah") {
      snapshot();
      const r = rectAt(p);
      setDraft({
        id: uid(),
        type: "panah",
        from: r?.id || null,
        to: null,
        x1: r ? r.x + r.w / 2 : p.x,
        y1: r ? r.y + r.h / 2 : p.y,
        x2: p.x,
        y2: p.y,
        color: warna,
      });
      drag.current = { mode: "panah" };
      return;
    }
    if (tool === "pena") {
      snapshot();
      setDraft({ id: uid(), type: "pena", points: [p], color: warna });
      drag.current = { mode: "pena" };
      return;
    }

    /* tool pilih */
    if (selIds.length === 1) {
      const s = els.find((x) => x.id === selIds[0]);
      if (
        s &&
        (s.type === "kotak" || s.type === "sticky") &&
        Math.abs(p.x - (s.x + s.w - 8 / view.z)) < 14 / view.z &&
        Math.abs(p.y - (s.y + s.h - 8 / view.z)) < 14 / view.z
      ) {
        snapshot();
        drag.current = { mode: "resize", o: { ...s } };
        return;
      }
    }
    const el = hitEl(p);
    if (el) {
      if (e.shiftKey) {
        setSelIds((ids) =>
          ids.includes(el.id)
            ? ids.filter((i) => i !== el.id)
            : [...ids, el.id],
        );
        return;
      }
      if (!selIds.includes(el.id)) setSelIds([el.id]);
      snapshot();
      const idsP = selIds.includes(el.id) ? selIds : [el.id];
      const origs = els
        .filter((x) => idsP.includes(x.id))
        .map((o) => JSON.parse(JSON.stringify(o)));
      drag.current = { mode: "move", origs, ox: p.x, oy: p.y };
    } else {
      setLassoS({
        type: "lasso",
        x1: p.x,
        y1: p.y,
        x2: p.x,
        y2: p.y,
        add: e.shiftKey,
      });
      drag.current = { mode: "lasso" };
    }
  };

  const move = (e) => {
    if (teksEd) return;
    const d = drag.current;
    if (!d) {
      const dr = draftRef.current;
      if (dr?.type === "panah" || dr?.type === "pena") {
        const p = toWorld(e);
        if (dr.type === "panah") {
          const r = rectAt(p, dr.from);
          setDraftUp((x) => ({
            ...x,
            to: r?.id || null,
            x2: r ? r.x + r.w / 2 : p.x,
            y2: r ? r.y + r.h / 2 : p.y,
          }));
        } else setDraftUp((x) => ({ ...x, points: [...x.points, p] }));
      } else if (dr?.type === "lasso") {
        const p = toWorld(e);
        setLassoS((L) => ({ ...L, x2: p.x, y2: p.y }));
      }
      return;
    }
    if (d.mode === "pan") {
      setView((v) => ({
        ...v,
        x: d.vx + (e.clientX - d.sx),
        y: d.vy + (e.clientY - d.sy),
      }));
      return;
    }
    const p = toWorld(e);
    if (d.mode === "buat") {
      setDraftUp((x) => ({
        ...x,
        x: Math.min(p.x, d.ox),
        y: Math.min(p.y, d.oy),
        w: Math.max(20, Math.abs(p.x - d.ox)),
        h: Math.max(20, Math.abs(p.y - d.oy)),
      }));
    } else if (d.mode === "panah") {
      const r = rectAt(p, draftRef.current?.from);
      setDraftUp((x) => ({
        ...x,
        to: r?.id || null,
        x2: r ? r.x + r.w / 2 : p.x,
        y2: r ? r.y + r.h / 2 : p.y,
      }));
    } else if (d.mode === "pena") {
      setDraftUp((x) => ({ ...x, points: [...x.points, p] }));
    } else if (d.mode === "move") {
      const dx = p.x - d.ox,
        dy = p.y - d.oy,
        ids = d.origs.map((o) => o.id);
      setEls((xs) =>
        xs.map((x) => {
          if (!ids.includes(x.id)) return x;
          const o = d.origs.find((q) => q.id === x.id);
          if (x.type === "pena")
            return {
              ...x,
              points: o.points.map((q) => ({ x: q.x + dx, y: q.y + dy })),
            };
          if (x.type === "panah" && !x.from && !x.to)
            return {
              ...x,
              x1: o.x1 + dx,
              y1: o.y1 + dy,
              x2: o.x2 + dx,
              y2: o.y2 + dy,
            };
          return { ...x, x: o.x + dx, y: o.y + dy };
        }),
      );
    } else if (d.mode === "resize") {
      setEls((xs) =>
        xs.map((x) =>
          x.id === d.o.id
            ? {
                ...x,
                w: Math.max(40, d.o.w + (p.x - d.ox)),
                h: Math.max(40, d.o.h + (p.y - d.oy)),
              }
            : x,
        ),
      );
    }
  };

  const up = () => {
    const dr = draftRef.current;
    if (dr?.type === "kotak" || dr?.type === "sticky") {
      /* ← INI PERBAIKAN UTAMA: tambah (append), bukan map */
      setEls((xs) => [...xs, dr]);
      setSelIds([dr.id]);
    } else if (dr?.type === "panah") {
      if (dr.from || dr.to || Math.hypot(dr.x2 - dr.x1, dr.y2 - dr.y1) > 20)
        setEls((xs) => [...xs, dr]);
    } else if (dr?.type === "pena") {
      if (dr.points.length > 2) setEls((xs) => [...xs, dr]);
    } else if (dr?.type === "lasso") {
      const ids = lassoHit(dr);
      setSelIds((old) => (dr.add ? [...new Set([...old, ...ids])] : ids));
    }
    setDraft(null);
    drag.current = null;
  };

  /* ===== edit teks via klik ganda ===== */
  const dbl = (e) => {
    const el = hitEl(toWorld(e));
    if (el && el.type === "teks") bukaTeks(el.x, el.y, el.id, el.text);
    else if (el && (el.type === "kotak" || el.type === "sticky"))
      bukaTeks(el.x + el.w / 2, el.y + el.h / 2, el.id, el.text);
  };

  /* ===== aksi ===== */
  const hapusSel = () => {
    if (!selIds.length) return;
    snapshot();
    setEls((xs) =>
      xs.filter(
        (x) =>
          !selIds.includes(x.id) &&
          !selIds.includes(x.from) &&
          !selIds.includes(x.to),
      ),
    );
    setSelIds([]);
  };
  const duplikat = () => {
    if (!selIds.length) return;
    snapshot();
    const clones = els
      .filter((x) => selIds.includes(x.id))
      .map((o) => {
        const c = JSON.parse(JSON.stringify(o));
        c.id = uid();
        c.x += 24;
        c.y += 24;
        if (c.points)
          c.points = c.points.map((q) => ({ x: q.x + 24, y: q.y + 24 }));
        return c;
      });
    setEls((xs) => [...xs, ...clones]);
    setSelIds(clones.map((c) => c.id));
  };
  const gantiWarna = (c) => {
    setWarna(c);
    if (!selIds.length) return;
    snapshot();
    setEls((xs) =>
      xs.map((x) => (selIds.includes(x.id) ? { ...x, color: c } : x)),
    );
  };
  const pilihSemua = () => setSelIds(els.map((e) => e.id));

  useEffect(() => {
    const f = (e) => {
      if (teksEd) return;
      const tag = document.activeElement?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selIds.length) {
        e.preventDefault();
        hapusSel();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplikat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        pilihSemua();
      }
      if (e.key === "Escape") {
        setSelIds([]);
        setTool("pilih");
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  });

  /* ===== ekspor PNG ===== */
  const ekspor = () => {
    if (!els.length) return;
    const pad = 40;
    let x0 = 1e9,
      y0 = 1e9,
      x1 = -1e9,
      y1 = -1e9;
    const take = (x, y) => {
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    };
    els.forEach((e) => {
      if (e.type === "kotak" || e.type === "sticky") {
        take(e.x, e.y);
        take(e.x + e.w, e.y + e.h);
      } else if (e.type === "teks") {
        take(e.x, e.y - e.size);
        take(
          e.x + textW(e),
          e.y + (e.text || "").split("\n").length * e.size * 1.25,
        );
      } else if (e.type === "pena") e.points.forEach((q) => take(q.x, q.y));
      else if (e.type === "panah") {
        const a = arrowEnds(e);
        take(a.x1, a.y1);
        take(a.x2, a.y2);
      }
    });
    const w = x1 - x0 + pad * 2,
      h = y1 - y0 + pad * 2,
      S = 2;
    const cv = document.createElement("canvas");
    cv.width = w * S;
    cv.height = h * S;
    const x = cv.getContext("2d");
    x.scale(S, S);
    x.translate(pad - x0, pad - y0);
    x.fillStyle = "#FFFDF6";
    x.fillRect(x0 - pad, y0 - pad, w, h);
    els.forEach((e) => {
      x.fillStyle = e.color;
      x.strokeStyle = e.color;
      x.lineWidth = 2.2;
      if (e.type === "kotak" || e.type === "sticky") {
        x.beginPath();
        if (x.roundRect)
          x.roundRect(e.x, e.y, e.w, e.h, e.type === "sticky" ? 4 : 10);
        else x.rect(e.x, e.y, e.w, e.h);
        if (e.type === "sticky") x.fill();
        else {
          x.fillStyle = e.color + "12";
          x.fill();
          x.stroke();
        }
        x.fillStyle = INK;
        x.textAlign = "center";
        x.textBaseline = "middle";
        (e.text || "")
          .split("\n")
          .forEach((l, i, arr) =>
            x.fillText(
              l,
              e.x + e.w / 2,
              e.y + e.h / 2 + (i - (arr.length - 1) / 2) * 19,
            ),
          );
      } else if (e.type === "panah") {
        const a = arrowEnds(e);
        x.beginPath();
        x.moveTo(a.x1, a.y1);
        x.lineTo(a.x2, a.y2);
        x.stroke();
        const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1),
          hl = 13;
        x.beginPath();
        x.moveTo(a.x2, a.y2);
        x.lineTo(
          a.x2 - hl * Math.cos(ang - 0.42),
          a.y2 - hl * Math.sin(ang - 0.42),
        );
        x.lineTo(
          a.x2 - hl * Math.cos(ang + 0.42),
          a.y2 - hl * Math.sin(ang + 0.42),
        );
        x.closePath();
        x.fill();
      } else if (e.type === "pena") {
        x.lineWidth = 2.5;
        x.lineCap = "round";
        x.lineJoin = "round";
        x.beginPath();
        e.points.forEach((q, i) =>
          i ? x.lineTo(q.x, q.y) : x.moveTo(q.x, q.y),
        );
        x.stroke();
      } else if (e.type === "teks") {
        x.font = `${e.size}px Georgia, serif`;
        x.textAlign = "left";
        x.textBaseline = "alphabetic";
        (e.text || "")
          .split("\n")
          .forEach((l, i) => x.fillText(l, e.x, e.y + i * e.size * 1.25));
      }
    });
    const a = document.createElement("a");
    a.href = cv.toDataURL("image/png");
    a.download = `${(aktif.judul || "catatan").replace(/\s+/g, "-")}.png`;
    a.click();
  };

  /* ===== CRUD ===== */
  const baru = async () => {
    const { data } = await supabase
      .from("notes")
      .insert({ judul: "Catatan baru", kertas: "garis", elements: [] })
      .select()
      .single();
    if (data) {
      setNotes((ns) => [data, ...(ns || [])]);
      setAktifId(data.id);
      setSelIds([]);
      setView({ x: 0, y: 0, z: 1 });
    }
  };
  const hapusNote = async (id) => {
    if (!confirm("Hapus catatan ini?")) return;
    await supabase.from("notes").delete().eq("id", id);
    const sisa = notes.filter((n) => n.id !== id);
    setNotes(sisa);
    setAktifId(sisa[0]?.id || null);
  };

  /* ===== gate ===== */
  if (!user)
    return (
      <div className="mx-auto px-5 py-24 max-w-md text-center fadein">
        <h1 className="font-display font-bold text-3xl">Catatan</h1>
        <p className="mt-3 text-ink2">
          Kanvas tak berujung: kotak, sticky, panah, teks, pena.
        </p>
        <Link to="/masuk" className="mt-6 btn btn-p">
          Masuk untuk mencatat
        </Link>
      </div>
    );

  const z = view.z;
  let edScr = null;
  if (teksEd) {
    const s = toScr(teksEd.x, teksEd.y - 24);
    const box = wrapRef.current?.getBoundingClientRect();
    edScr = {
      left: Math.max(6, Math.min(s.x, (box?.width || 800) - 254)),
      top: Math.max(6, Math.min(s.y, (box?.height || 500) - 94)),
    };
  }

  return (
    <div className="mx-auto px-5 pt-10 pb-8 max-w-6xl fadein">
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-display font-bold text-3xl">Catatan</h1>
        <button onClick={baru} className="text-xs btn btn-p shrink-0">
          + Catatan baru
        </button>
      </div>

      <div className="flex md:flex-row flex-col gap-4 mt-6">
        <aside className="md:w-56 shrink-0">
          <p className="hidden md:block mb-2 lbl">Kumpulan catatan</p>
          <div className="flex md:flex-col gap-2 pb-1 md:overflow-visible overflow-x-auto">
            {(notes || []).map((n) => (
              <div
                key={n.id}
                className={`card px-3 py-2.5 flex items-center gap-2 cursor-pointer min-w-40 shrink-0 ${n.id === aktifId ? "border-ink" : "hover:border-ink"}`}
                onClick={() => {
                  setAktifId(n.id);
                  setSelIds([]);
                  hist.current = [];
                  setView({ x: 0, y: 0, z: 1 });
                }}>
                <span
                  className="rounded-full w-2 h-2 shrink-0"
                  style={{
                    background:
                      n.kertas === "kuning"
                        ? "#D9B94B"
                        : n.kertas === "kotak"
                          ? "#2F5D50"
                          : n.kertas === "putih"
                            ? "#C9C2B2"
                            : "#B3402A",
                  }}
                />
                <span className="flex-1 text-sm truncate">{n.judul}</span>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    hapusNote(n.id);
                  }}
                  className="text-[11px] text-ink2 hover:text-accent shrink-0">
                  hapus
                </button>
              </div>
            ))}
            {notes && !notes.length && (
              <p className="py-4 text-ink2 text-sm">Belum ada catatan.</p>
            )}
          </div>
        </aside>

        {aktif ? (
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 p-2.5 card">
              <input
                value={aktif.judul}
                onChange={(e) => upd({ judul: e.target.value })}
                className="!py-1.5 !w-40 font-medium text-sm inp"
              />
              <div className="flex gap-1">
                {KERTAS.map(([id, nm]) => (
                  <button
                    key={id}
                    onClick={() => upd({ kertas: id })}
                    className={`chip !px-2.5 !py-1 text-[11px] ${aktif.kertas === id ? "chip-on" : ""}`}>
                    {nm}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block bg-line mx-0.5 w-px h-5" />
              {TOOL.map(([id, nm]) => (
                <button
                  key={id}
                  onClick={() => {
                    setTool(id);
                    setSelIds([]);
                  }}
                  className={`chip !px-3 !py-1 text-[11px] ${tool === id ? "chip-on" : ""}`}>
                  {nm}
                </button>
              ))}
              <div className="flex gap-1.5 ml-0.5">
                {WARNA.map((c) => (
                  <button
                    key={c}
                    onClick={() => gantiWarna(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform ${warna === c ? "border-ink scale-110" : "border-transparent"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="hidden sm:block bg-line mx-0.5 w-px h-5" />
              <button
                onClick={undo}
                title="Undo Ctrl+Z"
                className="!px-2.5 !py-1 text-[11px] chip">
                ↩
              </button>
              <button
                onClick={duplikat}
                disabled={!selIds.length}
                className="disabled:opacity-40 !px-2.5 !py-1 text-[11px] chip">
                Duplikat
              </button>
              <button
                onClick={pilihSemua}
                className="!px-2.5 !py-1 text-[11px] chip">
                Semua
              </button>
              <button
                onClick={ekspor}
                className="!px-2.5 !py-1 text-[11px] chip">
                PNG
              </button>
              {!!selIds.length && (
                <button
                  onClick={hapusSel}
                  className="!px-2.5 !py-1 !border-accent/40 !text-accent text-[11px] chip">
                  Hapus ({selIds.length})
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-ink2">
              Alat <b>Teks</b>: klik kertas → ketik → Enter · klik ganda
              teks/kotak = ubah isi · seret kosong = seleksi (Shift = tambah) ·
              Delete = hapus
              {selIds.length > 0 && (
                <b className="text-accent"> · {selIds.length} terpilih</b>
              )}
            </p>

            <div
              ref={wrapRef}
              className="relative mt-2 !rounded-xl overflow-hidden touch-none card"
              style={{
                height: "68vh",
                background:
                  aktif.kertas === "kuning"
                    ? "#F5E6B8"
                    : aktif.kertas === "putih"
                      ? "#FFFDF6"
                      : "#FBFDF8",
              }}>
              <svg
                ref={svgRef}
                className="block w-full h-full select-none"
                style={{
                  cursor:
                    tool === "tangan"
                      ? "grab"
                      : tool === "teks"
                        ? "text"
                        : tool === "pilih"
                          ? "default"
                          : "crosshair",
                }}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerLeave={up}
                onDoubleClick={dbl}>
                <defs>
                  <pattern
                    id="pgaris"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse">
                    <line
                      x1="0"
                      y1="27.5"
                      x2="28"
                      y2="27.5"
                      stroke="rgba(26,24,21,.1)"
                      strokeWidth="1"
                    />
                  </pattern>
                  <pattern
                    id="pkotak"
                    width="24"
                    height="24"
                    patternUnits="userSpaceOnUse">
                    <path
                      d="M24 0H0V24"
                      fill="none"
                      stroke="rgba(47,93,80,.14)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <g transform={`translate(${view.x},${view.y}) scale(${z})`}>
                  <rect
                    x={-100000}
                    y={-100000}
                    width={300000}
                    height={300000}
                    fill={
                      aktif.kertas === "garis"
                        ? "url(#pgaris)"
                        : aktif.kertas === "kotak"
                          ? "url(#pkotak)"
                          : "transparent"
                    }
                  />

                  {els.map((e) => {
                    if (e.type === "kotak" || e.type === "sticky") {
                      const ln = (e.text || "").split("\n");
                      return (
                        <g key={e.id}>
                          <rect
                            x={e.x}
                            y={e.y}
                            width={e.w}
                            height={e.h}
                            rx={e.type === "sticky" ? 4 : 10}
                            fill={
                              e.type === "sticky" ? e.color : e.color + "12"
                            }
                            stroke={
                              e.type === "sticky" ? "rgba(0,0,0,.08)" : e.color
                            }
                            strokeWidth={2 / z}
                          />
                          {e.text &&
                            ln.map((l, i) => (
                              <text
                                key={i}
                                x={e.x + e.w / 2}
                                y={
                                  e.y + e.h / 2 + (i - (ln.length - 1) / 2) * 19
                                }
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize="15"
                                fill={INK}
                                fontFamily="Literata, Georgia, serif">
                                {l}
                              </text>
                            ))}
                        </g>
                      );
                    }
                    if (e.type === "panah") {
                      const a = e.from || e.to ? arrowEnds(e) : e;
                      const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1),
                        hl = 13;
                      return (
                        <g key={e.id}>
                          <line
                            x1={a.x1}
                            y1={a.y1}
                            x2={a.x2}
                            y2={a.y2}
                            stroke={e.color}
                            strokeWidth={2.2 / z}
                          />
                          <polygon
                            points={`${a.x2},${a.y2} ${a.x2 - hl * Math.cos(ang - 0.42)},${a.y2 - hl * Math.sin(ang - 0.42)} ${a.x2 - hl * Math.cos(ang + 0.42)},${a.y2 - hl * Math.sin(ang + 0.42)}`}
                            fill={e.color}
                          />
                        </g>
                      );
                    }
                    if (e.type === "pena")
                      return (
                        <polyline
                          key={e.id}
                          points={e.points
                            .map((q) => `${q.x},${q.y}`)
                            .join(" ")}
                          fill="none"
                          stroke={e.color}
                          strokeWidth={2.5 / z}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    return (
                      <text
                        key={e.id}
                        x={e.x}
                        y={e.y}
                        fontSize={e.size}
                        fill={e.color}
                        fontFamily="Literata, Georgia, serif">
                        {(e.text || "").split("\n").map((l, i) => (
                          <tspan
                            key={i}
                            x={e.x}
                            dy={i === 0 ? 0 : e.size * 1.25}>
                            {l}
                          </tspan>
                        ))}
                      </text>
                    );
                  })}

                  {draft?.type === "kotak" && (
                    <rect
                      x={draft.x}
                      y={draft.y}
                      width={draft.w}
                      height={draft.h}
                      rx="10"
                      fill={draft.color + "12"}
                      stroke={draft.color}
                      strokeWidth={2 / z}
                      strokeDasharray="7 5"
                    />
                  )}
                  {draft?.type === "sticky" && (
                    <rect
                      x={draft.x}
                      y={draft.y}
                      width={draft.w}
                      height={draft.h}
                      rx="4"
                      fill={draft.color}
                      opacity="0.85"
                    />
                  )}
                  {draft?.type === "panah" && (
                    <line
                      x1={draft.x1}
                      y1={draft.y1}
                      x2={draft.x2}
                      y2={draft.y2}
                      stroke={draft.color}
                      strokeWidth={2.2 / z}
                      strokeDasharray="7 5"
                    />
                  )}
                  {draft?.type === "pena" && (
                    <polyline
                      points={draft.points
                        .map((q) => `${q.x},${q.y}`)
                        .join(" ")}
                      fill="none"
                      stroke={draft.color}
                      strokeWidth={2.5 / z}
                      strokeLinecap="round"
                    />
                  )}
                  {lasso && (
                    <rect
                      x={Math.min(lasso.x1, lasso.x2)}
                      y={Math.min(lasso.y1, lasso.y2)}
                      width={Math.abs(lasso.x2 - lasso.x1)}
                      height={Math.abs(lasso.y2 - lasso.y1)}
                      fill="rgba(179,64,42,.06)"
                      stroke="#B3402A"
                      strokeWidth={1.5 / z}
                      strokeDasharray="6 4"
                    />
                  )}

                  {selIds.map((id) => {
                    const e = els.find((x) => x.id === id);
                    if (!e) return null;
                    if (e.type === "kotak" || e.type === "sticky")
                      return (
                        <rect
                          key={id}
                          x={e.x - 4}
                          y={e.y - 4}
                          width={e.w + 8}
                          height={e.h + 8}
                          rx="12"
                          fill="none"
                          stroke="#B3402A"
                          strokeWidth={1.5 / z}
                          strokeDasharray="5 4"
                        />
                      );
                    if (e.type === "teks")
                      return (
                        <rect
                          key={id}
                          x={e.x - 6}
                          y={e.y - e.size - 4}
                          width={textW(e) + 12}
                          height={
                            (e.text || "").split("\n").length * e.size + 14
                          }
                          rx="6"
                          fill="none"
                          stroke="#B3402A"
                          strokeWidth={1.5 / z}
                          strokeDasharray="5 4"
                        />
                      );
                    return null;
                  })}
                  {sel &&
                    (sel.type === "kotak" || sel.type === "sticky") &&
                    selIds.length === 1 && (
                      <rect
                        x={sel.x + sel.w - 7 / z}
                        y={sel.y + sel.h - 7 / z}
                        width={14 / z}
                        height={14 / z}
                        rx="3"
                        fill="#F7F3EA"
                        stroke="#1A1815"
                        strokeWidth={2 / z}
                      />
                    )}
                </g>
              </svg>

              {/* ===== EDITOR TEKS — muncul persis di titik klik ===== */}
              {teksEd && edScr && (
                <div
                  className="z-20 absolute"
                  style={{ left: edScr.left, top: edScr.top }}>
                  <textarea
                    autoFocus
                    value={teksEd.value}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(ev) =>
                      setTeksEd({ ...teksEd, value: ev.target.value })
                    }
                    onKeyDown={(ev) => {
                      if (ev.key === "Escape") setTeksEd(null);
                      if (ev.key === "Enter" && !ev.shiftKey) {
                        ev.preventDefault();
                        simpanTeks();
                      }
                    }}
                    className="block bg-card/95 shadow-xl p-2 border-2 border-accent rounded-lg outline-none w-60 h-20 text-sm resize-none"
                    placeholder="Tulis teks… (Enter = simpan)"
                  />
                  <div className="flex gap-1.5 mt-1">
                    <button
                      onClick={simpanTeks}
                      className="!px-3 !py-1 text-[11px] chip chip-on">
                      Simpan
                    </button>
                    <button
                      onClick={() => setTeksEd(null)}
                      className="!px-3 !py-1 text-[11px] chip">
                      Batal
                    </button>
                  </div>
                </div>
              )}

              <div className="right-3 bottom-3 absolute flex items-center gap-1 px-2 py-1 !rounded-full text-xs card">
                <button
                  onClick={() =>
                    setView((v) => ({ ...v, z: Math.max(0.15, v.z * 0.85) }))
                  }
                  className="px-2 font-bold">
                  −
                </button>
                <button
                  onClick={() => setView({ x: 0, y: 0, z: 1 })}
                  className="px-1.5 tabular-nums">
                  {Math.round(z * 100)}%
                </button>
                <button
                  onClick={() =>
                    setView((v) => ({ ...v, z: Math.min(4, v.z * 1.15) }))
                  }
                  className="px-2 font-bold">
                  +
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 place-items-center grid py-20 text-ink2 text-sm card">
            Pilih atau buat catatan untuk mulai.
          </div>
        )}
      </div>
    </div>
  );
}
