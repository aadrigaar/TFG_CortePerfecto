import { CalendarPlus, ClipboardList, LayoutDashboard, LogOut, RefreshCw } from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const routeHeader = {
  "/admin": { title: "Dashboard", Icon: LayoutDashboard },
  "/admin/citas": { title: "Gestión de Citas", Icon: ClipboardList },
  "/admin/crear": { title: "Crear Cita", Icon: CalendarPlus }
};

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const header = routeHeader[location.pathname] || routeHeader["/admin"];
  const HeaderIcon = header.Icon;

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand admin />
        <nav className="admin-nav" aria-label="Panel de administracion">
          <NavLink to="/admin" end>
            <LayoutDashboard size={22} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/citas">
            <ClipboardList size={22} />
            Gestion de Citas
          </NavLink>
          <NavLink to="/admin/crear">
            <CalendarPlus size={22} />
            Crear Cita
          </NavLink>
        </nav>
        <div className="admin-user">
          <span>Admin</span>
          <small>{admin?.username}</small>
          <button className="danger-button" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <h1>
            <HeaderIcon size={25} />
            {header.title}
          </h1>
          <button className="btn btn-ghost small" type="button" onClick={() => window.location.reload()}>
            <RefreshCw size={17} />
            Actualizar
          </button>
        </header>
        <Outlet />
      </section>
    </div>
  );
}
