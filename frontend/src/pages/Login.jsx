// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/usuariosService"; // Asegúrate de haber hecho el Paso 1
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // 1. Llamamos al backend
      const data = await login(form);
      
      // 2. Guardamos el token recibido
      localStorage.setItem("token", data.token);
      
      // 3. Redirigimos al dashboard
      navigate("/dashboard");
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Simtexx</h2>
        <p className="login-subtitle">Ingeniería y Servicios</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              name="correo" 
              value={form.correo} 
              onChange={handleChange} 
              required 
              placeholder="usuario@simtexx.com"
            />
          </div>
          
          <div>
            <label>Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <button type="submit" className="btn-login">Ingresar</button>
        </form>
        
        <div className="login-footer">
          <Link to="/registro" className="login-link">¿No tienes cuenta? Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
}