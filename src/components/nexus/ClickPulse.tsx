import { useEffect, useRef } from "react";

type Ring = { x: number; y: number; r: number };

function readColor(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Top-layer click ripple. Sits above the app content (pointer-events none) so
 * the pulse is visible even when clicking on opaque panels and cards.
 */
export function ClickPulse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    const rings: Ring[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const MAX_R = 220;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const signal = readColor(document.documentElement, "--signal", "#10b981");

      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i]!;
        ring.r += 6;
        if (ring.r > MAX_R) {
          rings.splice(i, 1);
          continue;
        }
        const t = ring.r / MAX_R;
        ctx.strokeStyle = signal;
        ctx.globalAlpha = Math.max(0, 0.55 * (1 - t));
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = signal;
        ctx.globalAlpha = Math.max(0, 0.12 * (1 - t));
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    let lastAt = 0;
    const add = (x: number, y: number) => {
      if (reduced) return;
      const now = performance.now();
      if (now - lastAt < 120) return;
      lastAt = now;
      rings.push({ x, y, r: 0 });
      if (rings.length > 6) rings.shift();
    };

    const onPointerDown = (e: PointerEvent) => add(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => add(e.clientX, e.clientY);

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
    window.addEventListener("mousedown", onMouseDown, { capture: true, passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("mousedown", onMouseDown, { capture: true });
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}
