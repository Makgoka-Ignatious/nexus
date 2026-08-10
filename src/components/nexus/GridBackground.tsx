import { useEffect, useRef } from "react";

/**
 * Urban Grid backdrop: a breathing 20px grid plus a cursor-reactive
 * "signal" halo that brightens the grid lines around the pointer.
 */
export function GridBackground() {
  const glowRef = useRef<HTMLDivElement>(null);
  const rippleHostRef = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null);
  const target = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const apply = () => {
      frame.current = null;
      const el = glowRef.current;
      if (!el) return;
      el.style.setProperty("--mx", `${target.current.x}px`);
      el.style.setProperty("--my", `${target.current.y}px`);
    };

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      glowRef.current?.style.setProperty("opacity", "1");
      if (frame.current === null) frame.current = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      glowRef.current?.style.setProperty("opacity", "0");
    };

    const onDown = (e: PointerEvent) => {
      const host = rippleHostRef.current;
      if (!host) return;
      const ring = document.createElement("span");
      ring.className = "grid-ripple";
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      host.appendChild(ring);
      window.setTimeout(() => ring.remove(), 700);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-background">
      <div className="grid-lines animate-grid-breathe absolute inset-0" />

      {/* Cursor-reactive grid halo */}
      <div
        ref={glowRef}
        className="grid-halo absolute inset-0 opacity-0 transition-opacity duration-500"
      />

      {/* Click ripples */}
      <div ref={rippleHostRef} className="absolute inset-0 overflow-hidden" />
    </div>
  );
}
