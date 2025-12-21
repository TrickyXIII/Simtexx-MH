import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOT } from "../services/otService";
import { getClientes, getMantenedores } from "../services/usuariosService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./CrearOT.css";

export default function CrearOT() {
  const navigate = useNavigate();
  
  // 1. Detectar Rol y Usuario
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual") || "{}");
  const isCliente = usuarioActual.rol_id === 2; // 2 = Cliente

  // El ID debe venir preferentemente del token si está disponible, pero usamos fallback
  const userId = usuarioActual.id_usuarios || usuarioActual.id;

  // 2. Estado Inicial
  // Si es cliente, pre-llenamos valores por defecto
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    // Fecha Inicio: Actual si es cliente, vacía si es Admin para que elija
    fecha_inicio: isCliente ? new Date().toISOString().split('T')[0] : "",
    fecha_fin: "",
    // Estado: Pendiente si es cliente
    estado: isCliente ? "Pendiente" : "Pendiente",
    // Cliente: Su propio ID si es cliente
    cliente_id: isCliente ? userId : "", 
    responsable_id: ""
  });

  const [clientes, setClientes] = useState([]);
  const [mantenedores, setMantenedores] = useState([]);

  useEffect(() => {
    // Si NO es cliente, cargamos las listas para que Admin elija
    if (!isCliente) {
      async function loadData() {
        try {
          const c = await getClientes();
          const m = await getMantenedores();
          
          const listaClientes = Array.isArray(c) ? c : (c.usuarios || []);
          const listaMantenedores = Array.isArray(m) ? m : (m.usuarios || []);

          setClientes(listaClientes); 
          setMantenedores(listaMantenedores);
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

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isCliente && !userId) {
        alert("Error de sesión: No se pudo identificar tu usuario. Por favor cierra sesión y vuelve a entrar.");
        return;
      }

      // Validación fecha fin (solo si se ingresa, Admin/Mantenedor)
      if (form.fecha_fin && form.fecha_fin < getTodayString()) {
        alert("La fecha fin no puede ser anterior a la fecha actual.");
        return;
      }

      await createOT({
        titulo: form.titulo,
        descripcion: form.descripcion,
        // Lógica de asignación según rol
        estado: isCliente ? "Pendiente" : form.estado,
        fecha_inicio_contrato: isCliente ? new Date() : form.fecha_inicio,
        fecha_fin_contrato: isCliente ? null : form.fecha_fin, // Cliente no pone fecha fin
        cliente_id: isCliente ? userId : parseInt(form.cliente_id),
        responsable_id: isCliente ? null : (form.responsable_id ? parseInt(form.responsable_id) : null)
      });
      
      alert("OT creada exitosamente");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.message || "No se pudo crear la OT"));
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

          {/* CAMPOS OCULTOS PARA CLIENTE */}
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
                    min={getTodayString()}
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
                <strong>ℹ️ Información:</strong> Se registrará a nombre de <strong>{usuarioActual.nombre}</strong> con fecha actual.
                La solicitud quedará "Pendiente" hasta que un administrador la asigne.
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