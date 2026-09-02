import { useEffect, useRef } from "react";

export default function PopoverKata({ data, onClose, onHighlight }) {
  const ref = useRef(null);
  useEffect(() => {
    const f = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("pointerdown", f);
    return () => document.removeEventListener("pointerdown", f);
  }, [onClose]);
  if (!data) return null;
  const top = Math.max(
    12,
    Math.min(data.rect.bottom + 8, window.innerHeight - 190),
  );
  const left = Math.max(12, Math.min(data.rect.left, window.innerWidth - 300));
  return (
    <div
      ref={ref}
      className="z-50 fixed shadow-2xl p-4 w-72 card fadein"
      style={{ top, left }}>
      <p className="font-display font-semibold text-lg">{data.word}</p>
      {data.name ? (
        <p className="mt-1 text-ink2 text-sm">
          Tokoh — disebut <b className="text-ink">{data.count}×</b> di bab ini.
        </p>
      ) : data.arti ? (
        <p className="mt-1 text-ink2 text-sm">{data.arti}</p>
      ) : (
        <p className="mt-1 text-ink2 text-sm italic">Belum ada di glosarium.</p>
      )}
      {data.para && (
        <button
          onClick={onHighlight}
          className="mt-3 !py-2 w-full text-[13px] btn btn-o">
          ★ Highlight paragraf ini
        </button>
      )}
    </div>
  );
}
