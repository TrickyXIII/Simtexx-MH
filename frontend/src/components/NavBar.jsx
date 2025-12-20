import "./Navbar.css";
import { useNavigate, Link } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  // Obtener datos del usuario para mostrar opciones según rol
  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { rol: "Invitado" };
  const rolNormalizado = (usuario.rol || "").toLowerCase().trim();
  const isAdmin = rolNormalizado === 'admin' || rolNormalizado === 'administrador';

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="logo" 
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />
        {/* Enlaces rápidos en el menú */}
        <Link to="/dashboard" className="nav-link" style={{marginLeft: '20px', color: 'white', textDecoration: 'none', fontWeight: 'bold'}}>Inicio</Link>
        
        {isAdmin && (
          <Link to="/auditoria" className="nav-link" style={{marginLeft: '20px', color: '#ffeb3b', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px'}}>
             🛡️ Auditoría
          </Link>
        )}
      </div>

      <div className="nav-right">
        <span style={{ color: 'white', marginRight: '15px', fontSize: '14px' }}>
            Hola, {usuario.nombre || "Usuario"}
        </span>
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}