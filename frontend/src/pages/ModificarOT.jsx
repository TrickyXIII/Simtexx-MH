import { useParams, useNavigate } from "react-router-dom";
import { getOTById, updateOT, deleteOT } from "../services/otService";
import { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./ModificarOT.css";

export default function ModificarOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
    cliente: "",
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
    estadoOT: true, // ⬅ NUEVO BOOLEANO
  });

  // Cargar datos existentes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ot = getOTById(id);
    if (ot) {
      setForm({
        nombre: ot.nombre,
        descripcion: ot.descripcion,
        estado: ot.estado,
        cliente: ot.cliente,
        responsable: ot.responsable,
        fechaInicio: ot.fechaInicio,
        fechaFin: ot.fechaFin,
        estadoOT: ot.estadoOT ?? true,
      });
    }
  }, [id]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Validaciones
  const validateForm = () => {
    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.estado) newErrors.estado = "Debe seleccionar un estado";
    if (!form.cliente.trim()) newErrors.cliente = "Debe ingresar cliente";
    if (!form.responsable.trim()) newErrors.responsable = "Debe ingresar responsable";
    if (!form.fechaInicio) newErrors.fechaInicio = "Debe ingresar fecha de inicio";
    if (!form.fechaFin) newErrors.fechaFin = "Debe ingresar fecha finalización";
    return newErrors;
  };

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    updateOT(id, form);
    alert("OT modificada exitosamente");
    navigate(`/detalle/${id}`);
  }

  function handleDelete() {
    const seguro = window.confirm("¿Seguro que quieres eliminar esta OT?");
    if (!seguro) return;

    deleteOT(id);
    alert("OT eliminada correctamente");

    navigate("/Listaot");
  }

  return (
    <>
      <NavBar />

      <div className="modal-container">
        <div className="modal-box">

          <h2 className="titulo">Configuración de OT</h2>

          <form onSubmit={handleSubmit} className="form-box">

            <label>Título</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} />
            {errors.nombre && <p className="error">{errors.nombre}</p>}

            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
            {errors.descripcion && <p className="error">{errors.descripcion}</p>}

            <label>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="">Seleccionar</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
            {errors.estado && <p className="error">{errors.estado}</p>}

            <label>Cliente</label>
            <input name="cliente" value={form.cliente} onChange={handleChange} />
            {errors.cliente && <p className="error">{errors.cliente}</p>}

            <label>Responsable</label>
            <input name="responsable" value={form.responsable} onChange={handleChange} />
            {errors.responsable && <p className="error">{errors.responsable}</p>}

            <label>Fecha finalización de contrato</label>
            <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
            {errors.fechaFin && <p className="error">{errors.fechaFin}</p>}

            {/* NUEVO INPUT RADIO BOOLEANO */}
            <label>Estado OT (Activa / Inactiva)</label>

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="estadoOT"
                  value="true"
                  checked={form.estadoOT === true}
                  onChange={() => setForm({ ...form, estadoOT: true })}
                />
                Activa
              </label>

              <label>
                <input
                  type="radio"
                  name="estadoOT"
                  value="false"
                  checked={form.estadoOT === false}
                  onChange={() => setForm({ ...form, estadoOT: false })}
                />
                Inactiva
              </label>
            </div>

            <div className="btn-row">
              <button type="button" className="btn-eliminar" onClick={handleDelete}>
                Eliminar
              </button>

              <button type="submit" className="btn-guardar">
                Guardar
              </button>
            </div>

            <button
              type="button"
              className="btn-cancelar"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}

