import "./Navbar.css";
import { useNavigate, Link } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  // 1. OBTENER DATOS DEL USUARIO
  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : {};
  
  // 2. DETECTAR SI ES ADMIN
  const rolUsuario = usuario.rol || usuario.rol_nombre || ""; 
  const rolNormalizado = rolUsuario.toLowerCase().trim();
  const isAdmin = rolNormalizado === 'admin' || rolNormalizado === 'administrador';

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* SECCIÓN IZQUIERDA: Logo + Menú */}
      <div className="nav-left">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="logo" 
          onClick={() => navigate("/dashboard")}
        />

        {/* Enlace Inicio */}
        <Link to="/dashboard" className="nav-link">
          Inicio
        </Link>
        
        {/* Enlace Auditoría (Solo Admin) */}
        {isAdmin && (
          <Link to="/auditoria" className="nav-link nav-link-audit">
             🛡️ Auditoría
          </Link>
        )}
      </div>

      {/* SECCIÓN DERECHA: Usuario + Salir */}
      <div className="nav-right">
        <span className="user-name">
            Hola, {usuario.nombre || "Usuario"}
        </span>
        
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}