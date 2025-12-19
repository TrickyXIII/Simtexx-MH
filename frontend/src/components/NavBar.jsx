import "./NavBar.css";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("usuarioLogueado");
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
      </div>

      <div className="nav-right">
        <button className="btn-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}