import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { getAuditoriaGlobal } from "../services/otService";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Reutilizamos estilos del dashboard para coherencia

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
      <div className="container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h1 style={{ color: "#333", fontSize: "24px" }}>Registro de Auditoría Global</h1>
            <button 
              onClick={() => navigate(-1)} 
              style={{ 
                padding: "8px 16px", 
                cursor: "pointer", 
                background: "#6c757d", 
                color: "white", 
                border: "none", 
                borderRadius: "5px" 
              }}
            >
              Volver
            </button>
        </div>

        {cargando ? (
          <p style={{ textAlign: "center", marginTop: "40px" }}>Cargando registros...</p>
        ) : (
          <div style={{ overflowX: "auto", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px", background: "white" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
              <thead style={{ background: "#007bff", color: "white" }}>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>Fecha</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Usuario (Autor)</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Acción</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Descripción / Detalle</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>No hay registros disponibles.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id_auditoria} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "10px", fontSize: "14px" }}>
                        {log.fecha_formateada || new Date(log.fecha_creacion).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px", fontWeight: "bold", color: "#444" }}>
                        {log.autor || "Sistema"}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <span style={{ 
                            padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold",
                            background: log.accion.includes("ELIMINAR") || log.accion.includes("DESACTIVAR") ? "#ffebee" : 
                                        log.accion.includes("CREAR") ? "#e8f5e9" : "#e3f2fd",
                            color: log.accion.includes("ELIMINAR") || log.accion.includes("DESACTIVAR") ? "#c62828" : 
                                   log.accion.includes("CREAR") ? "#2e7d32" : "#1565c0"
                        }}>
                            {log.accion}
                        </span>
                      </td>
                      <td style={{ padding: "10px", maxWidth: "400px", fontSize: "14px", color: "#555" }}>
                        {log.descripcion}
                      </td>
                      <td style={{ padding: "10px", color: "#888", fontSize: "12px" }}>
                        {log.ip_address || "-"}
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