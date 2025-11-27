import { useState } from "react";
import { createOT } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./CrearOT.css";
import { useNavigate, useParams } from "react-router-dom";

export default function CrearOT() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID del usuario logueado desde la URL

  // Estado inicial adaptado a la Base de Datos
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    estado: "",
    fecha_inicio_contrato: "",
    fecha_fin_contrato: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.titulo.trim()) newErrors.titulo = "El título es obligatorio";
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.estado) newErrors.estado = "Debe seleccionar un estado";
    if (!form.fecha_inicio_contrato) newErrors.fecha_inicio_contrato = "Fecha inicio requerida";
    if (!form.fecha_fin_contrato) newErrors.fecha_fin_contrato = "Fecha fin requerida";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});

    // Preparamos el objeto para enviar al Backend
    const nuevaOT = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      estado: form.estado,
      fecha_inicio_contrato: form.fecha_inicio_contrato,
      fecha_fin_contrato: form.fecha_fin_contrato,
      responsable_id: parseInt(id), // Usamos el ID de la URL como responsable
    };

    try {
      // Llamamos a la función asíncrona del servicio
      await createOT(nuevaOT);
      alert("OT creada exitosamente en Base de Datos");
      navigate(`/listaOT/${id}`); // Redirigimos a la lista
    } catch (error) {
      alert("Error al crear OT: " + error.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className="container-crearot">
        <h2>Crear Orden de Trabajo</h2>
        <h4>Simtexx Spa</h4>

        <form className="form-box" onSubmit={handleSubmit}>
          
          {/* CAMPO TÍTULO */}
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={form.titulo}
            onChange={handleChange}
          />
          {errors.titulo && <p className="error">{errors.titulo}</p>}

          {/* CAMPO DESCRIPCIÓN */}
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          />
          {errors.descripcion && <p className="error">{errors.descripcion}</p>}

          {/* CAMPO ESTADO */}
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="">Estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizada">Finalizada</option>
          </select>
          {errors.estado && <p className="error">{errors.estado}</p>}

          {/* FECHAS */}
          <label>Fecha inicio de contrato</label>
          <input 
            type="date" 
            name="fecha_inicio_contrato" 
            value={form.fecha_inicio_contrato} 
            onChange={handleChange} 
          />
          {errors.fecha_inicio_contrato && <p className="error">{errors.fecha_inicio_contrato}</p>}

          <label>Fecha finalización de contrato</label>
          <input 
            type="date" 
            name="fecha_fin_contrato" 
            value={form.fecha_fin_contrato} 
            onChange={handleChange} 
          />
          {errors.fecha_fin_contrato && <p className="error">{errors.fecha_fin_contrato}</p>}

          <button className="btn-rojo" type="submit">Crear OT</button>
          <button className="btn-cancelar" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
