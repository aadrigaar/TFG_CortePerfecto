import { Clock } from "lucide-react";
import { formatCurrency } from "../utils/format.js";

export default function ServiceCard({ service }) {
  const { Icon } = service;

  return (
    <article className={`service-card ${service.popular ? "is-featured" : ""}`}>
      {service.popular ? <span className="floating-label">POPULAR</span> : null}
      <div className="card-icon">
        <Icon size={32} />
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="card-meta">
        <strong>{formatCurrency(service.price)}</strong>
        <span>
          <Clock size={15} />
          {service.duration} min
        </span>
      </div>
    </article>
  );
}

