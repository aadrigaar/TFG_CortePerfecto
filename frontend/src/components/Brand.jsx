import { Scissors } from "lucide-react";

export default function Brand({ admin = false }) {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        <Scissors size={22} strokeWidth={2.4} />
      </div>
      <div>
        <span className="brand-name">
          Corte <strong>Perfecto</strong>
        </span>
        {admin ? <span className="brand-subtitle">ADMINISTRACION</span> : null}
      </div>
    </div>
  );
}

