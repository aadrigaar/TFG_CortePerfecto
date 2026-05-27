import { useNavigate } from "react-router-dom";
import AppointmentForm from "../../components/admin/AppointmentForm.jsx";
import { appointmentApi } from "../../services/api.js";

export default function AdminCreateAppointment() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    await appointmentApi.create(values);
    navigate("/admin/citas");
  }

  return (
    <div className="admin-page">
      <div className="admin-title">
        <h2>Crear Cita</h2>
        <p>Registra manualmente una reserva para un cliente.</p>
      </div>
      <div className="admin-panel form-panel">
        <AppointmentForm onSubmit={handleSubmit} onCancel={() => navigate("/admin")} />
      </div>
    </div>
  );
}

