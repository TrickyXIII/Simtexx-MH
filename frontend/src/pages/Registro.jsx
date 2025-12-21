import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerPublic } from "../services/usuariosService";
import "./Login.css"; 

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

    // Validaciones frontend explícitas
    // Min 8 caracteres, 1 mayus, 1 minus, 1 numero
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
      alert("Registro exitoso. Ahora puedes iniciar sesión con tu cuenta.");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="div">
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
          maxLength={50} // Limite de texto
          title="Máximo 50 caracteres"
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
        <div title="Debe contener al menos 8 caracteres, una mayúscula, una minúscula y un número.">
            <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
            />
            <small style={{display:'block', color:'#666', fontSize:'11px', marginTop:'2px', lineHeight:'1.2'}}>
                Requisito: Mín. 8 caracteres, 1 Mayúscula, 1 minúscula, 1 número.
            </small>
        </div>

        <label style={{marginTop:'10px'}}>Confirmar Contraseña</label>
        <input
          type="password"
          name="confirmarPassword"
          value={form.confirmarPassword}
          onChange={handleChange}
          placeholder="********"
          required
        />

        {error && <div style={{color:'red', marginBottom:'15px', textAlign:'center', fontSize:'0.9em', background:'#ffe6e6', padding:'5px', borderRadius:'4px', marginTop:'10px'}}>{error}</div>}

        <button type="submit" style={{marginTop:'20px'}}>Registrarse</button>
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