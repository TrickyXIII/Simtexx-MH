import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPublic } from "../services/usuariosService";
import "./Login.css"; // Reutilizamos estilos del Login para consistencia

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmarPassword: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación local
    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await registerPublic(form);
      alert("Registro exitoso. Ahora puedes iniciar sesión con tu cuenta.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="div"> {/* Reutiliza la clase contenedora del Login */}
      <h2>Crear Cuenta</h2>
      <p style={{fontSize:'14px', color:'#666', marginTop:'-10px', textAlign:'center'}}>Regístrate como Cliente</p>

      <form onSubmit={handleSubmit} style={{marginTop:'20px'}}>
        <label>Nombre Completo</label>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          placeholder="Ej: Juan Pérez"
          required
        />

        <label>Correo Electrónico</label>
        <input
          type="email"
          name="correo"
          value={form.correo}
          onChange={handleChange}
          placeholder="correo@ejemplo.com"
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="********"
          required
        />

        <label>Confirmar Contraseña</label>
        <input
          type="password"
          name="confirmarPassword"
          value={form.confirmarPassword}
          onChange={handleChange}
          placeholder="********"
          required
        />

        {error && <div style={{color:'red', marginBottom:'15px', textAlign:'center', fontSize:'0.9em'}}>{error}</div>}

        <button type="submit">Registrarse</button>
      </form>
      
      <div style={{marginTop: '25px', textAlign: 'center', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
          ¿Ya tienes una cuenta? <br/>
          <Link to="/login" style={{color: '#007bff', textDecoration: 'none', fontWeight: 'bold'}}>
              Inicia Sesión aquí
          </Link>
      </div>
    </div>
  );
}