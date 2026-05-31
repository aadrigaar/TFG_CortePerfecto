import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate("/admin");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page grid-bg">
      <div className="login-brand">
        <Brand />
        <span>PANEL DE ADMINISTRACION</span>
      </div>

      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Iniciar Sesion</h1>
        <p>Accede al panel de gestion de tu peluqueria</p>

        <label>
          Usuario
          <span className="input-shell">
            <User size={20} />
            <input
              autoFocus
              type="text"
              placeholder="Introduce tu usuario"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            />
          </span>
        </label>

        <label>
          Contrasena
          <span className="input-shell">
            <Lock size={20} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Introduce tu contrasena"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <button
              className="inline-icon"
              type="button"
              aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        {error ? <div className="form-error">{error}</div> : null}

        <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
          <LogIn size={19} />
          {loading ? "Accediendo..." : "Acceder al panel"}
        </button>

        <Link className="back-link" to="/">
          Volver a la web
        </Link>
      </form>

      <footer>© 2026 Corte Perfecto · Santander</footer>
    </main>
  );
}
