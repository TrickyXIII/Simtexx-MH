import { useParams, useNavigate } from "react-router-dom";
import { getOTById, updateOT, deleteOTBackend } from "../services/otService";
import { getClientes, getMantenedores } from "../services/usuariosService";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ModificarOT.css";

export default function ModificarOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  
  const [form, setForm] = useState({
    codigo: "",
    titulo: "",
    descripcion: "",
    estado: "",
    cliente_id: "",
    responsable_id: "",
    fecha_inicio_contrato: "",
    fecha_fin_contrato: "",
    activo: true
  });
  
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [otData, clientesData, responsablesData] = await Promise.all([
          getOTById(id),
          getClientes(),
          getMantenedores()
        ]);

        if (otData) {
          setForm({
            codigo: otData.codigo || "",
            titulo: otData.titulo || "",
            descripcion: otData.descripcion || "",
            estado: otData.estado || "",
            cliente_id: otData.cliente_id || "",
            responsable_id: otData.responsable_id || "",
            fecha_inicio_contrato: otData.fecha_inicio_contrato ? otData.fecha_inicio_contrato.split("T")[0] : "",
            fecha_fin_contrato: otData.fecha_fin_contrato ? otData.fecha_fin_contrato.split("T")[0] : "",
            activo: otData.activo
          });
        }
        setClientes(clientesData);
        setResponsables(responsablesData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setCargando(false);
      }
    }
    loadData();
  }, [id]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateOT(id, form);
      alert("OT modificada exitosamente ✔");
      navigate(`/detalle/${id}`);
    } catch (error) {
      console.error("❌ Error al modificar la OT:", error);
      alert("Hubo un error al intentar modificar la OT");
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar OT permanentemente?")) return;
    try {
        await deleteOTBackend(id);
        alert("OT Eliminada");
        navigate("/dashboard");
    } catch(e) {
        alert("Error al eliminar");
    }
  };

  if (cargando) return <div style={{padding:"20px"}}>Cargando datos...</div>;

  return (
    <>
      <NavBar />
      <div className="modal-container">
        <div className="modal-box">
          <h2>Editar OT: {form.codigo}</h2>

          <form className="form-box" onSubmit={handleSubmit}>
            <label>Título</label>
            <input name="titulo" value={form.titulo} onChange={handleChange} required />

            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />

            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>

            <label>Cliente</label>
            <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
              <option value="">Seleccionar Cliente</option>
              {clientes.map(c => (
                <option key={c.id_usuarios} value={c.id_usuarios}>{c.nombre}</option>
              ))}
            </select>

            <label>Responsable</label>
            <select name="responsable_id" value={form.responsable_id} onChange={handleChange} required>
              <option value="">Seleccionar Responsable</option>
              {responsables.map(r => (
                <option key={r.id_usuarios} value={r.id_usuarios}>{r.nombre}</option>
              ))}
            </select>

            <label>Fecha inicio</label>
            <input type="date" name="fecha_inicio_contrato" value={form.fecha_inicio_contrato} onChange={handleChange} />

            <label>Fecha fin</label>
            <input type="date" name="fecha_fin_contrato" value={form.fecha_fin_contrato} onChange={handleChange} />

            <label>Estado OT (Activo/Inactivo)</label>
            <div className="radio-group">
              <label>
                <input 
                    type="radio" 
                    name="activo" 
                    checked={form.activo === true} 
                    onChange={() => setForm({...form, activo: true})}
                /> Activa
              </label>
              <label>
                <input 
                    type="radio" 
                    name="activo" 
                    checked={form.activo === false} 
                    onChange={() => setForm({...form, activo: false})}
                /> Inactiva
              </label>
            </div>

            <div className="btn-row">
              <button type="button" className="btn-eliminar" onClick={handleDelete}>Eliminar</button>
              <button type="submit" className="btn-guardar">Guardar Cambios</button>
            </div>
            <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}