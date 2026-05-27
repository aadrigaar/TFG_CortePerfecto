import { BadgeCheck, BarChart3, CalendarDays, Euro, Flag, Hourglass } from "lucide-react";
import { useEffect, useState } from "react";
import { appointmentApi } from "../../services/api.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

const statConfig = [
  ["today", "CITAS HOY", CalendarDays],
  ["pending", "PENDIENTES", Hourglass],
  ["confirmed", "CONFIRMADAS", BadgeCheck],
  ["completed", "COMPLETADAS", Flag],
  ["estimatedRevenue", "INGRESOS EST.", Euro],
  ["total", "TOTAL CITAS", BarChart3]
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const [statsResponse, appointmentsResponse] = await Promise.all([
      appointmentApi.stats(),
      appointmentApi.list({ upcoming: "true" })
    ]);

    setStats(statsResponse.data.summary);
    setAppointments(appointmentsResponse.data.appointments.slice(0, 5));
    setLoading(false);
  }

  if (loading) {
    return <div className="admin-panel empty-state">Cargando dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-title">
        <h2>Dashboard</h2>
        <p>Resumen de actividad de Corte Perfecto</p>
      </div>

      <div className="stats-grid">
        {statConfig.map(([key, label, Icon]) => (
          <article className="stat-card" key={key}>
            <span className="stat-icon">
              <Icon size={25} />
            </span>
            <strong>{key === "estimatedRevenue" ? formatCurrency(stats[key]) : stats[key]}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>

      <section className="admin-section">
        <div className="section-row-title">
          <h3>Proximas citas</h3>
          <a href="/admin/citas">Ver todas</a>
        </div>
        <div className="admin-panel">
          {appointments.length === 0 ? (
            <div className="empty-state">No hay citas proximas</div>
          ) : (
            <div className="appointment-list compact">
              {appointments.map((appointment) => (
                <article className="appointment-item" key={appointment._id}>
                  <div>
                    <strong>{appointment.customerName}</strong>
                    <span>{appointment.service}</span>
                  </div>
                  <div>
                    <strong>{formatDate(appointment.date)}</strong>
                    <span>{appointment.time}</span>
                  </div>
                  <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
