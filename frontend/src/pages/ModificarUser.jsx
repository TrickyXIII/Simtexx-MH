import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Asegúrate de que usuariosService tenga estas funciones (ver abajo)
import { getUserById, updateUser } from "../services/usuariosService"; 
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function ModificarUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    rol_id: "",
  });

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getUserById(id);
        if (user) {
          setForm({
            nombre: user.nombre,
            correo: user.correo,
            rol_id: user.rol_id
          });
        } else {
          alert("Usuario no encontrado");
          navigate("/GestionUser");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, {
        nombre: form.nombre,
        correo: form.correo,
        rol_id: parseInt(form.rol_id)
      });
      alert("Usuario actualizado correctamente ✔");
      navigate("/GestionUser");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

  return (
    <>
      <NavBar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', minHeight: 'calc(100vh - 140px)' }}>
        <h2>Editar Usuario</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex", flexDirection: "column", width: "300px", gap: "15px",
            background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}
        >
          <label>Nombre Completo</label>
          <input
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
          />

          <label>Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
            style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
          />

          <label>Rol</label>
          <select
            name="rol_id"
            value={form.rol_id}
            onChange={handleChange}
            required
            style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
          >
            <option value="">Seleccionar</option>
            <option value="1">Administrador</option>
            <option value="2">Cliente</option>
            <option value="3">Mantenedor (Técnico)</option>
          </select>

          <button 
            type="submit" 
            style={{ marginTop: "10px", padding: "10px", background: "#d62828", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Guardar Cambios
          </button>

          <button
            type="button"
            onClick={() => navigate("/GestionUser")}
            style={{ padding: "10px", background: "#555", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Cancelar
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}