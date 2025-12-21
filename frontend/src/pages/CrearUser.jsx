import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../services/usuariosService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./Formularios.css"; // Importamos el CSS compartido

export default function CrearUsuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "", correo: "", password: "", repetirPassword: "", rol_id: "", activo: true,
  });

  function handleChange(e) {
    const value = e.target.type === "radio" ? (e.target.value === "activo") : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.repetirPassword) return alert("Las contraseñas no coinciden");
    if (!form.rol_id) return alert("Debes seleccionar un rol");

    try {
      await createUser({ ...form, rol_id: parseInt(form.rol_id) });
      alert("Usuario creado exitosamente ✔");
      navigate("/GestionUser");
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  return (
    <>
    <NavBar />
    <div className="form-container-page">
      <h2 className="form-titulo">Crear Usuario</h2>

      <form onSubmit={handleSubmit} className="form-card">
        <div>
            <label>Nombre Completo</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Juan Pérez" />
        </div>

        <div>
            <label>Correo Electrónico</label>
            <input type="email" name="correo" value={form.correo} onChange={handleChange} required placeholder="juan@simtexx.com" />
        </div>

        <div>
            <label>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>

        <div>
            <label>Repetir Contraseña</label>
            <input type="password" name="repetirPassword" value={form.repetirPassword} onChange={handleChange} required />
        </div>

        <div>
            <label>Rol</label>
            <select name="rol_id" value={form.rol_id} onChange={handleChange} required>
              <option value="">Seleccionar</option>
              <option value="1">Administrador</option>
              <option value="2">Cliente</option>
              <option value="3">Mantenedor (Técnico)</option>
            </select>
        </div>

        <div>
            <label>Estado</label>
            <div style={{display:'flex', gap:'20px', marginTop:'5px'}}>
                <label style={{fontWeight:'normal'}}><input type="radio" name="activo" value="activo" checked={form.activo === true} onChange={() => setForm({...form, activo: true})} style={{width:'auto', marginRight:'5px'}}/> Activo</label>
                <label style={{fontWeight:'normal'}}><input type="radio" name="activo" value="inactivo" checked={form.activo === false} onChange={() => setForm({...form, activo: false})} style={{width:'auto', marginRight:'5px'}}/> Inactivo</label>
            </div>
        </div>

        <button type="submit" className="btn-submit">Guardar Usuario</button>
        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancelar</button>
      </form>
    </div>
    <Footer />
    </>
  );
}