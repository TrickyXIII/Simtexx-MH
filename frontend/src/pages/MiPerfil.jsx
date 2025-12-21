import { useState, useEffect } from "react";
import { updateProfile } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import "./Formularios.css"; // CSS compartido

export default function MiPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombre: "", correo: "", rol: "" });
  const [passwords, setPasswords] = useState({ passwordActual: "", password: "", confirmarPassword: "" });

  useEffect(() => {
    const storedUser = getUserFromToken() || {};
    setUsuario({ nombre: storedUser.nombre || "", correo: storedUser.correo || "", rol: storedUser.rol || "Usuario" });
  }, []);

  const handleChange = (e) => setUsuario({ ...usuario, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ nombre: usuario.nombre, correo: usuario.correo, ...(passwords.password ? passwords : {}) });
      alert("Perfil actualizado. Inicia sesión nuevamente.");
      localStorage.removeItem("token");
      navigate("/");
    } catch (error) { alert("Error: " + error.message); }
  };

  return (
    <>
      <NavBar />
      <div className="form-container-page">
        <h2 className="form-titulo">Mi Perfil</h2>
        
        <form onSubmit={handleSubmit} className="form-card">
          <div style={{textAlign: 'center', marginBottom: '10px', color: '#666', background:'#f9f9f9', padding:'10px', borderRadius:'4px'}}>
            Rol actual: <strong>{usuario.rol}</strong>
          </div>

          <div><label>Nombre</label><input name="nombre" value={usuario.nombre} onChange={handleChange} required /></div>
          <div><label>Correo</label><input type="email" name="correo" value={usuario.correo} onChange={handleChange} required /></div>

          <hr style={{width: '100%', border: '0', borderTop: '1px solid #eee', margin: '15px 0'}} />
          <p style={{margin: 0, fontSize: '14px', color: 'rgb(172, 5, 5)', fontWeight:'bold'}}>Cambiar Contraseña (Opcional)</p>

          <div><label>Contraseña Actual</label><input type="password" name="passwordActual" value={passwords.passwordActual} onChange={handlePassChange} /></div>
          <div><label>Nueva Contraseña</label><input type="password" name="password" value={passwords.password} onChange={handlePassChange} /></div>
          <div><label>Confirmar Nueva</label><input type="password" name="confirmarPassword" value={passwords.confirmarPassword} onChange={handlePassChange} /></div>

          <button type="submit" className="btn-submit" style={{background:'#2c3e50'}}>Actualizar Datos</button>
          <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">Cancelar</button>
        </form>
      </div>
      <Footer />
    </>
  );
}