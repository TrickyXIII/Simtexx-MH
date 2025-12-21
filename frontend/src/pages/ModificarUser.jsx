import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Formularios.css"; // Importamos los estilos compartidos

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
      <div className="form-container-page">
        <h2 className="form-titulo">Editar Usuario</h2>
        <form onSubmit={handleSubmit} className="form-card">
          <div>
            <label>Nombre Completo</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Rol</label>
            <select
              name="rol_id"
              value={form.rol_id}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar</option>
              <option value="1">Administrador</option>
              <option value="2">Cliente</option>
              <option value="3">Mantenedor (Técnico)</option>
            </select>
          </div>

          <button type="submit" className="btn-submit">
            Guardar Cambios
          </button>

          <button
            type="button"
            onClick={() => navigate("/GestionUser")}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}