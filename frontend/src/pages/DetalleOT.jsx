import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

import { getOTById, exportPDFById, getComentarios, crearComentario, updateComentario, getHistorial } from "../services/otService";
import { getUserFromToken } from "../utils/auth";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

// Helper para iconos
const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄'; 
    if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊'; 
    if (['doc', 'docx'].includes(ext)) return '📝'; 
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return '🖼️';
    return '📎'; 
};

// Helper URLs
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

  // Formulario Comentario
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null); 
  const [mostrarInput, setMostrarInput] = useState(false);

  // Edición Comentario
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState("");

  const usuario = getUserFromToken() || { nombre: "Invitado", rol: "Invitado", id: 0, rol_id: 0 };
  const userId = usuario.id;
  const isCliente = usuario.rol_id === 2;
  const isMantenedor = usuario.rol_id === 3;
  const isAdmin = usuario.rol_id === 1;
  const canViewHistory = isAdmin || isMantenedor;

  useEffect(() => {
    async function loadData() {
      try {
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
      } catch (e) {
        console.error("Error cargando detalle", e);
      }
    }
    loadData();
  }, [id, canViewHistory]);

  const handleExportPDF = () => {
    if (ot) exportPDFById(ot.id_ot, ot.codigo, usuario);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      alert("El archivo excede el tamaño máximo permitido de 10MB.");
      e.target.value = null;
      setArchivoSeleccionado(null);
      return;
    }
    setArchivoSeleccionado(file || null);
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
      alert("Error al guardar comentario.");
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

  if (!ot) return <div style={{textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

  const recursos = comentarios.filter(c => c.imagen_url);

  return (
    <>
      <NavBar />
      
      <div className="detalle-wrapper">
        
        {/* 1. HEADER SUPERIOR */}
        <div className="top-header">
          <button className="btn-volver-outline" onClick={() => navigate(-1)}>
            ⬅ Volver
          </button>
          <h1 className="titulo-pagina">OT: {ot.codigo}</h1>
          <span className={`badge ${ot.estado.toLowerCase().replace(' ', '-')}`}>
            {ot.estado}
          </span>
        </div>

        {/* 2. TARJETAS DE RESUMEN (GRID) */}
        <div className="info-summary-grid">
          <div className="info-card red-accent">
            <label>Cliente</label>
            <span>{ot.cliente_nombre || "N/A"}</span>
          </div>
          <div className="info-card blue-accent">
            <label>Responsable</label>
            <span>{ot.responsable_nombre || "Sin Asignar"}</span>
          </div>
          <div className="info-card">
            <label>Fecha Inicio</label>
            <span>{ot.fecha_inicio_contrato ? new Date(ot.fecha_inicio_contrato).toLocaleDateString() : '-'}</span>
          </div>
          <div className="info-card">
            <label>Fecha Fin</label>
            <span>{ot.fecha_fin_contrato ? new Date(ot.fecha_fin_contrato).toLocaleDateString() : '-'}</span>
          </div>
        </div>

        {/* 3. BOTONERA DE ACCIONES */}
        <div className="actions-bar">
          {!isCliente && (
            <button className="btn-action btn-config" onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>
              ⚙ Configurar OT
            </button>
          )}
          <button className="btn-action btn-recurso" onClick={irAAgregarRecurso}>
            📎 Agregar Recurso
          </button>
          <button className="btn-action btn-pdf" onClick={handleExportPDF}>
            📄 Exportar PDF
          </button>
        </div>

        {/* 4. CONTENIDO PRINCIPAL (2 Columnas) */}
        <div className="main-content-grid">
          
          {/* Izquierda: Descripción */}
          <div className="content-box">
            <h3 className="box-header">Descripción del Trabajo</h3>
            <div className="desc-text">
              {ot.descripcion || "Sin descripción detallada."}
            </div>
          </div>

          {/* Derecha: Recursos */}
          <div className="content-box">
            <h3 className="box-header">Archivos Adjuntos ({recursos.length})</h3>
            <div className="recursos-list">
              {recursos.length === 0 && <p style={{color:'#777', fontStyle:'italic'}}>No hay archivos.</p>}
              {recursos.map(r => {
                 const url = getResourceUrl(r.imagen_url);
                 return (
                   <a key={r.id} href={url} target="_blank" rel="noreferrer" className="recurso-link">
                     <span className="recurso-icon">{getFileIcon(r.imagen_url)}</span>
                     <div className="recurso-info">
                       <span className="recurso-name">Archivo Adjunto</span>
                       <span className="recurso-meta">{new Date(r.fecha_creacion).toLocaleDateString()} - {r.autor}</span>
                     </div>
                   </a>
                 )
              })}
            </div>
          </div>
        </div>

        {/* 5. HISTORIAL DE CAMBIOS (Tabla) */}
        {canViewHistory && (
          <div className="content-box">
            <h3 className="box-header">Historial de Cambios</h3>
            <div style={{overflowX: 'auto'}}>
              <table className="historial-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr><td colSpan="3" style={{textAlign:'center'}}>Sin registros.</td></tr>
                  ) : (
                    historial.map((h) => (
                      <tr key={h.id_auditoria || Math.random()}>
                        <td>{new Date(h.fecha_cambio).toLocaleString()}</td>
                        <td>
                          <strong>{h.accion}</strong> 
                          {h.detalles && <div style={{fontSize:'0.85em', color:'#666'}}>{h.detalles}</div>}
                        </td>
                        <td>{h.responsable_nombre || "Sistema"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. BITÁCORA / COMENTARIOS */}
        <div className="content-box">
          <h3 className="box-header">Bitácora de Comentarios</h3>
          
          <ul className="comentarios-list">
            {comentarios.length === 0 && <p style={{color:'#888'}}>Aún no hay comentarios en la bitácora.</p>}
            
            {comentarios.map((c) => {
              const esMio = String(c.usuarios_id) === String(userId);
              const url = getResourceUrl(c.imagen_url);
              const isImg = url && (url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.includes("cloudinary"));

              return (
                <li key={c.id} className="comentario-item">
                  <div className="comentario-header">
                    <span><b>{c.autor}</b> • {new Date(c.fecha_creacion).toLocaleString()}</span>
                    {esMio && editandoId !== c.id && (
                      <button onClick={() => iniciarEdicion(c)} style={{border:'none', background:'transparent', color:'#007bff', cursor:'pointer', fontWeight:'bold'}}>Editar</button>
                    )}
                  </div>

                  {editandoId === c.id ? (
                    <div>
                      <textarea 
                        className="input-area" 
                        value={textoEditado} 
                        onChange={(e) => setTextoEditado(e.target.value)} 
                        maxLength={1000}
                      />
                      <div style={{marginTop:'10px', display:'flex', gap:'10px', justifyContent:'flex-end'}}>
                        <button onClick={cancelarEdicion} style={{padding:'5px 10px'}}>Cancelar</button>
                        <button onClick={() => guardarEdicion(c.id)} style={{padding:'5px 10px', background:'#28a745', color:'white', border:'none', borderRadius:'4px'}}>Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="comentario-body">
                      {c.texto}
                      {c.imagen_url && (
                        <div style={{marginTop:'10px'}}>
                           {isImg ? (
                             <a href={url} target="_blank" rel="noreferrer">
                               <img src={url} alt="Adjunto" style={{maxWidth:'150px', borderRadius:'6px', border:'1px solid #ccc'}} />
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
              )
            })}
          </ul>

          {/* INPUT NUEVO COMENTARIO (Toggle) */}
          {mostrarInput ? (
            <div className="nuevo-comentario-box">
              <h4 style={{marginTop:0}}>Nuevo Comentario</h4>
              <textarea
                className="input-area"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe aquí..."
                maxLength={1000}
              />
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px'}}>
                <input type="file" onChange={handleFileChange} />
                <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => setMostrarInput(false)} style={{padding:'8px 15px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Cancelar</button>
                  <button onClick={handleEnviarComentario} style={{padding:'8px 15px', background:'#28a745', color:'white', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>Publicar</button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={irAAgregarRecurso} 
              style={{marginTop:'20px', width:'100%', padding:'12px', border:'2px dashed #ccc', background:'transparent', color:'#666', fontWeight:'bold', cursor:'pointer', borderRadius:'6px'}}
            >
              + Agregar Comentario a la Bitácora
            </button>
          )}
        </div>

      </div>
      <Footer />
    </>
  );
}