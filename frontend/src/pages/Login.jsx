import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; 
import Footer from "../components/Footer";
import "./Login.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState(""); 

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch(`${BASE_URL}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo,
          password: password, 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Correo o contraseña incorrectos");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.removeItem("usuarioActual");
      navigate(`/dashboard`);

    } catch (error) {
      console.error(error);
      alert("Error de conexión. Verifica que el servidor esté encendido.");
    }
  }

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Iniciar Sesión</h2>
          
          <form onSubmit={handleLogin} className="login-form">
            <div>
                <label>Email</label>
                <input type="email" placeholder="usuario@simtexx.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>

            <div>
                <label>Contraseña</label>
                <input type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn-login">Ingresar</button>
          </form>

          <div className="login-footer">
            ¿Nuevo en Simtexx? <br/>
            <Link to="/registro" className="login-link">
                Crear una cuenta
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}