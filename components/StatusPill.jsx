export default function StatusPill({ children, tone = "draft" }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}
