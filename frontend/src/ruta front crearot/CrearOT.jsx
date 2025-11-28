import { useState } from "react";
import { createOT } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./CrearOT.css";
import { useNavigate } from "react-router-dom";

export default function CrearOT() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    estado: "",
    cliente: "",
    responsable: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!form.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria";
    if (!form.estado) newErrors.estado = "Debe seleccionar un estado";
    if (!form.cliente) newErrors.cliente = "Debe seleccionar un cliente";
    if (!form.responsable) newErrors.responsable = "Debe seleccionar un responsable";
    if (!form.fechaInicio) newErrors.fechaInicio = "Debe ingresar fecha de inicio";
    if (!form.fechaFin) newErrors.fechaFin = "Debe ingresar fecha de finalización";

    return newErrors;
  };

  // Función ahora es ASÍNCRONA
  const handleSubmit = async (e) => { 
    e.preventDefault();

    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({}); 

    // Preparamos el objeto OT.
    const newOT = {
      ...form,
      historial: [
        {
          fecha: new Date().toLocaleDateString(),
          msg: "OT creada",
        },
      ],
      imagenes: [],
      comentarios: [],
    };

    // USAMOS 'await' para esperar la respuesta del servidor
    try {
      await createOT(newOT); 
      console.log("OT creada con éxito en el backend.");
      alert("OT creada con éxito"); 
      navigate(-1);
    } catch (error) {
      console.error("Error al guardar la OT en el servidor:", error);
      alert("Error: No se pudo conectar al servidor. Revisa la consola para más detalles.");
    }
  };
  
  return (
    <>
      <NavBar />

      <div className="container-crearot">
        <h2>Crear Orden de Trabajo</h2>
        <h4>Simtexx Spa</h4>

        <form className="form-box" onSubmit={handleSubmit}>

          <input
            type="text"
            name="nombre"
            placeholder="Título"
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <p className="error">{errors.nombre}</p>}


          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          
          />
          {errors.descripcion && <p className="error">{errors.descripcion}</p>}

          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="">Estado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizada">Finalizada</option>
          </select>
          {errors.estado && <p className="error">{errors.estado}</p>}

          <select name="cliente" value={form.cliente} onChange={handleChange}>
            <option value="">Cliente</option>
            <option value="Juan Perez">Juan Perez</option>
            <option value="Empresa X">Empresa X</option>
          </select>
          {errors.cliente && <p className="error">{errors.cliente}</p>}

          <select
            name="responsable"
            value={form.responsable}
            onChange={handleChange}
          >
            <option value="">Responsable</option>
            <option value="Maria Lopez">Maria Lopez</option>
            <option value="Pedro Rojas">Pedro Rojas</option>
          </select>
          {errors.responsable && <p className="error">{errors.responsable}</p>}

          <label>Fecha inicio de contrato</label>
          <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} />
          {errors.fechaInicio && <p className="error">{errors.fechaInicio}</p>}

          <label>Fecha finalización de contrato</label>
          <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} />
          {errors.fechaFin && <p className="error">{errors.fechaFin}</p>}

          <button className="btn-rojo" type="submit" >Crear OT</button>
          <button className="btn-cancelar" type="button" onClick={() => window.history.back()}>
            Cancelar
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
}