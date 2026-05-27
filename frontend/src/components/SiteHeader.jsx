import { CalendarCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import Brand from "./Brand.jsx";

const navItems = [
  ["Inicio", "#inicio"],
  ["Servicios", "#servicios"],
  ["Combos", "#combos"],
  ["Nosotros", "#nosotros"],
  ["Opiniones", "#opiniones"],
  ["Contacto", "#contacto"]
];

export default function SiteHeader({ onReserve }) {
  const [open, setOpen] = useState(false);

  function handleNavClick() {
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#inicio" className="brand-link" onClick={handleNavClick}>
          <Brand />
        </a>

        <nav className={`site-nav ${open ? "is-open" : ""}`} aria-label="Navegacion principal">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={handleNavClick}>
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button className="btn btn-primary header-cta" type="button" onClick={onReserve}>
            <CalendarCheck size={18} />
            Reservar cita
          </button>
          <button
            className="icon-button mobile-menu"
            type="button"
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

