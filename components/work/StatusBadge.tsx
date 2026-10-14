// Project status as a small glowing capsule: green for Live, amber for
// testing, blue for in progress (colours and ring in globals.css, .status).
export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className="status" data-status={status}>
      <span className="status-glow" aria-hidden="true" />
      {status === 'Live' && <span className="status-dot" aria-hidden="true" />}
      {status}
    </span>
  );
}
