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

      // --- SEGURIDAD: Solo guardamos el token ---
      localStorage.setItem("token", data.token);
      
      // Limpiamos datos inseguros antiguos si existen
      localStorage.removeItem("usuarioActual");
      
      navigate(`/dashboard`);

    } catch (error) {
      console.error(error);
      alert("Error de conexión. Verifica que el servidor esté encendido.");
    }
  }

  return (
    <>
      <div className="div">
        <h2>Iniciar Sesión</h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" placeholder="admin@simtexx.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

          <label>Contraseña</label>
          <input type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Iniciar Sesion</button>
        </form>

        <div style={{marginTop: '25px', textAlign: 'center', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
            ¿Nuevo en Simtexx? <br/>
            <Link to="/registro" style={{color: '#007bff', textDecoration: 'none', fontWeight: 'bold'}}>
                Crear una cuenta
            </Link>
        </div>

      </div>
      <Footer />
    </>
  );
}