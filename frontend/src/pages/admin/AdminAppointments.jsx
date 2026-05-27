import { CheckCircle2, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import AppointmentForm from "../../components/admin/AppointmentForm.jsx";
import { appointmentApi } from "../../services/api.js";
import { formatCurrency, formatDate } from "../../utils/format.js";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    dateFrom: "",
    dateTo: "",
    sort: "asc"
  });

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  async function loadAppointments() {
    setLoading(true);
    setError("");

    try {
      const response = await appointmentApi.list(filters);
      setAppointments(response.data.appointments);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudieron cargar las citas");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("¿Eliminar esta cita?");
    if (!confirmed) {
      return;
    }

    await appointmentApi.remove(id);
    await loadAppointments();
  }

  async function handleComplete(appointment) {
    await appointmentApi.update(appointment._id, { status: "completed" });
    await loadAppointments();
  }

  async function handleEditSubmit(values) {
    await appointmentApi.update(editing._id, values);
    setEditing(null);
    await loadAppointments();
  }

  return (
    <div className="admin-page">
      <div className="admin-title inline-title">
        <div>
          <h2>Gestion de Citas</h2>
          <p>Consulta, modifica o elimina reservas registradas.</p>
        </div>
        <button className="btn btn-ghost small" type="button" onClick={loadAppointments}>
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <div className="admin-panel filters-panel">
        <label>
          Estado
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
            <option value="all">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </label>
        <label>
          Desde
          <input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
        </label>
        <label>
          Hasta
          <input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} />
        </label>
        <label>
          Orden
          <select value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
            <option value="asc">Dia mas cercano primero</option>
            <option value="desc">Dia mas lejano primero</option>
          </select>
        </label>
      </div>

      <div className="admin-panel">
        {error ? <div className="form-error">{error}</div> : null}
        {loading ? (
          <div className="empty-state">Cargando citas...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">No hay citas registradas</div>
        ) : (
          <div className="appointments-table">
            <div className="table-head">
              <span>Cliente</span>
              <span>Servicio</span>
              <span>Fecha</span>
              <span>Estado</span>
              <span>Importe</span>
              <span>Acciones</span>
            </div>
            {appointments.map((appointment) => (
              <article className="table-row" key={appointment._id}>
                <span>{appointment.customerName}</span>
                <span>{appointment.service}</span>
                <span>
                  {formatDate(appointment.date)} · {appointment.time}
                </span>
                <span className={`status-pill ${appointment.status}`}>{appointment.status}</span>
                <span>{formatCurrency(appointment.price)}</span>
                <span className="row-actions">
                  {appointment.status !== "completed" && appointment.status !== "cancelled" ? (
                    <button className="icon-button success" type="button" aria-label="Marcar completada" onClick={() => handleComplete(appointment)}>
                      <CheckCircle2 size={18} />
                    </button>
                  ) : null}
                  <button className="icon-button" type="button" aria-label="Editar" onClick={() => setEditing(appointment)}>
                    <Pencil size={18} />
                  </button>
                  <button className="icon-button danger" type="button" aria-label="Eliminar" onClick={() => handleDelete(appointment._id)}>
                    <Trash2 size={18} />
                  </button>
                </span>
              </article>
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Editar cita">
            <h3>Editar cita</h3>
            <AppointmentForm initialValues={editing} onCancel={() => setEditing(null)} onSubmit={handleEditSubmit} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
