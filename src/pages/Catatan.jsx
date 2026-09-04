import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

const WARNA = ["#1A1815", "#B3402A", "#2F5D50", "#5B4B8A", "#C2571F"];
const KERTAS = [
  ["putih", "Putih"],
  ["kuning", "Kuning"],
  ["garis", "Garis"],
  ["kotak", "Kotak"],
];
const W = 1600,
  H = 1200;

const distSeg = (p, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1;
  const t = Math.max(
    0,
    Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / (dx * dx + dy * dy || 1)),
  );
  return Math.hypot(p.x - (x1 + t * dx), p.y - (y1 + t * dy));
};

export default function Catatan() {
  const { user } = useApp();
  const [notes, setNotes] = useState(null);
  const [aktifId, setAktifId] = useState(null);
  const [tool, setTool] = useState("pilih");
  const [warna, setWarna] = useState(WARNA[1]);
  const [selId, setSelId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [edit, setEdit] = useState(null); // {id, value}
  const svgRef = useRef(null);
  const drag = useRef(null);

  const aktif = notes?.find((n) => n.id === aktifId) || null;
  const els = aktif?.elements || [];

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

  const updAktif = (patch) =>
    setNotes((ns) =>
      ns.map((n) => (n.id === aktifId ? { ...n, ...patch } : n)),
    );
  const setEls = (fn) =>
    setNotes((ns) =>
      ns.map((n) =>
        n.id === aktifId ? { ...n, elements: fn(n.elements) } : n,
      ),
    );

  /* ===== autosave ===== */
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
    }, 900);
    return () => clearTimeout(t);
  }, [aktif?.elements, aktif?.judul, aktif?.kertas, aktifId]);

  /* ===== geometri ===== */
  const rects = useMemo(
    () => new Map(els.filter((e) => e.type === "kotak").map((e) => [e.id, e])),
    [els],
  );
  const center = (id) => {
    const r = rects.get(id);
    return r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null;
  };
  const ends = (e) => {
    const a = e.from ? center(e.from) : { x: e.x1, y: e.y1 };
    const b = e.to ? center(e.to) : { x: e.x2, y: e.y2 };
    return {
      x1: a?.x ?? e.x1,
      y1: a?.y ?? e.y1,
      x2: b?.x ?? e.x2,
      y2: b?.y ?? e.y2,
    };
  };
  const pt = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const rectAt = (p, except) => {
    for (const r of [...rects.values()].reverse())
      if (
        r.id !== except &&
        p.x >= r.x - 10 &&
        p.x <= r.x + r.w + 10 &&
        p.y >= r.y - 10 &&
        p.y <= r.y + r.h + 10
      )
        return r;
    return null;
  };
  const hit = (p) => {
    for (let i = els.length - 1; i >= 0; i--) {
      const e = els[i];
      if (
        e.type === "kotak" &&
        p.x >= e.x &&
        p.x <= e.x + e.w &&
        p.y >= e.y &&
        p.y <= e.y + e.h
      )
        return e;
      if (e.type === "teks") {
        const w = Math.max(30, (e.text?.length || 1) * e.size * 0.62);
        if (
          p.x >= e.x - 4 &&
          p.x <= e.x + w + 4 &&
          p.y >= e.y - e.size &&
          p.y <= e.y + 8
        )
          return e;
      }
      if (e.type === "panah") {
        const a = ends(e);
        if (distSeg(p, a.x1, a.y1, a.x2, a.y2) < 10) return e;
      }
    }
    return null;
  };

  /* ===== interaksi ===== */
  const down = (e) => {
    if (edit || !aktif) return;
    const p = pt(e);
    svgRef.current.setPointerCapture(e.pointerId);
    if (tool === "kotak") {
      setDraft({
        id: "draft",
        type: "kotak",
        x: p.x,
        y: p.y,
        w: 0,
        h: 0,
        text: "",
        color: warna,
      });
      drag.current = { mode: "buat-kotak", ox: p.x, oy: p.y };
    } else if (tool === "panah") {
      const r = rectAt(p);
      setDraft({
        id: "draft",
        type: "panah",
        from: r?.id || null,
        to: null,
        x1: r ? center(r.id).x : p.x,
        y1: r ? center(r.id).y : p.y,
        x2: p.x,
        y2: p.y,
        color: warna,
      });
      drag.current = { mode: "buat-panah" };
    } else if (tool === "teks") {
      const el = {
        id: crypto.randomUUID(),
        type: "teks",
        x: p.x,
        y: p.y,
        size: 20,
        text: "",
        color: warna,
      };
      setEls((xs) => [...xs, el]);
      setSelId(el.id);
      setEdit({ id: el.id, value: "" });
      setTool("pilih");
    } else {
      const s = selId ? els.find((x) => x.id === selId) : null;
      if (
        s?.type === "kotak" &&
        Math.abs(p.x - (s.x + s.w - 7)) < 10 &&
        Math.abs(p.y - (s.y + s.h - 7)) < 10
      ) {
        drag.current = { mode: "resize", o: { ...s } };
        return;
      }
      const el = hit(p);
      if (el) {
        setSelId(el.id);
        drag.current = {
          mode: "move",
          o: JSON.parse(JSON.stringify(el)),
          ox: p.x,
          oy: p.y,
        };
      } else setSelId(null);
    }
  };

  const move = (e) => {
    if (edit) return;
    const d = drag.current;
    if (!d) {
      if (draft) {
        const p = pt(e);
        setDraft((dr) => {
          if (dr.type === "kotak") {
            const x2 = dr.x + (p.x - dr.x) * 2,
              y2 = dr.y + (p.y - dr.y) * 2; // placeholder agar drag natural
            return {
              ...dr,
              w: Math.abs(p.x - dr.x),
              h: Math.abs(p.y - dr.y),
              x: Math.min(p.x, dr.x),
              y: Math.min(p.y, dr.y),
            };
          }
          const r = rectAt(p, dr.from);
          return {
            ...dr,
            to: r?.id || null,
            x2: r ? center(r.id).x : p.x,
            y2: r ? center(r.id).y : p.y,
          };
        });
      }
      return;
    }
    const p = pt(e);
    if (d.mode === "buat-kotak") {
      setDraft((dr) => ({
        ...dr,
        x: Math.min(p.x, d.ox),
        y: Math.min(p.y, d.oy),
        w: Math.abs(p.x - d.ox),
        h: Math.abs(p.y - d.oy),
      }));
    } else if (d.mode === "buat-panah") {
      setDraft((dr) => {
        const r = rectAt(p, dr.from);
        return {
          ...dr,
          to: r?.id || null,
          x2: r ? center(r.id).x : p.x,
          y2: r ? center(r.id).y : p.y,
        };
      });
    } else if (d.mode === "move") {
      const dx = p.x - d.ox,
        dy = p.y - d.oy;
      setEls((xs) =>
        xs.map((x) => {
          if (x.id !== d.o.id) return x;
          if (x.type === "kotak") return { ...x, x: d.o.x + dx, y: d.o.y + dy };
          if (x.type === "teks") return { ...x, x: d.o.x + dx, y: d.o.y + dy };
          if (!x.from && !x.to)
            return {
              ...x,
              x1: d.o.x1 + dx,
              y1: d.o.y1 + dy,
              x2: d.o.x2 + dx,
              y2: d.o.y2 + dy,
            };
          return x;
        }),
      );
    } else if (d.mode === "resize") {
      setEls((xs) =>
        xs.map((x) =>
          x.id === d.o.id
            ? {
                ...x,
                w: Math.max(24, d.o.w + (p.x - d.ox)),
                h: Math.max(24, d.o.h + (p.y - d.oy)),
              }
            : x,
        ),
      );
    }
  };

  const up = () => {
    if (draft) {
      if (draft.type === "kotak") {
        const fix = draft.w < 24 && draft.h < 24 ? { w: 160, h: 100 } : {};
        const el = { ...draft, id: crypto.randomUUID(), ...fix };
        setEls((xs) => [...xs, el]);
        setSelId(el.id);
      } else if (Math.hypot(draft.x2 - draft.x1, draft.y2 - draft.y1) > 18) {
        setEls((xs) => [...xs, { ...draft, id: crypto.randomUUID() }]);
      }
      setDraft(null);
      setTool("pilih");
    }
    drag.current = null;
  };

  const dbl = (e) => {
    const el = hit(pt(e));
    if (!el) return;
    setSelId(el.id);
    setEdit({ id: el.id, value: el.text || "" });
  };

  const commitEdit = () => {
    if (!edit) return;
    const v = edit.value;
    setEls((xs) =>
      xs
        .map((x) => (x.id === edit.id ? { ...x, text: v } : x))
        .filter((x) => !(x.type === "teks" && !x.text.trim())),
    );
    setEdit(null);
  };

  const hapusSel = () => {
    if (!selId) return;
    setEls((xs) =>
      xs.filter((x) => x.id !== selId && x.from !== selId && x.to !== selId),
    );
    setSelId(null);
  };
  useEffect(() => {
    const f = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selId &&
          !edit &&
          document.activeElement.tagName !== "TEXTAREA" &&
          document.activeElement.tagName !== "INPUT"
        )
          hapusSel();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [selId, edit]);

  /* ===== aksi catatan ===== */
  const baru = async () => {
    const { data } = await supabase
      .from("notes")
      .insert({ judul: "Catatan baru", kertas: "garis", elements: [] })
      .select()
      .single();
    if (data) {
      setNotes((ns) => [data, ...(ns || [])]);
      setAktifId(data.id);
      setSelId(null);
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
        <p className="mt-3 text-ink2 leading-relaxed">
          Kanvas catatan pribadi — kotak, panah terhubung, teks bebas, di atas
          kertas garis, kotak-kotak, kuning, atau polos. Tersinkron ke akunmu.
        </p>
        <Link to="/masuk" className="mt-6 btn btn-p">
          Masuk untuk mencatat
        </Link>
      </div>
    );

  const sel = els.find((x) => x.id === selId);
  const editEl = edit ? els.find((x) => x.id === edit.id) : null;

  return (
    <div className="mx-auto px-5 pt-10 pb-10 max-w-6xl fadein">
      <div className="flex justify-between items-center gap-4">
        <h1 className="font-display font-bold text-3xl">Catatan</h1>
        <button onClick={baru} className="text-xs btn btn-p shrink-0">
          + Catatan baru
        </button>
      </div>

      <div className="flex md:flex-row flex-col gap-4 mt-6">
        {/* ===== SIDEBAR ===== */}
        <aside className="md:w-56 shrink-0">
          <p className="hidden md:block mb-2 lbl">Kumpulan catatan</p>
          <div className="flex md:flex-col gap-2 pb-1 md:overflow-visible overflow-x-auto">
            {(notes || []).map((n) => (
              <div
                key={n.id}
                className={`card px-3 py-2.5 flex items-center gap-2 cursor-pointer min-w-40 shrink-0 ${n.id === aktifId ? "border-ink" : "hover:border-ink"}`}
                onClick={() => {
                  setAktifId(n.id);
                  setSelId(null);
                  setEdit(null);
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
                  onClick={(e) => {
                    e.stopPropagation();
                    hapusNote(n.id);
                  }}
                  className="text-[11px] text-ink2 hover:text-accent shrink-0">
                  hapus
                </button>
              </div>
            ))}
            {notes && notes.length === 0 && (
              <p className="py-4 text-ink2 text-sm">Belum ada catatan.</p>
            )}
          </div>
        </aside>

        {/* ===== EDITOR ===== */}
        {aktif ? (
          <div className="flex-1 min-w-0">
            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 card">
              <input
                value={aktif.judul}
                onChange={(e) => updAktif({ judul: e.target.value })}
                className="!py-1.5 !w-44 font-medium text-sm inp"
              />
              <div className="flex gap-1">
                {KERTAS.map(([id, nm]) => (
                  <button
                    key={id}
                    onClick={() => updAktif({ kertas: id })}
                    className={`chip !px-2.5 !py-1 text-[11px] ${aktif.kertas === id ? "chip-on" : ""}`}>
                    {nm}
                  </button>
                ))}
              </div>
              <div className="hidden sm:block bg-line mx-1 w-px h-5" />
              {[
                ["pilih", "Pilih"],
                ["kotak", "Kotak"],
                ["panah", "Panah"],
                ["teks", "Teks"],
              ].map(([id, nm]) => (
                <button
                  key={id}
                  onClick={() => {
                    setTool(id);
                    setSelId(null);
                  }}
                  className={`chip !px-3 !py-1 text-[11px] ${tool === id ? "chip-on" : ""}`}>
                  {nm}
                </button>
              ))}
              <div className="flex gap-1.5 ml-1">
                {WARNA.map((c) => (
                  <button
                    key={c}
                    onClick={() => setWarna(c)}
                    className={`w-5 h-5 rounded-full border-2 ${warna === c ? "border-ink scale-110" : "border-transparent"} transition-transform`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              {sel && (
                <button
                  onClick={hapusSel}
                  className="ml-auto !px-3 !py-1 !border-accent/40 !text-accent text-[11px] chip">
                  Hapus terpilih
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-ink2">
              Klik ganda pada kotak/teks untuk menulis. Panah otomatis menempel
              ke kotak terdekat. Tekan Delete untuk menghapus.
            </p>

            {/* kanvas */}
            <div
              className={`kertas-${aktif.kertas} card !rounded-xl mt-2 overflow-auto relative`}
              style={{ maxHeight: "68vh" }}>
              <svg
                ref={svgRef}
                width={W}
                height={H}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onDoubleClick={dbl}
                className="block touch-none select-none"
                style={{ cursor: tool === "pilih" ? "default" : "crosshair" }}>
                {els.map((e) => {
                  if (e.type === "kotak") {
                    const ln = (e.text || "").split("\n");
                    return (
                      <g key={e.id} style={{ pointerEvents: "none" }}>
                        <rect
                          x={e.x}
                          y={e.y}
                          width={e.w}
                          height={e.h}
                          rx="10"
                          fill={e.color + "14"}
                          stroke={e.color}
                          strokeWidth="2"
                        />
                        {e.text && (
                          <text
                            x={e.x + e.w / 2}
                            y={e.y + e.h / 2}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="14"
                            fill="#1A1815"
                            fontFamily="Literata, Georgia, serif">
                            {ln.map((l, i) => (
                              <tspan
                                key={i}
                                x={e.x + e.w / 2}
                                dy={i === 0 ? -(ln.length - 1) * 9 : 18}>
                                {l}
                              </tspan>
                            ))}
                          </text>
                        )}
                      </g>
                    );
                  }
                  if (e.type === "panah") {
                    const a = ends(e);
                    const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
                    const hl = 12;
                    const p1 = {
                      x: a.x2 - hl * Math.cos(ang - 0.4),
                      y: a.y2 - hl * Math.sin(ang - 0.4),
                    };
                    const p2 = {
                      x: a.x2 - hl * Math.cos(ang + 0.4),
                      y: a.y2 - hl * Math.sin(ang + 0.4),
                    };
                    return (
                      <g key={e.id} style={{ pointerEvents: "none" }}>
                        <line
                          x1={a.x1}
                          y1={a.y1}
                          x2={a.x2}
                          y2={a.y2}
                          stroke={e.color}
                          strokeWidth="2"
                        />
                        <polygon
                          points={`${a.x2},${a.y2} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                          fill={e.color}
                        />
                      </g>
                    );
                  }
                  return (
                    <text
                      key={e.id}
                      x={e.x}
                      y={e.y}
                      fontSize={e.size}
                      fill={e.color}
                      fontFamily="Literata, Georgia, serif"
                      style={{ pointerEvents: "none" }}>
                      {e.text}
                    </text>
                  );
                })}

                {draft && draft.type === "kotak" && (
                  <rect
                    x={draft.x}
                    y={draft.y}
                    width={draft.w}
                    height={draft.h}
                    rx="10"
                    fill={draft.color + "14"}
                    stroke={draft.color}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                )}
                {draft && draft.type === "panah" && (
                  <line
                    x1={draft.x1}
                    y1={draft.y1}
                    x2={draft.x2}
                    y2={draft.y2}
                    stroke={draft.color}
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                )}

                {sel?.type === "kotak" && !edit && (
                  <rect
                    x={sel.x + sel.w - 7}
                    y={sel.y + sel.h - 7}
                    width="14"
                    height="14"
                    rx="3"
                    fill="#F7F3EA"
                    stroke="#1A1815"
                    strokeWidth="2"
                    style={{ pointerEvents: "none" }}
                  />
                )}
              </svg>

              {/* editor teks melayang */}
              {edit && editEl && (
                <textarea
                  autoFocus
                  value={edit.value}
                  onChange={(e2) =>
                    setEdit({ ...edit, value: e2.target.value })
                  }
                  onBlur={commitEdit}
                  onKeyDown={(e2) => {
                    if (
                      e2.key === "Enter" &&
                      !e2.shiftKey &&
                      editEl.type === "teks"
                    ) {
                      e2.preventDefault();
                      commitEdit();
                    }
                    if (e2.key === "Escape") setEdit(null);
                  }}
                  className="absolute bg-card p-2 border-2 border-accent rounded-lg outline-none text-sm leading-snug resize-none"
                  style={{
                    left: editEl.type === "kotak" ? editEl.x + 8 : editEl.x - 8,
                    top:
                      editEl.type === "kotak"
                        ? editEl.y + 8
                        : editEl.y - editEl.size - 4,
                    width:
                      editEl.type === "kotak"
                        ? Math.max(120, editEl.w - 16)
                        : 200,
                    height:
                      editEl.type === "kotak"
                        ? Math.max(60, editEl.h - 16)
                        : 60,
                    textAlign: editEl.type === "kotak" ? "center" : "left",
                  }}
                />
              )}
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
