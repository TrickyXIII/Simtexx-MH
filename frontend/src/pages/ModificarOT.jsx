import { useParams, useNavigate } from "react-router-dom";
import { getOTById, updateOT, deleteOTBackend } from "../services/otService";
import { getClientes, getMantenedores } from "../services/usuariosService"; // Importamos el nuevo servicio
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

  // Función auxiliar para formatear fechas de forma segura
  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    if (typeof fecha === "string" && fecha.includes("T")) {
        return fecha.split("T")[0];
    }
    try {
        return new Date(fecha).toISOString().split("T")[0];
    } catch (e) {
        return "";
    }
  };

  // --- OBTENER FECHA ACTUAL EN FORMATO YYYY-MM-DD (LOCAL) ---
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

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
            estado: otData.estado || "Pendiente",
            cliente_id: otData.cliente_id ? String(otData.cliente_id) : "",
            responsable_id: otData.responsable_id ? String(otData.responsable_id) : "",
            fecha_inicio_contrato: formatearFecha(otData.fecha_inicio_contrato),
            fecha_fin_contrato: formatearFecha(otData.fecha_fin_contrato),
            activo: otData.activo
          });
        }
        setClientes(clientesData || []);
        setResponsables(responsablesData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
        alert("Error al cargar la información de la OT.");
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

    // Validación de fecha fin (solo si se ingresó)
    if (form.fecha_fin_contrato && form.fecha_fin_contrato < getTodayString()) {
      alert("La fecha fin no puede ser anterior a la fecha actual.");
      return;
    }

    try {
      await updateOT(id, form);
      alert("OT modificada exitosamente ✔");
      navigate(`/detalle/${id}`); 
    } catch (error) {
      console.error("❌ Error al modificar la OT:", error);
      alert("Hubo un error al intentar modificar la OT. Revisa la consola.");
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta OT permanentemente?")) return;
    try {
        await deleteOTBackend(id);
        alert("OT Eliminada");
        navigate("/dashboard");
    } catch(e) {
        alert("Error al eliminar la OT");
    }
  };

  if (cargando) return <div className="loading-msg">Cargando datos...</div>;

  return (
    <>
      <NavBar />
      <div className="modal-container">
        <div className="modal-box">
          <h2>Editar OT: <span style={{color: '#4caf50'}}>{form.codigo}</span></h2>

          <form className="form-box" onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Título</label>
                <input name="titulo" value={form.titulo} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Estado</label>
                    <select name="estado" value={form.estado} onChange={handleChange}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Finalizada">Finalizada</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Estado OT</label>
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
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Cliente</label>
                    <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {clientes.map(c => (
                        <option key={c.id_usuarios} value={c.id_usuarios}>{c.nombre}</option>
                    ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Responsable</label>
                    <select name="responsable_id" value={form.responsable_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {responsables.map(r => (
                        <option key={r.id_usuarios} value={r.id_usuarios}>{r.nombre}</option>
                    ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Fecha Inicio</label>
                    <input type="date" name="fecha_inicio_contrato" value={form.fecha_inicio_contrato} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Fecha Fin</label>
                    <input 
                        type="date" 
                        name="fecha_fin_contrato" 
                        value={form.fecha_fin_contrato} 
                        onChange={handleChange} 
                        min={getTodayString()} // Restricción en UI
                    />
                </div>
            </div>

            <div className="btn-row">
              <button type="button" className="btn-eliminar" onClick={handleDelete}>Eliminar OT</button>
              <div style={{display:'flex', gap:'10px'}}>
                  <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>
                  <button type="submit" className="btn-guardar">Guardar Cambios</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}