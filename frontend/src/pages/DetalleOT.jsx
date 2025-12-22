import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import { getOTById, exportPDFById, getComentarios, crearComentario, updateComentario, getHistorial } from "../services/otService";
import { getUserFromToken } from "../utils/auth"; 
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄'; 
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊'; 
    if (['doc', 'docx'].includes(ext)) return '📝'; 
    return '📎'; 
};

const getResourceUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${BASE_URL}/${url}`;
};

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ot, setOt] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [historial, setHistorial] = useState([]);

  // Estados Input
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null); 
  const [mostrarInput, setMostrarInput] = useState(false);

  // Estados Edición
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  const usuario = getUserFromToken() || { nombre: "Invitado", rol: "Invitado", id: 0, rol_id: 0 };
  const userId = usuario.id;
  const isAdmin = usuario.rol_id === 1;
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; 
      if (file.size > maxSize) {
        alert("El archivo excede el tamaño máximo permitido de 10MB.");
        e.target.value = null;
        setArchivoSeleccionado(null);
        return;
      }
      setArchivoSeleccionado(file);
    }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() && !archivoSeleccionado) return;
    if (nuevoComentario.length > 1000) return alert("Máximo 1000 caracteres.");

    const res = await crearComentario(id, userId, nuevoComentario, archivoSeleccionado);
    if (res) {
      setNuevoComentario("");
      setArchivoSeleccionado(null);
      setMostrarInput(false);
      const updated = await getComentarios(id);
      setComentarios(updated);
    } else {
      alert("No se pudo guardar.");
    }
  };

  const iniciarEdicion = (c) => { setEditandoId(c.id); setTextoEditado(c.texto); };
  const cancelarEdicion = () => { setEditandoId(null); setTextoEditado(""); };
  const guardarEdicion = async (comentarioId) => {
    if (!textoEditado.trim()) return;
    const res = await updateComentario(comentarioId, userId, textoEditado);
    if (res) {
      setEditandoId(null);
      const updated = await getComentarios(id);
      setComentarios(updated);
    } else {
      alert("Error al editar.");
    }
  };

  const irAAgregarRecurso = () => {
      setMostrarInput(true);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  if (!ot) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Cargando OT...</h2>;

  const recursos = comentarios.filter(c => c.imagen_url);

  return (
    <>
      <NavBar />

      <div className="detalle-container">

        {/* --- TÍTULO SUPERIOR --- */}
        <div className="titulo-header">
          <button className="btn-volver-std" onClick={() => navigate(-1)}>
            ⬅ Volver
          </button>
          <h1 className="titulo">Detalle de Orden {ot.codigo}</h1>
        </div>

        {/* --- 1. ENCABEZADO --- */}
        <div className="caja-estilo detalle-header">
          <div className="detalle-item"><label>Código</label><span>{ot.codigo}</span></div>
          <div className="detalle-item"><label>Título</label><span>{ot.titulo}</span></div>
          <div className="detalle-item"><label>Estado</label><span>{ot.estado}</span></div>
          <div className="detalle-item"><label>Inicio Contrato</label><span>{ot.fecha_inicio_contrato ? ot.fecha_inicio_contrato.slice(0, 10) : '-'}</span></div>
          <div className="detalle-item"><label>Cliente</label><span>{ot.cliente_nombre}</span></div>
          <div className="detalle-item"><label>Responsable</label><span>{ot.responsable_nombre || "Sin asignar"}</span></div>
        </div>

        {/* --- 2. MAIN --- */}
        <div className="detalle-main">
          
          <div className="caja-estilo">
            <h3 className="caja-titulo">Información General</h3>
            <div className="datos-grid">
              <div><label>Descripción:</label><p>{ot.descripcion}</p></div>
              <div><label>Término Estimado:</label><p>{ot.fecha_fin_contrato ? ot.fecha_fin_contrato.slice(0, 10) : 'Indefinido'}</p></div>
              <div><label>Estado Actual:</label><p>{ot.estado}</p></div>
              <div><label>Última Actualización:</label><p>{new Date(ot.fecha_actualizacion).toLocaleDateString()}</p></div>
            </div>
          </div>

          <div className="caja-estilo">
            <h3 className="caja-titulo">Recursos Adjuntos</h3>
            
            <div className="recursos-lista">
                {recursos.length === 0 && <p style={{fontSize:'13px', color:'#777'}}>Sin adjuntos.</p>}
                
                {recursos.map((r) => {
                    const url = getResourceUrl(r.imagen_url);
                    const isImg = url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes("cloudinary");

                    return (
                        <a key={r.id} href={url} target="_blank" rel="noreferrer" className="recurso-item" title={r.autor}>
                            {isImg ? (
                                <img src={url} style={{width:'50px', height:'50px', objectFit:'cover', borderRadius:'4px'}} />
                            ) : (
                                <div style={{fontSize:'30px'}}>{getFileIcon(r.imagen_url)}</div>
                            )}
                            <span style={{fontSize:'10px', marginTop:'5px', textAlign:'center', width:'100%', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                Archivo
                            </span>
                        </a>
                    )
                })}
            </div>

            <div className="recursos-footer">
              <span style={{color: '#666'}}>Archivos Totales</span>
              <div className="rcard"><b>{recursos.length}</b></div>
            </div>
          </div>
        </div>

        {/* --- 3. BOTONERA --- */}
        <div className="botonera">
          {!isCliente && (
            <button className="btn-accion btn-negro" onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>
              Configurar OT
            </button>
          )}
          <button className="btn-accion btn-negro" onClick={irAAgregarRecurso}>
            + Agregar Recurso
          </button>
          <button className="btn-accion btn-azul" onClick={handleExportPDF}>
            Descargar PDF
          </button>
        </div>

        {/* --- 4. HISTORIAL --- */}
        {canViewHistory && (
          <div className="caja-estilo">
            <h3 className="caja-titulo">Historial de Auditoría</h3>
            {historial.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888' }}>Sin movimientos recientes.</p>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table className="historial-tabla">
                  <thead>
                    <tr><th>Fecha</th><th>Detalle</th><th>Responsable</th></tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => (
                      <tr key={h.id_auditoria || Math.random()}>
                        <td>{new Date(h.fecha_cambio).toLocaleString()}</td>
                        <td><strong>{h.accion}</strong> - {h.detalles}</td>
                        <td>{h.responsable_nombre || "Sistema"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- 5. COMENTARIOS --- */}
        <div className="caja-estilo">
          <h3 className="caja-titulo">Bitácora de Proyecto ({comentarios.length})</h3>

          <ul className="comentarios-lista">
            {comentarios.length === 0 && <p style={{ color: '#888', textAlign:'center' }}>No hay entradas en la bitácora.</p>}
            
            {comentarios.map((c) => {
              const esMio = String(c.usuarios_id) === String(userId);
              const url = getResourceUrl(c.imagen_url);
              const isImg = url && (url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes("cloudinary"));

              return (
                <li key={c.id} className="comentario-fila">
                  <div className="comentario-header">
                    <span><b>{c.autor}</b> - {new Date(c.fecha_creacion).toLocaleString()} {c.fecha_edicion && "(Editado)"}</span>
                    {esMio && editandoId !== c.id && (
                      <button onClick={() => iniciarEdicion(c)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff', fontWeight:'bold' }}>Editar</button>
                    )}
                  </div>

                  {editandoId === c.id ? (
                    <div>
                      <textarea 
                        value={textoEditado} 
                        onChange={(e) => setTextoEditado(e.target.value)} 
                        style={{ width: '100%', padding: '10px', border:'1px solid #ccc', borderRadius:'4px' }} 
                        maxLength={1000}
                      />
                      <div style={{textAlign:'right', fontSize:'0.8rem', color: textoEditado.length > 900 ? 'red' : '#666'}}>
                        {textoEditado.length}/1000
                      </div>
                      <div style={{ marginTop: '5px', textAlign: 'right', gap:'10px', display:'flex', justifyContent:'flex-end' }}>
                        <button onClick={cancelarEdicion} style={{cursor:'pointer', padding:'5px 10px'}}>Cancelar</button>
                        <button onClick={() => guardarEdicion(c.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="comentario-texto">{c.texto}</div>
                      {c.imagen_url && (
                        <div style={{ marginTop: '10px' }}>
                          {isImg ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt="Adjunto" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </a>
                          ) : (
                            <a href={url} target="_blank" rel="noreferrer" style={{color:'#007bff', textDecoration:'none', fontWeight:'bold'}}>
                                📎 Ver Archivo Adjunto
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

          {mostrarInput ? (
            <div className="nuevo-comentario-wrapper">
              <h4 style={{marginTop:0, marginBottom:'10px', color:'#333'}}>Nueva Entrada</h4>
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing:'border-box' }}
                maxLength={1000}
              />
              <div style={{textAlign:'right', fontSize:'0.8rem', color: nuevoComentario.length > 900 ? 'red' : '#666', marginBottom:'5px'}}>
                {nuevoComentario.length}/1000 caracteres
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap:'10px' }}>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <input type="file" onChange={handleFileChange} style={{fontSize:'0.9rem'}}/>
                    <small style={{fontSize:'0.75rem', color:'#666'}}>Máx. 10MB (Img, PDF, Doc, Excel)</small>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setMostrarInput(false); setArchivoSeleccionado(null); }} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
                  <button onClick={handleEnviarComentario} style={{ background: 'rgb(172, 5, 5)', color: 'white', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight:'bold' }}>Publicar</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{textAlign:'center', marginTop:'20px'}}>
                <button className="btn-add-circle" onClick={irAAgregarRecurso} title="Agregar Comentario">
                +
                </button>
            </div>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}