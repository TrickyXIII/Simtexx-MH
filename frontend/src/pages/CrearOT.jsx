import { useState, useEffect } from "react";
import { createOT } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./CrearOT.css";
import { useNavigate, useParams } from "react-router-dom";
import { getClientes, getMantenedores } from "../services/usuariosService";

export default function CrearOT() {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams(); // Obtenemos el ID del usuario logueado desde la URL
  
  
  //select de responsable con id=3 mantenedores : 
    const [responsables, setResponsables] = useState([]);

  useEffect(() => {
    async function loadResponsables() {
      const data = await getMantenedores();
      setResponsables(data);
    }
    loadResponsables();
  }, []);
  // select de clientes 
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    async function loadClientes() {
      const data = await getClientes();
      setClientes(data);
    }
    loadClientes();
  }, []);
  // Estado inicial adaptado a la Base de Datos
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    estado: "",
    cliente_id:"",
    responsable_id:"",
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
    if (!form.cliente_id) newErrors.cliente_id = "Debe seleccionar un cliente";
    if (!form.responsable_id) newErrors.responsable_id = "Debe seleccionar un responsable";
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
      cliente_id:form.cliente_id,
      fecha_inicio_contrato: form.fecha_inicio_contrato,
      fecha_fin_contrato: form.fecha_fin_contrato,
      responsable_id:form.responsable_id, 
    };

    try {
      // Llamamos a la función asíncrona del servicio
      await createOT(nuevaOT);
      alert("OT creada exitosamente en Base de Datos");
      navigate(-1);
    } catch (error) {
      alert("Error al crear OT DESDE FRONT: " + error.message);
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


          {/* CAMPO CLIENTE */ }
          <select name="cliente_id" value={form.cliente_id} onChange={handleChange}>
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id_usuarios} value={cliente.id_usuarios}>
                {cliente.nombre}
              </option>
            ))}
          </select>
          {errors.cliente_id && <p className="error">{errors.cliente_id}</p>}

          {/* RESPONSABLE */ }
          <select name="responsable_id"  value={form.responsable_id} onChange={handleChange}>
            <option value="">Selecciona un responsable</option>
            {responsables.map((resp) => (
              <option key={resp.id_usuarios} value={resp.id_usuarios}>
                {resp.nombre}
              </option>
            ))}
          </select>

          {errors.responsable_id && <p className="error">{errors.responsable_id}</p>}



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
