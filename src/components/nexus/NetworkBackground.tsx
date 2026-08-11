import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Pulse = { x: number; y: number; r: number };

const LINK_DIST = 150;
const CURSOR_DIST = 190;

function readColor(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

/**
 * Nexus backdrop: a slow drifting network of nodes that link up when close,
 * brightens near the cursor and emits a signal pulse on click.
 */
export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const pulses: Pulse[] = [];
    const pointer = { x: -9999, y: -9999 };
    let raf = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = width < 640 ? 22000 : 15000;
      const count = Math.max(18, Math.min(110, Math.round((width * height) / density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1 + Math.random() * 1.6,
      }));
    };

    const draw = () => {
      const root = document.documentElement;
      const fg = readColor(root, "--foreground", "#0f172a");
      const primary = readColor(root, "--primary", "#2563eb");
      const signal = readColor(root, "--signal", "#10b981");

      ctx.clearRect(0, 0, width, height);

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = width + 20;
          if (n.x > width + 20) n.x = -20;
          if (n.y < -20) n.y = height + 20;
          if (n.y > height + 20) n.y = -20;
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]!;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d > LINK_DIST) continue;
          const closeness = 1 - d / LINK_DIST;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const pd = Math.hypot(mx - pointer.x, my - pointer.y);
          const hot = pd < CURSOR_DIST ? 1 - pd / CURSOR_DIST : 0;
          ctx.strokeStyle = hot > 0.02 ? primary : fg;
          ctx.globalAlpha = closeness * (0.1 + hot * 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // pulses
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]!;
        p.r += 7;
        if (p.r > Math.max(width, height)) {
          pulses.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = signal;
        ctx.globalAlpha = Math.max(0, 0.35 * (1 - p.r / 520));
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // nodes
      for (const n of nodes) {
        const pd = Math.hypot(n.x - pointer.x, n.y - pointer.y);
        const hot = pd < CURSOR_DIST ? 1 - pd / CURSOR_DIST : 0;
        let lit = 0;
        for (const p of pulses) {
          const d = Math.abs(Math.hypot(n.x - p.x, n.y - p.y) - p.r);
          if (d < 40) lit = Math.max(lit, 1 - d / 40);
        }
        ctx.fillStyle = lit > 0.05 ? signal : hot > 0.05 ? primary : fg;
        ctx.globalAlpha = 0.28 + hot * 0.5 + lit * 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + hot * 1.2 + lit * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const addPulse = (x: number, y: number) => {
      if (reduced) return;
      pulses.push({ x, y, r: 0 });
      if (pulses.length > 6) pulses.shift();
    };
    const onDown = (e: PointerEvent) => addPulse(e.clientX, e.clientY);
    const onClick = (e: MouseEvent) => addPulse(e.clientX, e.clientY);

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    window.addEventListener("mousedown", onClick, { capture: true, passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, { capture: true });
      window.removeEventListener("mousedown", onClick, { capture: true });
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-background">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
