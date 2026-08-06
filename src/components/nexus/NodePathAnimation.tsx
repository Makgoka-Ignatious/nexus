interface NodePathAnimationProps {
  label?: string;
}

const NODES = [
  { x: 24, y: 76 },
  { x: 96, y: 40 },
  { x: 168, y: 88 },
  { x: 240, y: 36 },
  { x: 312, y: 70 },
];

/**
 * "Data flowing through the Nexus grid": glowing nodes joined by thin lines
 * that draw a mini transit route, then fade out into the result.
 */
export function NodePathAnimation({ label = "Routing through the grid" }: NodePathAnimationProps) {
  const path = NODES.map((n, i) => `${i === 0 ? "M" : "L"}${n.x} ${n.y}`).join(" ");

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 py-10"
    >
      <svg
        viewBox="0 0 336 120"
        className="h-28 w-full max-w-[336px]"
        aria-hidden="true"
      >
        <path
          d={path}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="220"
          className="animate-path-draw"
          opacity="0.7"
        />
        {NODES.map((node, i) => (
          <g key={i} style={{ animationDelay: `${i * 160}ms` }} className="animate-node-pop">
            <circle cx={node.x} cy={node.y} r="9" fill="var(--primary)" opacity="0.14" />
            <circle cx={node.x} cy={node.y} r="4" fill="var(--primary)" />
          </g>
        ))}
        <circle cx={NODES.at(-1)?.x ?? 0} cy={NODES.at(-1)?.y ?? 0} r="5" fill="var(--signal)" />
      </svg>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="animate-dash-spin inline-block size-4 rounded-full border border-dashed border-primary" />
        {label}
      </div>
    </div>
  );
}
