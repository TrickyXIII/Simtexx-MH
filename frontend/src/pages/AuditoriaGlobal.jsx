import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { getAuditoriaGlobal } from "../services/otService";
import { useNavigate } from "react-router-dom";
import "./AuditoriaGlobal.css";
import "./DetalleOT.css"; // Reutilizamos el botón volver

export default function AuditoriaGlobal() {
  const [logs, setLogs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const data = await getAuditoriaGlobal();
      setLogs(data);
      setCargando(false);
    }
    fetchData();
  }, []);

  return (
    <>
      <NavBar />
      <div className="auditoria-container">
        
        <div className="auditoria-header" style={{position: 'relative', display:'flex', justifyContent: 'center', alignItems:'center', minHeight:'60px'}}>
            <button onClick={() => navigate(-1)} className="btn-volver-std" style={{position: 'absolute', left: 0}}>
              ⬅ Volver
            </button>
            <h1 className="titulo-auditoria">Auditoría Global</h1>
        </div>

        {cargando ? (
          <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando registros...</p>
        ) : (
          <div className="tabla-audit-box">
            <table className="tabla-audit">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center" }}>No hay registros.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id_auditoria}>
                      <td>
                        {log.fecha_formateada || new Date(log.fecha_creacion).toLocaleString()}
                      </td>
                      <td style={{fontWeight: "bold"}}>
                        {log.autor || "Sistema"}
                      </td>
                      <td>
                        <span className="accion-badge" style={{
                            background: log.accion.includes("ELIMINAR") || log.accion.includes("DESACTIVAR") ? "#ffebee" : 
                                        log.accion.includes("CREAR") ? "#e8f5e9" : "#e3f2fd",
                            color: log.accion.includes("ELIMINAR") || log.accion.includes("DESACTIVAR") ? "#c62828" : 
                                   log.accion.includes("CREAR") ? "#2e7d32" : "#1565c0"
                        }}>
                            {log.accion}
                        </span>
                      </td>
                      <td style={{ maxWidth: "400px" }}>
                        {log.descripcion}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}