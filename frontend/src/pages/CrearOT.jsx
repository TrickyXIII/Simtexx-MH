import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOT } from "../services/otService";
import { getClientes, getMantenedores } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./CrearOT.css";

export default function CrearOT() {
  const navigate = useNavigate();
  
  // 1. Detectar Rol
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");
  const isCliente = usuarioActual.rol_id === 2; // 2 = Cliente

  // 2. Estado Inicial (Si es cliente, pre-rellenamos datos)
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha_inicio: isCliente ? new Date().toISOString().split('T')[0] : "",
    fecha_fin: "",
    estado: "Pendiente",
    cliente_id: isCliente ? usuarioActual.id : "", 
    responsable_id: ""
  });

  // Listas (solo para Admin)
  const [clientes, setClientes] = useState([]);
  const [mantenedores, setMantenedores] = useState([]);

  useEffect(() => {
    // Si NO es cliente, cargamos las listas para que el Admin elija
    if (!isCliente) {
      async function loadData() {
        try {
          const c = await getClientes();
          const m = await getMantenedores();
          setClientes(c.usuarios || []); 
          setMantenedores(m.usuarios || []);
        } catch (e) {
          console.error("Error cargando listas", e);
        }
      }
      loadData();
    }
  }, [isCliente]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createOT({
        titulo: form.titulo,
        descripcion: form.descripcion,
        // Lógica de Envío:
        // Si es cliente -> Forzamos "Pendiente" y Fecha Hoy. Responsable y Fin van nulos.
        // Si es admin -> Enviamos lo que haya elegido en el form.
        estado: isCliente ? "Pendiente" : form.estado,
        fecha_inicio_contrato: isCliente ? new Date() : form.fecha_inicio,
        fecha_fin_contrato: isCliente ? null : form.fecha_fin,
        cliente_id: isCliente ? usuarioActual.id : parseInt(form.cliente_id),
        responsable_id: isCliente ? null : (form.responsable_id ? parseInt(form.responsable_id) : null)
      });
      alert("OT creada exitosamente");
      navigate("/dashboard");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <>
      <NavBar />
      <div className="crear-ot-container">
        <h2>Crear Nueva Orden de Trabajo</h2>
        <form onSubmit={handleSubmit} className="crear-ot-form">
          
          <label>Título</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
            placeholder="Ej: Revisión de equipos"
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            placeholder="Detalles del trabajo a realizar..."
          />

          {/* SECCIÓN SOLO PARA ADMIN / MANTENEDOR */}
          {!isCliente && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Fecha Fin (Estimada)</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Finalizada">Finalizada</option>
              </select>

              <label>Cliente</label>
              <select 
                name="cliente_id" 
                value={form.cliente_id} 
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar Cliente</option>
                {clientes.map((c) => (
                  <option key={c.id_usuarios} value={c.id_usuarios}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <label>Responsable (Técnico)</label>
              <select 
                name="responsable_id" 
                value={form.responsable_id} 
                onChange={handleChange}
              >
                <option value="">Sin asignar</option>
                {mantenedores.map((m) => (
                  <option key={m.id_usuarios} value={m.id_usuarios}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* MENSAJE PARA EL CLIENTE */}
          {isCliente && (
            <div style={{
              background: "#e3f2fd", 
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "20px", 
              fontSize: "0.95em",
              color: "#0277bd",
              border: "1px solid #b3e5fc"
            }}>
              <p style={{margin: 0}}>
                <strong>ℹ️ Información:</strong> Su solicitud se creará con estado <em>"Pendiente"</em>. 
                Nuestro equipo administrativo asignará un responsable y la fecha de término a la brevedad.
              </p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-save">Guardar OT</button>
            <button type="button" className="btn-cancel" onClick={() => navigate("/dashboard")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
}