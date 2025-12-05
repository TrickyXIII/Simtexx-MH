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

  const [errors, setErrors] = useState({});
  const [clientes, setClientes] = useState([]);
  const [responsables, setResponsables] = useState([]);
  const [form, setForm] = useState([id]);

  useEffect(() => {
    async function loadData() {
      const data = await getOTById(id);
      const c = await getClientes();
      const r = await getMantenedores();

      setClientes(c);
      setResponsables(r);

      setForm({
        codigo:data.codigo || "",
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        estado: data.estado || "",
        cliente_id: data.cliente_id || "",
        responsable_id: data.responsable_id || "",
        fecha_inicio_contrato: data.fecha_inicio_contrato?.split("T")[0] || "",
        fecha_fin_contrato: data.fecha_fin_contrato?.split("T")[0] || "",
        activo: data.activo
      });
    }
    loadData();
  }, [id]);

  if (!form) return <h2 style={{ color: "white" }}>Cargando OT...</h2>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    await updateOT(id, {
      titulo: form.titulo,
      descripcion: form.descripcion,
      estado: form.estado,
      cliente_id: form.cliente_id,
      responsable_id: form.responsable_id,
      fecha_inicio_contrato: form.fecha_inicio_contrato,
      fecha_fin_contrato: form.fecha_fin_contrato,
      activo: form.activo
    });

    alert("OT modificada exitosamente ✔");
    navigate(`/detalle/${id}`);

  } catch (error) {
    console.error("❌ Error al modificar la OT:", error);
    alert("Hubo un error al intentar modificar la OT");
  }
}

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar OT?")) return;
    await deleteOTBackend(id);
    alert("OT Eliminada");
    navigate("/dashboard");
  };

  return (
    <>
      <NavBar />
      <div className="modal-container">
        <div className="modal-box">
          <h2>Configuración de OT </h2>
          <h3>Codigo: {form.codigo}</h3>

          <form className="form-box" onSubmit={handleSubmit}>

            <label>Título</label>
            <input name="titulo" value={form.titulo} onChange={handleChange} />

            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />

            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="">Seleccionar</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>

            <label>Cliente</label>
            <select
              name="cliente_id"
              value={form.cliente_id}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              {clientes.map(c => (
                <option key={c.id_usuarios} value={c.id_usuarios}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <label>Responsable</label>
            <select
              name="responsable_id"
              value={form.responsable_id}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              {responsables.map(r => (
                <option key={r.id_usuarios} value={r.id_usuarios}>
                  {r.nombre}
                </option>
              ))}
            </select>

            <label>Fecha inicio contrato</label>
            <input type="date" name="fecha_inicio_contrato" value={form.fecha_inicio_contrato} onChange={handleChange} />

            <label>Fecha fin contrato</label>
            <input type="date" name="fecha_fin_contrato" value={form.fecha_fin_contrato} onChange={handleChange} />

            <label>Estado OT</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="activo" checked={form.activo === true} onChange={() => setForm({...form, activo: true})}/>
                Activa
              </label>

              <label>
                <input type="radio" name="activo" checked={form.activo === false} onChange={() => setForm({...form, activo: false})}/>
                Inactiva
              </label>
            </div>

            <div className="btn-row">
              <button type="button" className="btn-eliminar" onClick={handleDelete}>Eliminar</button>
              <button type="submit" className="btn-guardar">Guardar</button>
            </div>

            <button type="button" className="btn-cancelar" onClick={() => navigate(-1)}>Cancelar</button>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
