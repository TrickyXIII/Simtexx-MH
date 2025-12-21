import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// URL base para construir ruta de imágenes
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import { getOTById, exportPDFById, getComentarios, crearComentario, updateComentario, getHistorial } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

// Helper para iconos de archivos
const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄'; // PDF
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊'; // Excel
    if (['doc', 'docx'].includes(ext)) return '📝'; // Word
    if (['txt'].includes(ext)) return '📃'; // Texto
    return 'TB'; // Default
};

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ot, setOt] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial] = useState([]);

  // Estados para recursos y comentarios
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [mostrarInput, setMostrarInput] = useState(false);

  // Estados para EDICIÓN
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { nombre: "Invitado", rol: "Invitado", id: 0, id_usuarios: 0 };
  const userId = usuario.id_usuarios || usuario.id;

  const rolNormalizado = (usuario.rol || usuario.rol_nombre || "").toLowerCase().trim();
  const isAdmin = rolNormalizado === 'admin' || rolNormalizado === 'administrador';
  const isCliente = usuario.rol_id === 2; 
  const isMantenedor = usuario.rol_id === 3; 

  const canViewHistory = isAdmin || isMantenedor;

  useEffect(() => {
    async function loadData() {
      const otData = await getOTById(id);
      setOt(otData);

      if (otData) {
        const commentsData = await getComentarios(id);
        setComentarios(commentsData);

        if (canViewHistory) {
          const historialData = await getHistorial(id);
          setHistorial(historialData);
        }
      }
    }
    loadData();
  }, [id, canViewHistory]);

  const handleExportPDF = () => {
    if (ot) exportPDFById(ot.id_ot, ot.codigo, usuario);
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() && !archivoSeleccionado) return;

    // Usamos el servicio crearComentario (que acepta el archivo en el parámetro imagen)
    const res = await crearComentario(id, userId, nuevoComentario, archivoSeleccionado);

    if (res) {
      setNuevoComentario("");
      setArchivoSeleccionado(null);
      setMostrarInput(false);
      const updatedComments = await getComentarios(id);
      setComentarios(updatedComments);
    } else {
      alert("No se pudo guardar el recurso/comentario");
    }
  };

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

  // Función para abrir el formulario de recursos
  const irAAgregarRecurso = () => {
      setMostrarInput(true);
      setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
  };

  if (!ot) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando OT...</h2>;

  // Filtrar recursos (cualquier comentario con archivo adjunto)
  const recursos = comentarios.filter(c => c.imagen_url);

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
            
            {/* GRID DE RECURSOS */}
            <div className="recursos-lista" style={{display:'flex', flexWrap:'wrap', gap:'15px', marginTop:'15px', justifyContent:'center'}}>
                {recursos.length === 0 && <p style={{fontSize:'13px', color:'#777'}}>Sin recursos adjuntos.</p>}
                
                {recursos.map((r) => {
                    const isImg = r.imagen_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                    const fileName = r.imagen_url.split('/').pop().split('-').slice(1).join('-'); // Limpia timestamp

                    return (
                        <a key={r.id} href={`${BASE_URL}/${r.imagen_url}`} target="_blank" rel="noreferrer" 
                           className="recurso-item"
                           title={`Subido por: ${r.autor}\nFecha: ${new Date(r.fecha_creacion).toLocaleDateString()}`}
                           style={{
                               display:'flex', flexDirection:'column', alignItems:'center', 
                               width:'90px', textDecoration:'none', color:'#333', fontSize:'11px',
                               padding:'5px', borderRadius:'8px', transition:'background 0.2s'
                           }}
                           onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
                           onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {isImg ? (
                                <img src={`${BASE_URL}/${r.imagen_url}`} style={{width:'60px', height:'60px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd'}} />
                            ) : (
                                <div style={{width:'60px', height:'60px', background:'#e3f2fd', color:'#1565c0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', border:'1px solid #bbdefb'}}>
                                    {getFileIcon(r.imagen_url)}
                                </div>
                            )}
                            <span style={{marginTop:'5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', width:'100%', textAlign:'center'}}>
                                {fileName || 'Archivo'}
                            </span>
                        </a>
                    )
                })}
            </div>

            <div className="recursos-grid" style={{borderTop:'1px solid #eee', paddingTop:'10px', marginTop:'15px'}}>
              <div className="rcard" style={{width:'100%'}}><span>Total Archivos</span><b>{recursos.length}</b></div>
            </div>
          </div>
        </div>

        <div className="botonera">
          {!isCliente && (
            <button onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>Configurar OT</button>
          )}
          
          <button onClick={irAAgregarRecurso}>Agregar Recursos</button>
          <button onClick={handleExportPDF}>Exportar PDF</button>
        </div>

        {/* SECCIÓN HISTORIAL */}
        {canViewHistory && (
          <div className="historial-box">
            <h3>Historial de Auditoría</h3>
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

        {/* SECCIÓN COMENTARIOS Y ARCHIVOS */}
        <div className="comentarios-box">
          <h3>Bitácora y Archivos ({comentarios.length})</h3>

          <div style={{ textAlign: 'left', padding: '0 20px' }}>
            {comentarios.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No hay comentarios aún.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {comentarios.map((c) => {
                  const esMio = String(c.usuarios_id) === String(userId);
                  const isImg = c.imagen_url && c.imagen_url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

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
                          <div style={{ fontSize: '15px', whiteSpace: 'pre-wrap' }}>{c.texto}</div>
                          
                          {/* VISUALIZACIÓN DE ADJUNTO */}
                          {c.imagen_url && (
                            <div style={{ marginTop: '10px' }}>
                              {isImg ? (
                                <a href={`${BASE_URL}/${c.imagen_url}`} target="_blank" rel="noreferrer">
                                  <img
                                    src={`${BASE_URL}/${c.imagen_url}`}
                                    alt="Evidencia"
                                    style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer' }}
                                  />
                                </a>
                              ) : (
                                <a href={`${BASE_URL}/${c.imagen_url}`} target="_blank" rel="noreferrer" 
                                   style={{
                                       display:'inline-flex', alignItems:'center', gap:'8px', 
                                       background:'#e3f2fd', padding:'8px 12px', borderRadius:'6px', 
                                       textDecoration:'none', color:'#0d47a1', border:'1px solid #90caf9'
                                   }}>
                                    <span style={{fontSize:'18px'}}>{getFileIcon(c.imagen_url)}</span>
                                    <span style={{fontWeight:'bold'}}>Descargar Archivo Adjunto</span>
                                </a>
                              )}
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
            <div style={{ marginTop: '20px', padding: '15px', background:'#f8f9fa', borderRadius:'10px', border:'1px solid #ddd' }}>
              <h4 style={{marginTop:0, color:'#444'}}>Agregar Nuevo Recurso</h4>
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario o descripción del archivo..."
                style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '6px', marginBottom:'10px' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap:'wrap' }}>
                <label htmlFor="file-upload" 
                       style={{ 
                           cursor: 'pointer', background: '#333', color:'white', 
                           padding: '8px 15px', borderRadius: '5px', fontSize: '13px', 
                           display: 'flex', alignItems: 'center', gap:'5px', fontWeight:'bold' 
                       }}>
                  📎 Adjuntar Archivo
                </label>
                <input
                  id="file-upload"
                  type="file"
                  // Aceptar variedad de documentos e imágenes
                  accept="image/*, .pdf, .doc, .docx, .xls, .xlsx, .txt, .csv" 
                  onChange={(e) => setArchivoSeleccionado(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                
                {archivoSeleccionado && (
                  <span style={{ fontSize: '13px', color: '#007bff', display: 'flex', alignItems: 'center', background:'white', padding:'5px 10px', borderRadius:'5px', border:'1px solid #cce5ff' }}>
                    {archivoSeleccionado.name}
                    <button onClick={() => setArchivoSeleccionado(null)} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setMostrarInput(false); setArchivoSeleccionado(null); }}
                  style={{ background: '#6c757d', color: 'white', padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}
                >Cancelar</button>
                <button
                  onClick={handleEnviarComentario}
                  style={{ background: '#28a745', color: 'white', padding: '8px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight:'bold' }}
                >Guardar</button>
              </div>
            </div>
          ) : (
            <button className="btn-add" onClick={irAAgregarRecurso} title="Agregar Comentario">
              +
            </button>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}