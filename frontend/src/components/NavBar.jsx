import "./Navbar.css";
import { useNavigate, Link } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  // 1. OBTENER DATOS DEL USUARIO
  const userStr = localStorage.getItem("usuarioActual");
  // Si no hay usuario, creamos un objeto vacío para evitar errores
  const usuario = userStr ? JSON.parse(userStr) : {};
  
  // 2. DETECTAR SI ES ADMIN
  // El backend devuelve 'rol_nombre', pero a veces guardamos 'rol'. Revisamos ambos.
  const rolUsuario = usuario.rol || usuario.rol_nombre || ""; 
  const rolNormalizado = rolUsuario.toLowerCase().trim();
  
  // Es admin si el rol es 'admin' o 'administrador'
  const isAdmin = rolNormalizado === 'admin' || rolNormalizado === 'administrador';

  const handleLogout = () => {
    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        {/* LOGO */}
        <img 
          src="/logo.png" 
          alt="Logo" 
          className="logo" 
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        />

        {/* ENLACE INICIO (Siempre visible) */}
        <Link 
          to="/dashboard" 
          className="nav-link" 
          style={{
            marginLeft: '20px', 
            color: 'white', 
            textDecoration: 'none', 
            fontWeight: 'bold'
          }}
        >
          Inicio
        </Link>
        
        {/* ENLACE AUDITORÍA (Solo si es Admin) */}
        {isAdmin && (
          <Link 
            to="/auditoria" 
            className="nav-link" 
            style={{
              marginLeft: '20px', 
              color: '#ffeb3b', // Color amarillo para destacar
              textDecoration: 'none', 
              fontWeight: 'bold', 
              fontSize: '14px',
              border: '1px solid #ffeb3b',
              padding: '5px 10px',
              borderRadius: '5px'
            }}
          >
             🛡️ Auditoría
          </Link>
        )}
      </div>

      <div className="nav-right">
        {/* NOMBRE DEL USUARIO */}
        <span style={{ color: 'white', marginRight: '15px', fontSize: '14px' }}>
            Hola, {usuario.nombre || "Usuario"}
        </span>
        
        {/* BOTÓN SALIR */}
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}