export function GridBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 bg-background"
    >
      <div className="grid-lines animate-grid-breathe absolute inset-0 opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/70" />
    </div>
  );
}
