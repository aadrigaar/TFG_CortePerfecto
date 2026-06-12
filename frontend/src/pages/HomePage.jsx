import { CalendarCheck, ChevronRight, MapPin, Phone, Scissors, Star } from "lucide-react";
import { useEffect, useState } from "react";
import ChatWidget from "../components/ChatWidget.jsx";
import ComboCard from "../components/ComboCard.jsx";
import SectionBadge from "../components/SectionBadge.jsx";
import ServiceCard from "../components/ServiceCard.jsx";
import SiteHeader from "../components/SiteHeader.jsx";
import Brand from "../components/Brand.jsx";
import {
  combos as fallbackCombos,
  contact,
  features,
  mergeServiceCatalog,
  services as fallbackServices,
  testimonials
} from "../data/siteData.js";
import { serviceApi } from "../services/api.js";
import { formatCurrency } from "../utils/format.js";

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [catalog, setCatalog] = useState({
    services: fallbackServices,
    combos: fallbackCombos
  });
  const { services, combos } = catalog;

  useEffect(() => {
    let mounted = true;

    serviceApi
      .list()
      .then((response) => {
        if (mounted) {
          setCatalog(mergeServiceCatalog(response.data.services));
        }
      })
      .catch(() => {
        // The static presentation data keeps the public page usable if the API is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="public-shell">
      <SiteHeader onReserve={() => setChatOpen(true)} />

      <main>
        <section id="inicio" className="hero-section grid-bg">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                SANTANDER · DESDE 2018
                <span />
              </div>
              <h1>
                Tu estilo, <span>perfectamente</span> definido
              </h1>
              <p>
                La peluqueria premium de Santander donde cada corte es una obra de arte. Reserva con nuestro
                asistente IA en segundos.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" type="button" onClick={() => setChatOpen(true)}>
                  <CalendarCheck size={19} />
                  Reservar con IA
                </button>
                <a className="btn btn-ghost" href="#servicios">
                  Ver servicios
                  <ChevronRight size={18} />
                </a>
              </div>
              <div className="hero-stats" aria-label="Indicadores de Corte Perfecto">
                <div>
                  <strong>+2K</strong>
                  <span>CLIENTES FELICES</span>
                </div>
                <div>
                  <strong>8 anos</strong>
                  <span>DE EXPERIENCIA</span>
                </div>
                <div>
                  <strong>
                    4.9 <Star size={28} fill="currentColor" />
                  </strong>
                  <span>VALORACION MEDIA</span>
                </div>
              </div>
            </div>

            <div className="hero-showcase" aria-label="Resumen de servicios">
              <div className="showcase-icon">
                <Scissors size={36} />
              </div>
              <h2>Nuestros servicios</h2>
              <p>Calidad premium, precio justo</p>
              {services.map((service) => {
                const Icon = service.Icon;
                return (
                  <div className="mini-service" key={service.name}>
                    <span>
                      <Icon size={20} />
                      {service.name === "Corte" ? "Corte de cabello" : service.name === "Tinte" ? "Tinte profesional" : "Peinado especial"}
                    </span>
                    <strong>{formatCurrency(service.price)}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="servicios" className="section">
          <div className="container section-heading centered">
            <SectionBadge icon="✂">SERVICIOS</SectionBadge>
            <h2>
              Todo lo que <span>necesitas</span>
            </h2>
            <p>Tres servicios, una calidad excepcional. Disenados para que salgas sintiendote perfecto.</p>
          </div>
          <div className="container service-grid">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </section>

        <section id="combos" className="section section-tight">
          <div className="container section-heading centered">
            <SectionBadge icon="◆">COMBINACIONES</SectionBadge>
            <h2>
              Packs <span>especiales</span>
            </h2>
            <p>Combina servicios y disfruta de la experiencia completa Corte Perfecto.</p>
          </div>
          <div className="container combo-grid">
            {combos.map((combo) => (
              <ComboCard key={combo.name} combo={combo} />
            ))}
          </div>
        </section>

        <section id="nosotros" className="section about-section">
          <div className="container about-grid">
            <div>
              <SectionBadge icon="•">NOSOTROS</SectionBadge>
              <h2>
                Mas que una peluqueria, <span>una experiencia</span>
              </h2>
              <p>
                En Corte Perfecto llevamos mas de 8 anos ofreciendo los mejores servicios capilares en el corazon
                de Santander. Nuestro equipo de estilistas profesionales se mantiene actualizado con las ultimas
                tendencias del sector.
              </p>
              <p>
                Ahora, incorporamos inteligencia artificial local para que reservar tu cita sea tan sencillo como
                tener una conversacion. Sin formularios, sin esperas, sin complicaciones.
              </p>
              <div className="feature-list">
                {features.map(({ Icon, title, text }) => (
                  <div className="feature-row" key={title}>
                    <Icon size={24} />
                    <span>
                      <strong>{title}</strong> — {text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="location-panel">
              <MapPin size={54} fill="currentColor" />
              <h3>{contact.location}</h3>
              <p>{contact.address}</p>
              <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                <Phone size={18} />
                {contact.phone}
              </a>
            </div>
          </div>
        </section>

        <section id="opiniones" className="section">
          <div className="container section-heading centered">
            <SectionBadge icon="★">OPINIONES</SectionBadge>
            <h2>
              Lo que dicen nuestros <span>clientes</span>
            </h2>
            <p>Mas de 2.000 clientes satisfechos avalan nuestra calidad y profesionalidad.</p>
          </div>
          <div className="container testimonial-grid">
            {testimonials.map((testimonial) => (
              <article className="testimonial-card" key={testimonial.name}>
                <div className="stars">★★★★★</div>
                <blockquote>"{testimonial.quote}"</blockquote>
                <footer>
                  <div className="avatar">{testimonial.name.slice(0, 1)}</div>
                  <div>
                    <strong>{testimonial.name}</strong>
                    <span>{testimonial.service}</span>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer id="contacto" className="site-footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p>La peluqueria premium de Santander. Calidad, estilo y tecnologia al servicio de tu imagen.</p>
          </div>
          <div>
            <h3>NAVEGACION</h3>
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="/admin/login">Admin</a>
          </div>
          <div>
            <h3>SERVICIOS</h3>
            <span>Corte · 20€</span>
            <span>Tinte · 40€</span>
            <span>Peinado · 15€</span>
          </div>
          <div>
            <h3>CONTACTO</h3>
            <span>{contact.address}</span>
            <span>{contact.phone}</span>
            <span>{contact.schedule}</span>
          </div>
        </div>
        <div className="container copyright">© 2026 Corte Perfecto · Santander</div>
      </footer>

      <ChatWidget forcedOpen={chatOpen} onCloseRequest={() => setChatOpen(false)} />
    </div>
  );
}
