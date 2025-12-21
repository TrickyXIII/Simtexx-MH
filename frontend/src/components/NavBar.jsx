import "./Navbar.css";
import { useNavigate, Link } from "react-router-dom";
import { getUserFromToken } from "../utils/auth"; // Seguridad

export default function NavBar() {
  const navigate = useNavigate();
  // 1. OBTENER DATOS SEGUROS DEL TOKEN
  const usuario = getUserFromToken() || { nombre: "Invitado", rol: "" };
  // 2. DETECTAR SI ES ADMIN REAL
  const isAdmin = usuario.rol_id === 1;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.png" alt="Logo" className="logo" onClick={() => navigate("/dashboard")} />
        <Link to="/dashboard" className="nav-link">Inicio</Link>
        {isAdmin && <Link to="/auditoria" className="nav-link nav-link-audit">🛡️ Auditoría</Link>}
      </div>

      <div className="nav-right">
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '15px'}}>
            <span className="user-name">Hola, {usuario.nombre || "Usuario"}</span>
            <Link to="/mi-perfil" style={{fontSize: '12px', color: '#007bff', textDecoration: 'none'}}>Editar mi perfil</Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
      </div>
    </nav>
  );
}