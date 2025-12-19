import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Importamos useNavigate
import { getOTById } from "../services/otService";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./DetalleOT.css"; // Importante: Asegura que este archivo exista

export default function DetalleOT() {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook para navegar
  const [ot, setOt] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const datos = await getOTById(id);
        setOt(datos);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  // Función para volver atrás (Solución al botón que no servía)
  const handleVolver = () => {
    navigate(-1); // Esto es igual a dar clic en "Atrás" en el navegador
  };

  if (cargando) return <div className="loading-screen">Cargando...</div>;

  if (!ot) {
    return (
      <>
        <NavBar />
        <div className="error-screen">
            <h2>OT no encontrada</h2>
            <button onClick={handleVolver} className="btn-volver">Volver</button>
        </div>
        <Footer />
      </>
    );
  }

  // Formato de fechas limpio
  const fechaInicio = ot.fecha_inicio_contrato ? new Date(ot.fecha_inicio_contrato).toLocaleDateString() : "N/A";
  const fechaFin = ot.fecha_fin_contrato ? new Date(ot.fecha_fin_contrato).toLocaleDateString() : "N/A";

  return (
    <>
      <NavBar />
      
      {/* Contenedor principal que centra todo */}
      <div className="detalle-main-container">
        
        {/* Tarjeta blanca flotante */}
        <div className="detalle-card">
            
            <div className="detalle-header">
                <h1>{ot.titulo}</h1>
                <span className={`estado-badge ${ot.estado}`}>{ot.estado}</span>
            </div>

            <div className="detalle-content">
                <div className="dato-group">
                    <label>Código:</label>
                    <p>{ot.codigo}</p>
                </div>

                <div className="dato-group full-width">
                    <label>Descripción:</label>
                    <div className="descripcion-box">
                        {ot.descripcion}
                    </div>
                </div>

                <div className="fila-fechas">
                    <div className="dato-group">
                        <label>Fecha Inicio:</label>
                        <p>{fechaInicio}</p>
                    </div>
                    <div className="dato-group">
                        <label>Fecha Fin:</label>
                        <p>{fechaFin}</p>
                    </div>
                </div>

                <div className="dato-group">
                    <label>Responsable ID:</label>
                    <p>{ot.responsable_id}</p>
                </div>
            </div>

            <div className="detalle-footer">
                {/* Botón de Editar */}
                <Link to={`/ModificarOT/${ot.id_ot || ot.id}`} className="btn-editar">
                    ✏️ Editar OT
                </Link>
                
                {/* Botón de Volver ARREGLADO */}
                <button onClick={handleVolver} className="btn-volver">
                    ⬅ Volver al Listado
                </button>
            </div>
        </div>
      </div>

      <Footer />
    </>
  );
}