import { useState, useEffect } from "react";
import { updateProfile } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth";
import "./Formularios.css"; 

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
          <div style={{textAlign: 'center', marginBottom: '15px', color: '#333', background:'#e0e0e0', padding:'10px', borderRadius:'4px', fontWeight:'bold'}}>
            ROL: {usuario.rol}
          </div>

          <div>
            <label>Nombre Completo</label>
            <input name="nombre" value={usuario.nombre} onChange={handleChange} required />
          </div>
          
          <div>
            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={usuario.correo} onChange={handleChange} required />
          </div>

          <hr style={{width: '100%', border: '0', borderTop: '2px solid #eee', margin: '25px 0'}} />
          
          <h4 style={{margin: '0 0 15px 0', color: 'rgb(172, 5, 5)', textTransform:'uppercase', textAlign:'center'}}>
            Cambio de Contraseña
          </h4>

          <div>
            <label>Contraseña Actual</label>
            <input type="password" name="passwordActual" value={passwords.passwordActual} onChange={handlePassChange} placeholder="Requerido para guardar cambios" />
          </div>
          
          <div>
            <label>Nueva Contraseña</label>
            <input type="password" name="password" value={passwords.password} onChange={handlePassChange} />
            <small className="form-help">
                Requisitos: Mínimo 8 caracteres, 1 Mayúscula, 1 minúscula, 1 número.
            </small>
          </div>
          
          <div>
            <label>Confirmar Nueva Contraseña</label>
            <input type="password" name="confirmarPassword" value={passwords.confirmarPassword} onChange={handlePassChange} />
          </div>

          <button type="submit" className="btn-submit" style={{background: '#333'}}>Actualizar Perfil</button>
          <button type="button" onClick={() => navigate("/dashboard")} className="btn-secondary">Cancelar</button>
        </form>
      </div>
      <Footer />
    </>
  );
}