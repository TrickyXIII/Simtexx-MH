import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "./Dashboard.css";
import { getOTs, getDashboardStats } from "../services/otService"; 
import { Link } from "react-router-dom";
import { getUserFromToken } from "../utils/auth"; 

const Dashboard = () => {
  const [ots, setOts] = useState([]);
  const [stats, setStats] = useState({
    total: 0, pendientes: 0, en_proceso: 0, finalizadas: 0
  });

  const usuario = getUserFromToken() || { nombre: "Invitado", rol: "Invitado", id: 0, rol_id: 0 };
  const isCliente = usuario.rol_id === 2; // Cliente no ve botón usuarios

  useEffect(() => {
    async function cargarDatos() {
      // 1. Cargar Estadísticas
      const estadisticas = await getDashboardStats();
      if(estadisticas) setStats(estadisticas);

      // 2. Cargar lista de OTs (Solo las últimas 5 para la tabla)
      const listaOts = await getOTs({});
      if (Array.isArray(listaOts)) {
        setOts(listaOts.slice(0, 5)); 
      }
    }
    cargarDatos();
  }, []);

  return (
    <>
      <NavBar />
      <div className="dashboard-wrapper">
        
        {/* --- SECCIÓN 1: BOTONES DE ACCIÓN SUPERIOR --- */}
        <div className="action-buttons-container">
          <Link to="/crear-ot" className="big-action-btn">
            Crear OT
          </Link>
          
          <Link to="/lista-ot" className="big-action-btn">
            Órdenes de Trabajo
          </Link>
          
          {!isCliente && (
            <Link to="/GestionUser" className="big-action-btn">
              Usuarios
            </Link>
          )}
        </div>

        {/* --- SECCIÓN 2: PANEL RESUMEN DE OT (TARJETAS) --- */}
        <div className="stats-section-container">
          <h2 className="section-title">Panel Resumen de OT</h2>
          
          <div className="cards-row">
            {/* Total (Negro) */}
            <div className="stat-card card-total">
              <span className="stat-label">Total</span>
              <span className="stat-number">{stats.total}</span>
            </div>

            {/* Pendiente (Amarillo) */}
            <div className="stat-card card-pendiente">
              <span className="stat-label">Pendientes</span>
              <span className="stat-number">{stats.pendientes}</span>
            </div>

            {/* En Proceso (Azul) */}
            <div className="stat-card card-proceso">
              <span className="stat-label">En Proceso</span>
              <span className="stat-number">{stats.en_proceso}</span>
            </div>

            {/* Finalizada (Verde) */}
            <div className="stat-card card-finalizada">
              <span className="stat-label">Finalizadas</span>
              <span className="stat-number">{stats.finalizadas}</span>
            </div>
          </div>
        </div>

        {/* --- SECCIÓN 3: ÚLTIMAS ÓRDENES (FONDO ROJO) --- */}
        <div className="recent-orders-container">
          <div className="red-header-strip">
            <h3>Últimas Órdenes Registradas</h3>
          </div>
          
          <div className="table-white-bg">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ots.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No hay actividad reciente.</td></tr>
                ) : (
                  ots.map((ot) => (
                    <tr key={ot.id_ot}>
                      <td><strong>{ot.codigo}</strong></td>
                      <td>{ot.titulo}</td>
                      <td>
                        <span className={`badge-estado ${ot.estado.toLowerCase().replace(' ', '-')}`}>
                          {ot.estado}
                        </span>
                      </td>
                      <td>{ot.responsable_nombre || "Sin Asignar"}</td>
                      <td>
                         <Link to={`/detalle/${ot.id_ot}`} className="btn-ver-link">Ver Detalle</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Dashboard;