import { formatCurrency } from "../utils/format.js";

export default function ComboCard({ combo }) {
  const { Icon } = combo;

  return (
    <article className={`combo-card ${combo.featured ? "is-featured" : ""}`}>
      {combo.featured ? <span className="floating-label">MAS SOLICITADO</span> : null}
      <Icon className="combo-icon" size={42} />
      <h3>{combo.name}</h3>
      <p>{combo.services}</p>
      <strong>{formatCurrency(combo.price)}</strong>
      <span>{combo.label}</span>
    </article>
  );
}

