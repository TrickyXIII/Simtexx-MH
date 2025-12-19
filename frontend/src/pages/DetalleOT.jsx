import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOTById, exportPDFById, getComentarios, crearComentario } from "../services/otService"; // Importamos los nuevos servicios
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ot, setOt] = useState(null);
  const [comentarios, setComentarios] = useState([]); // Estado para comentarios
  const [nuevoComentario, setNuevoComentario] = useState(""); // Input de texto
  const [mostrarInput, setMostrarInput] = useState(false); // Para mostrar/ocultar el input

  const userStr = localStorage.getItem("usuarioActual");
  const usuario = userStr ? JSON.parse(userStr) : { nombre: "Invitado", rol: "Invitado", id: 0, id_usuarios: 0 };

  // Cargar OT y Comentarios
  useEffect(() => {
    async function loadData() {
      const otData = await getOTById(id);
      setOt(otData);

      if (otData) {
        const commentsData = await getComentarios(id);
        setComentarios(commentsData);
      }
    }
    loadData();
  }, [id]);

  const handleExportPDF = () => {
    if (ot) exportPDFById(ot.id_ot, ot.codigo, usuario);
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return;
    
    // Usamos usuario.id_usuarios o usuario.id según cómo lo guarde tu login
    const userId = usuario.id_usuarios || usuario.id; 
    
    const res = await crearComentario(id, userId, nuevoComentario);
    if (res) {
      setNuevoComentario("");
      setMostrarInput(false);
      // Recargar comentarios
      const updatedComments = await getComentarios(id);
      setComentarios(updatedComments);
    } else {
      alert("No se pudo guardar el comentario");
    }
  };

  if (!ot) return <h2 style={{textAlign:'center', marginTop:'50px'}}>Cargando OT...</h2>;

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
          <div className="detalle-item">
            <label>Código:</label>
            <span>{ot.codigo}</span>
          </div>
          <div className="detalle-item">
            <label>Nombre:</label>
            <span>{ot.titulo}</span>
          </div>
          <div className="detalle-item">
            <label>Estado:</label>
            <span>{ot.estado}</span>
          </div>
          <div className="detalle-item">
            <label>Fecha:</label>
            <span>{ot.fecha_inicio_contrato ? ot.fecha_inicio_contrato.slice(0, 10) : '-'}</span>
          </div>
          <div className="detalle-item">
            <label>Cliente:</label>
            <span>{ot.cliente_nombre}</span>
          </div>
          <div className="detalle-item">
            <label>Responsable:</label>
            <span>{ot.responsable_nombre}</span>
          </div>
        </div>
        
        <div className="detalle-main">
          <div className="datos-box">
            <h3>Datos General</h3>
            <div className="datos-grid">
              <div>
                <label>Descripción:</label>
                <p>{ot.descripcion}</p>
              </div>
              <div>
                <label>F. Inicio:</label>
                <p>{ot.fecha_inicio_contrato ? ot.fecha_inicio_contrato.slice(0, 10) : '-'}</p>
              </div>
              <div>
                <label>F. Estimada Fin:</label>
                <p>{ot.fecha_fin_contrato ? ot.fecha_fin_contrato.slice(0, 10) : '-'}</p>
              </div>
              <div>
                <label>Estado Actual:</label>
                <p>{ot.estado}</p>
              </div>
            </div>
          </div>
          
          <div className="recursos-box">
            <h3>Recursos Adjuntos</h3>
            <div className="recursos-grid">
              <div className="rcard"><span>Imágenes</span><b>0</b></div>
              <div className="rcard"><span>Enlaces</span><b>0</b></div>
              <div className="rcard"><span>Archivos</span><b>0</b></div>
            </div>
          </div>
        </div>
        
        <div className="botonera">
          <button onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>
            Configurar OT
          </button>
          <button>Agregar Recursos</button>
          <button onClick={handleExportPDF}>Exportar PDF</button>
        </div>
        
        <div className="historial-box">
          <h3>Historial de Actualizaciones</h3>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Responsable</th>
              </tr>
            </thead>
            {/* Pendiente implementar Historial */}
          </table>
        </div>
        
        {/* SECCIÓN COMENTARIOS */}
        <div className="comentarios-box">
          <h3>Comentarios ({comentarios.length})</h3>

          <div style={{ textAlign: 'left', padding: '0 20px' }}>
            {comentarios.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>No hay comentarios aún.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {comentarios.map((c) => (
                  <li key={c.id} style={{ 
                    background: '#f9f9f9', 
                    marginBottom: '10px', 
                    padding: '10px', 
                    borderRadius: '8px',
                    borderLeft: '4px solid #333'
                  }}>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                      <b>{c.autor}</b> - {new Date(c.fecha_creacion).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '15px' }}>{c.texto}</div>
                  </li>
                ))}
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent:'flex-end' }}>
                <button 
                  onClick={() => setMostrarInput(false)}
                  style={{ background: '#888', color: 'white', padding: '8px 15px', borderRadius: '5px', border:'none', cursor:'pointer' }}
                >Cancelar</button>
                <button 
                  onClick={handleEnviarComentario}
                  style={{ background: '#2e7d32', color: 'white', padding: '8px 15px', borderRadius: '5px', border:'none', cursor:'pointer' }}
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