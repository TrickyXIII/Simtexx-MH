import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// URL base para construir ruta de imágenes
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import { getOTById, exportPDFById, getComentarios, crearComentario, updateComentario, getHistorial } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ot, setOt] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial] = useState([]);

  // --- NUEVO: Estados para imagen ---
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [mostrarInput, setMostrarInput] = useState(false);

  // Estados para EDICIÓN
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { nombre: "Invitado", rol: "Invitado", id: 0, id_usuarios: 0 };
  const userId = usuario.id_usuarios || usuario.id;

  const rolNormalizado = (usuario.rol || usuario.rol_nombre || "").toLowerCase().trim();
  const isAdmin = rolNormalizado === 'admin' || rolNormalizado === 'administrador';

  useEffect(() => {
    async function loadData() {
      const otData = await getOTById(id);
      setOt(otData);

      if (otData) {
        const commentsData = await getComentarios(id);
        setComentarios(commentsData);

        if (isAdmin) {
          const historialData = await getHistorial(id);
          setHistorial(historialData);
        }
      }
    }
    loadData();
  }, [id, isAdmin]);

  const handleExportPDF = () => {
    if (ot) exportPDFById(ot.id_ot, ot.codigo, usuario);
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() && !imagenSeleccionada) return;

    // Enviamos texto e imagen al servicio
    const res = await crearComentario(id, userId, nuevoComentario, imagenSeleccionada);

    if (res) {
      setNuevoComentario("");
      setImagenSeleccionada(null); // Limpiar imagen
      setMostrarInput(false);

      // Recargar comentarios
      const updatedComments = await getComentarios(id);
      setComentarios(updatedComments);
    } else {
      alert("No se pudo guardar el comentario");
    }
  };

  // --- FUNCIONES DE EDICIÓN ---
  const iniciarEdicion = (comentario) => {
    setEditandoId(comentario.id);
    setTextoEditado(comentario.texto);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditado("");
  };

  const guardarEdicion = async (comentarioId) => {
    if (!textoEditado.trim()) return;
    const res = await updateComentario(comentarioId, userId, textoEditado);
    if (res) {
      setEditandoId(null);
      const updatedComments = await getComentarios(id);
      setComentarios(updatedComments);
    } else {
      alert("Error al editar. Verifique permisos.");
    }
  };

  if (!ot) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando OT...</h2>;

  return (
    <>
      <NavBar />

      <div className="detalle-container">

        <div className="titulo-header">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            ⬅ Volver
          </button>
          <h1 className="titulo">Detalle de Orden</h1>
        </div>

        {/* ENCABEZADO */}
        <div className="detalle-header">
          <div className="detalle-item"><label>Código:</label><span>{ot.codigo}</span></div>
          <div className="detalle-item"><label>Nombre:</label><span>{ot.titulo}</span></div>
          <div className="detalle-item"><label>Estado:</label><span>{ot.estado}</span></div>
          <div className="detalle-item"><label>Fecha:</label><span>{ot.fecha_inicio_contrato ? ot.fecha_inicio_contrato.slice(0, 10) : '-'}</span></div>
          <div className="detalle-item"><label>Cliente:</label><span>{ot.cliente_nombre}</span></div>
          <div className="detalle-item"><label>Responsable:</label><span>{ot.responsable_nombre}</span></div>
        </div>

        <div className="detalle-main">
          <div className="datos-box">
            <h3>Datos General</h3>
            <div className="datos-grid">
              <div><label>Descripción:</label><p>{ot.descripcion}</p></div>
              <div><label>F. Inicio:</label><p>{ot.fecha_inicio_contrato ? ot.fecha_inicio_contrato.slice(0, 10) : '-'}</p></div>
              <div><label>F. Estimada Fin:</label><p>{ot.fecha_fin_contrato ? ot.fecha_fin_contrato.slice(0, 10) : '-'}</p></div>
              <div><label>Estado Actual:</label><p>{ot.estado}</p></div>
            </div>
          </div>

          <div className="recursos-box">
            <h3>Recursos Adjuntos</h3>
            <div className="recursos-grid">
              <div className="rcard"><span>Imágenes</span><b>{comentarios.filter(c => c.imagen_url).length}</b></div>
              <div className="rcard"><span>Enlaces</span><b>0</b></div>
              <div className="rcard"><span>Archivos</span><b>0</b></div>
            </div>
          </div>
        </div>

        <div className="botonera">
          <button onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>Configurar OT</button>
          <button>Agregar Recursos</button>
          <button onClick={handleExportPDF}>Exportar PDF</button>
        </div>

        {/* SECCIÓN HISTORIAL (SOLO ADMIN) */}
        {isAdmin && (
          <div className="historial-box">
            <h3>Historial de Auditoría (Admin)</h3>
            {historial.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '10px' }}>No hay registros de cambios.</p>
            ) : (
              <table>
                <thead>
                  <tr><th>Fecha</th><th>Acción / Detalles</th><th>Responsable</th></tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.id_auditoria || Math.random()}>
                      <td>{new Date(h.fecha_cambio).toLocaleString()}</td>
                      <td><strong>{h.accion}</strong> {h.detalles && <span style={{ display: 'block', fontSize: '12px', color: '#555' }}>{h.detalles}</span>}</td>
                      <td>{h.responsable_nombre || "Sistema"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SECCIÓN COMENTARIOS CON IMÁGENES */}
        <div className="comentarios-box">
          <h3>Comentarios ({comentarios.length})</h3>

          <div style={{ textAlign: 'left', padding: '0 20px' }}>
            {comentarios.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No hay comentarios aún.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {comentarios.map((c) => {
                  const esMio = String(c.usuarios_id) === String(userId);

                  return (
                    <li key={c.id} style={{
                      background: '#f9f9f9', marginBottom: '10px', padding: '10px',
                      borderRadius: '8px', borderLeft: '4px solid #333', position: 'relative'
                    }}>
                      <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          <b>{c.autor}</b> - {new Date(c.fecha_creacion).toLocaleString()}
                          {c.fecha_edicion && <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>(Editado)</span>}
                        </span>
                        {esMio && editandoId !== c.id && (
                          <button onClick={() => iniciarEdicion(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}>✎ Editar</button>
                        )}
                      </div>

                      {editandoId === c.id ? (
                        <div style={{ marginTop: '5px' }}>
                          <textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} style={{ width: '100%', padding: '5px' }} />
                          <div style={{ marginTop: '5px', textAlign: 'right' }}>
                            <button onClick={cancelarEdicion} style={{ marginRight: '5px', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={() => guardarEdicion(c.id)} style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* TEXTO */}
                          <div style={{ fontSize: '15px', whiteSpace: 'pre-wrap' }}>{c.texto}</div>

                          {/* IMAGEN (Si existe) */}
                          {c.imagen_url && (
                            <div style={{ marginTop: '10px' }}>
                              <a href={`${BASE_URL}/${c.imagen_url}`} target="_blank" rel="noreferrer">
                                <img
                                  src={`${BASE_URL}/${c.imagen_url}`}
                                  alt="Evidencia"
                                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {mostrarInput ? (
            <div style={{ marginTop: '15px', padding: '0 20px' }}>
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe tu comentario..."
                style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '6px' }}
              />

              {/* INPUT PARA IMAGEN */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="file-upload" style={{ cursor: 'pointer', background: '#ddd', padding: '5px 10px', borderRadius: '5px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                  📷 Adjuntar Imagen
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagenSeleccionada(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                {imagenSeleccionada && (
                  <span style={{ fontSize: '12px', color: '#555', display: 'flex', alignItems: 'center' }}>
                    {imagenSeleccionada.name}
                    <button onClick={() => setImagenSeleccionada(null)} style={{ marginLeft: '5px', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setMostrarInput(false); setImagenSeleccionada(null); }}
                  style={{ background: '#888', color: 'white', padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >Cancelar</button>
                <button
                  onClick={handleEnviarComentario}
                  style={{ background: '#2e7d32', color: 'white', padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >Enviar</button>
              </div>
            </div>
          ) : (
            <button className="btn-add" onClick={() => setMostrarInput(true)} title="Agregar Comentario">
              +
            </button>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}