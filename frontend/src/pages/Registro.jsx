import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPublic } from "../services/usuariosService";
import "./Login.css"; 

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
    <div className="div">
      <h2>Crear Cuenta</h2>
      <p style={{fontSize:'14px', color:'#666', marginTop:'-10px', textAlign:'center'}}>Cliente</p>
      <form onSubmit={handleSubmit} style={{marginTop:'20px'}}>
        <label>Nombre</label>
        <input type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez" required maxLength={50} title="Máximo 50 caracteres" />
        <label>Correo</label>
        <input type="email" name="correo" value={form.correo} onChange={handleChange} required />
        <label>Contraseña</label>
        <div title="Mínimo 8 caracteres, 1 Mayúscula, 1 minúscula, 1 número.">
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
            <small style={{display:'block', color:'#666', fontSize:'10px'}}>Mín. 8 caracteres, 1 Mayús, 1 num.</small>
        </div>
        <label>Confirmar</label>
        <input type="password" name="confirmarPassword" value={form.confirmarPassword} onChange={handleChange} required />
        {error && <div style={{color:'red', fontSize:'0.9em', marginTop:'10px'}}>{error}</div>}
        <button type="submit" style={{marginTop:'20px'}}>Registrarse</button>
      </form>
      <div style={{marginTop: '25px', textAlign: 'center', fontSize: '14px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
          <Link to="/login" style={{color: '#007bff'}}>Inicia Sesión aquí</Link>
      </div>
    </div>
  );
}