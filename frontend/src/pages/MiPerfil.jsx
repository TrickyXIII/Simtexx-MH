import { useState, useEffect } from "react";
import { updateProfile } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { getUserFromToken } from "../utils/auth"; // Importamos

export default function MiPerfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({
    nombre: "", correo: "", rol: ""
  });
  
  const [passwords, setPasswords] = useState({
    passwordActual: "", password: "", confirmarPassword: ""
  });

  useEffect(() => {
    // Usamos el token para prellenar datos seguros
    const storedUser = getUserFromToken() || {};
    setUsuario({
      nombre: storedUser.nombre || "",
      correo: storedUser.correo || "", // El correo no viene en todos los tokens a veces, pero si en login
      rol: storedUser.rol || "Usuario"
    });
    // Nota: Es posible que necesites un endpoint 'getProfile' si el token no tiene el correo actualizado
    // pero por ahora funcionará con lo que hay.
  }, []);

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handlePassChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        nombre: usuario.nombre,
        correo: usuario.correo,
        ...(passwords.password ? passwords : {}) 
      };

      await updateProfile(dataToSend);
      
      alert("Perfil actualizado correctamente. Por favor vuelve a iniciar sesión.");
      
      localStorage.removeItem("token");
      navigate("/");

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <>
      <NavBar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', minHeight: 'calc(100vh - 140px)' }}>
        <h2 style={{ color: "#333" }}>Mi Perfil</h2>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", width: "350px", gap: "15px", background: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}>
          
          <div style={{textAlign: 'center', marginBottom: '10px', color: '#666'}}>
            Rol actual: <strong>{usuario.rol}</strong>
          </div>

          <label style={{fontWeight: 'bold'}}>Nombre Completo</label>
          <input name="nombre" value={usuario.nombre} onChange={handleChange} required style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />

          <label style={{fontWeight: 'bold'}}>Correo Electrónico</label>
          <input type="email" name="correo" value={usuario.correo} onChange={handleChange} required style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />

          <hr style={{width: '100%', border: '0', borderTop: '1px solid #eee', margin: '10px 0'}} />
          <p style={{margin: 0, fontSize: '14px', color: '#888'}}>Cambio de Contraseña (Opcional)</p>

          <label style={{fontWeight: 'bold'}}>Contraseña Actual</label>
          <input
            type="password"
            name="passwordActual"
            value={passwords.passwordActual}
            onChange={handlePassChange}
            placeholder="Requerido para cambiar clave"
            style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
          />

          <label style={{fontWeight: 'bold'}}>Nueva Contraseña</label>
          <input type="password" name="password" value={passwords.password} onChange={handlePassChange} placeholder="Nueva contraseña" style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />

          <label style={{fontWeight: 'bold'}}>Confirmar Nueva Contraseña</label>
          <input type="password" name="confirmarPassword" value={passwords.confirmarPassword} onChange={handlePassChange} placeholder="Repetir nueva contraseña" style={{padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}} />

          <button type="submit" style={{ marginTop: "15px", padding: "12px", background: "#2c3e50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}>
            Actualizar Datos
          </button>

          <button type="button" onClick={() => navigate("/dashboard")} style={{ padding: "10px", background: "#95a5a6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Cancelar
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}