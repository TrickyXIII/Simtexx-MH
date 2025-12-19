import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOTById } from "../services/otService";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "./DetalleOT.css";

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ot, setOt] = useState(null);

  useEffect(() => {
    async function loadOT() {
      const data = await getOTById(id);
      setOt(data);
    }
    loadOT();
  }, [id]);

  if (!ot) return <h2>Cargando OT...</h2>;
  // BASE URL del backend para OT
  const API_URL = "http://localhost:4000/api";

  //Botón Exportar PDF
  const handleExportPDF = () => {
    window.open(`${API_URL}/pdf/ot/${ot.id_ot}/export`, "_blank");
  };

  //Botón Exportar CSV/Excel
  const handleExportCSV = () => {
    window.open(`${API_URL}/ot/${ot.id_ot}/export/csv`, "_blank");
  };

  if (!ot) return <h2>OT no encontrada</h2>;

  return (
    <>
      <NavBar />

      <div className="detalle-container">

        <h1 className="titulo">Detalle de Orden</h1>

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
            <span>{ot.fecha_inicio_contrato}</span>
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
                <p>{ot.fecha_inicio_contrato}</p>
              </div>

              <div>
                <label>F. Estimada Fin:</label>
                <p>{ot.fecha_fin_contrato}</p>
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
              <div className="rcard">
                <span>Imágenes</span>
                {/** <b>{ot.imagenes.length}</b>*/}
              </div>

              <div className="rcard">
                <span>Enlaces</span>
                <b>0</b>
              </div>

              <div className="rcard">
                <span>Archivos</span>
                <b>0</b>
              </div>
            </div>
          </div>

        </div>

        
        <div className="botonera">
          <button onClick={() => navigate(`/ModificarOT/${ot.id_ot}`)}>
            Configurar OT
          </button>

          <button>
            Agregar Recursos
          </button>

          {/* 🔹 Conectados al backend */}
          <button onClick={handleExportPDF}>
            Exportar PDF
          </button>

          <button onClick={handleExportCSV}>
            Exportar CSV
          </button>

          
          <button onClick={() => navigate(`/dashboard`)}>
            inicio
          </button>
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

            {/** <tbody>
              {ot.historial.map((h, i) => (
                <tr key={i}>
                  <td>{h.fecha}</td>
                  <td>{h.msg}</td>
                  <td>{ot.responsable}</td>
                </tr>
              ))}
            </tbody>*/}
          </table>
        </div>

        
        <div className="comentarios-box">
          <h3>Comentarios</h3>

          {/** <ul>
            {ot.comentarios.map((c, i) => (
              <li key={i}>
                <b>{c.autor}:</b> {c.texto}
              </li>
            ))}
          </ul>*/}

          <button className="btn-add">+</button>
        </div>

      </div>

      <Footer />
    </>
  );
}
