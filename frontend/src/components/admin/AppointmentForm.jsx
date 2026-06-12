import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { serviceApi } from "../../services/api.js";
import { todayInputValue } from "../../utils/format.js";

const fallbackServiceOptions = [
  "Corte",
  "Tinte",
  "Peinado",
  "Corte y Peinado",
  "Tinte y Peinado",
  "Corte y Tinte",
  "Corte y Tinte y Peinado"
];

const statusOptions = ["pending", "confirmed", "completed", "cancelled"];

const defaultValues = {
  customerName: "",
  service: "Corte",
  date: todayInputValue(),
  time: "10:00",
  status: "confirmed",
  notes: ""
};

export default function AppointmentForm({ initialValues = null, onSubmit, onCancel }) {
  const [serviceOptions, setServiceOptions] = useState(fallbackServiceOptions);
  const [values, setValues] = useState({
    ...defaultValues,
    ...initialValues
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    serviceApi
      .list()
      .then((response) => {
        const options = response.data.services.map((service) => service.label);
        if (mounted && options.length > 0) {
          setServiceOptions(options);
        }
      })
      .catch(() => {
        // Keep the form available with the known catalog if the API cannot be reached.
      });

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSubmit({
        customerName: values.customerName,
        service: values.service,
        date: values.date,
        time: values.time,
        status: values.status,
        notes: values.notes
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo guardar la cita");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="appointment-form" onSubmit={handleSubmit}>
      <label>
        Cliente
        <input
          type="text"
          value={values.customerName}
          onChange={(event) => updateField("customerName", event.target.value)}
          required
        />
      </label>

      <label>
        Servicio
        <select value={values.service} onChange={(event) => updateField("service", event.target.value)}>
          {serviceOptions.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <label>
          Fecha
          <input type="date" value={values.date} onChange={(event) => updateField("date", event.target.value)} required />
        </label>

        <label>
          Hora
          <input type="time" value={values.time} onChange={(event) => updateField("time", event.target.value)} required />
        </label>
      </div>

      <label>
        Estado
        <select value={values.status} onChange={(event) => updateField("status", event.target.value)}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <label>
        Notas
        <textarea value={values.notes || ""} onChange={(event) => updateField("notes", event.target.value)} rows={4} />
      </label>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          <Save size={18} />
          {saving ? "Guardando..." : "Guardar cita"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={onCancel}>
          <X size={18} />
          Cancelar
        </button>
      </div>
    </form>
  );
}
