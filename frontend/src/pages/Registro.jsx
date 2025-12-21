import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPublic } from "../services/usuariosService";
import "./Login.css"; // Usa los mismos estilos que Login

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", correo: "", password: "", confirmarPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // Validación contraseña robusta
    const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passRegex.test(form.password)) {
        setError("La contraseña no cumple con los requisitos de seguridad.");
        return;
    }
    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      await registerPublic(form);
      alert("Registro exitoso.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Crear Cuenta</h2>
        <p className="login-subtitle">Registro de Clientes</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label>Nombre Completo</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" required maxLength={50} />
          </div>
          
          <div>
            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
            <small style={{display:'block', color:'#666', fontSize:'0.8rem', marginTop:'5px'}}>
                Mínimo 8 caracteres, 1 Mayúscula, 1 minúscula, 1 número.
            </small>
          </div>
          
          <div>
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmarPassword" value={form.confirmarPassword} onChange={handleChange} required />
          </div>
          
          {error && <div className="error-msg">{error}</div>}
          
          <button type="submit" className="btn-login">Registrarse</button>
        </form>
        
        <div className="login-footer">
          <Link to="/login" className="login-link">Volver al Inicio de Sesión</Link>
        </div>
      </div>
    </div>
  );
}