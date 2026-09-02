import { useRef } from "react";

export default function Minimap({ pct, onSeek }) {
  const ref = useRef(null);
  const seek = (e) => {
    const r = ref.current.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)));
  };
  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        seek(e);
        const mv = (ev) => seek(ev);
        const up = () => {
          window.removeEventListener("pointermove", mv);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", mv);
        window.addEventListener("pointerup", up);
      }}
      className="hidden md:block top-1/2 right-2 z-30 fixed bg-line/60 rounded-full w-2.5 h-[55vh] -translate-y-1/2 cursor-pointer">
      <div
        className="top-0 right-0 left-0 absolute bg-accent/70 rounded-full"
        style={{ height: `${pct * 100}%` }}
      />
    </div>
  );
}
