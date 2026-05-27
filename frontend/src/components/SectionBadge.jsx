export default function SectionBadge({ icon, children }) {
  return (
    <span className="section-badge">
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}

