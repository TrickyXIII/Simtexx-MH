import { useState, useEffect } from "react";
import { createOT } from "../services/otService";
import { getClientes, getMantenedores } from "../services/usuariosService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./CrearOT.css";
import { useNavigate } from "react-router-dom";

export default function CrearOT() {
  const navigate = useNavigate();
  
  // Estados para selectores
  const [clientes, setClientes] = useState([]);
  const [responsables, setResponsables] = useState([]);

  // Estado del formulario
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    estado: "Pendiente",
    cliente_id: "",
    responsable_id: "",
    fecha_inicio_contrato: "",
    fecha_fin_contrato: "",
    activo: true
  });

  // Cargar listas de usuarios al iniciar
  useEffect(() => {
    async function loadData() {
      try {
        const c = await getClientes();
        const r = await getMantenedores();
        setClientes(c);
        setResponsables(r);
      } catch (error) {
        console.error("Error cargando usuarios:", error);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createOT(form);
      if (res) {
        alert("OT creada exitosamente ✔");
        navigate("/dashboard");
      } else {
        alert("Error al crear la OT");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  return (
    <>
      <NavBar />
      <div className="container-crearot">
        <h2>Crear Orden de Trabajo</h2>
        <form className="form-box" onSubmit={handleSubmit}>
          
          <label>Título</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} required />

          <label>Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required />

          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange}>
            <option value="Pendiente">Pendiente</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Finalizada">Finalizada</option>
          </select>

          <label>Cliente</label>
          <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
            <option value="">Seleccione Cliente</option>
            {clientes.map(c => (
              <option key={c.id_usuarios} value={c.id_usuarios}>{c.nombre}</option>
            ))}
          </select>

          <label>Responsable</label>
          <select name="responsable_id" value={form.responsable_id} onChange={handleChange} required>
            <option value="">Seleccione Responsable</option>
            {responsables.map(r => (
              <option key={r.id_usuarios} value={r.id_usuarios}>{r.nombre}</option>
            ))}
          </select>

          <label>Fecha Inicio</label>
          <input type="date" name="fecha_inicio_contrato" value={form.fecha_inicio_contrato} onChange={handleChange} required />

          <label>Fecha Fin</label>
          <input type="date" name="fecha_fin_contrato" value={form.fecha_fin_contrato} onChange={handleChange} required />

          <button className="btn-rojo" type="submit">Crear OT</button>
          <button className="btn-cancelar" type="button" onClick={() => navigate(-1)}>Cancelar</button>
        </form>
      </div>
      <Footer />
    </>
  );
}